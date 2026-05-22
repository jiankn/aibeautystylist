import type { R2BucketLike, RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';

export interface StoredUploadRef {
  provider: 'mock' | 'r2';
  stored: boolean;
  key?: string;
  mimeType?: string;
  byteLength?: number;
  error?: string;
}

interface StoreTryOnPhotoInput {
  env?: RuntimeEnv;
  photoBase64?: string;
  ipAddress?: string;
  now?: Date;
}

const dataUrlPattern = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

function parseBase64Image(photoBase64: string): { bytes: Uint8Array; mimeType: string } {
  const match = photoBase64.match(dataUrlPattern);
  const mimeType = match?.[1] ?? 'image/jpeg';
  const cleanBase64 = match?.[2] ?? photoBase64;

  if (typeof Buffer !== 'undefined') {
    return {
      bytes: Uint8Array.from(Buffer.from(cleanBase64, 'base64')),
      mimeType,
    };
  }

  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, mimeType };
}

function getUploadProvider(env?: RuntimeEnv): 'mock' | 'r2' {
  const configured = getRuntimeValue(env, 'UPLOAD_PROVIDER') ?? import.meta.env.UPLOAD_PROVIDER ?? 'mock';
  return configured === 'r2' ? 'r2' : 'mock';
}

function makePhotoKey(now: Date): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `tryon/${yyyy}/${mm}/${dd}/${crypto.randomUUID()}.jpg`;
}

async function storeInR2(
  bucket: R2BucketLike,
  photoBase64: string,
  ipAddress: string | undefined,
  now: Date,
): Promise<StoredUploadRef> {
  const { bytes, mimeType } = parseBase64Image(photoBase64);
  const key = makePhotoKey(now);

  await bucket.put(key, bytes, {
    httpMetadata: { contentType: mimeType },
    customMetadata: {
      purpose: 'tryon_source_photo',
      uploadedAt: now.toISOString(),
      ipHint: ipAddress ? ipAddress.slice(0, 64) : 'unknown',
    },
  });

  return {
    provider: 'r2',
    stored: true,
    key,
    mimeType,
    byteLength: bytes.byteLength,
  };
}

export async function storeTryOnPhoto(input: StoreTryOnPhotoInput): Promise<StoredUploadRef> {
  const { env, photoBase64, ipAddress, now = new Date() } = input;
  if (!photoBase64) {
    return { provider: 'mock', stored: false };
  }

  const provider = getUploadProvider(env);
  if (provider !== 'r2') {
    return { provider: 'mock', stored: false };
  }

  if (!env?.USER_UPLOADS) {
    return {
      provider: 'mock',
      stored: false,
      error: 'UPLOAD_PROVIDER=r2 but USER_UPLOADS binding is not available.',
    };
  }

  try {
    return await storeInR2(env.USER_UPLOADS, photoBase64, ipAddress, now);
  } catch (error) {
    return {
      provider: 'mock',
      stored: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteTryOnPhoto(env: RuntimeEnv | undefined, key: string): Promise<boolean> {
  if (!key.startsWith('tryon/')) return false;
  if (!env?.USER_UPLOADS) return false;
  await env.USER_UPLOADS.delete(key);
  return true;
}
