/**
 * Password Service — Web Crypto PBKDF2
 *
 * 运行环境为 Cloudflare Workers，使用内置 Web Crypto API，避免 Node crypto 依赖。
 */

const PBKDF2_ITERATIONS = 210_000;
const HASH_ALGORITHM = 'SHA-256';
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const PASSWORD_PREFIX = 'pbkdf2-sha256';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { ok: true } | { ok: false; error: string } {
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (password.length > 128) return { ok: false, error: 'Password is too long.' };
  return { ok: true };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await derivePasswordKey(password, salt, PBKDF2_ITERATIONS);
  return `${PASSWORD_PREFIX}$${PBKDF2_ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(new Uint8Array(key))}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== PASSWORD_PREFIX) return false;

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 100_000) return false;

  const salt = base64UrlDecode(parts[2]);
  const expected = base64UrlDecode(parts[3]);
  const actual = new Uint8Array(await derivePasswordKey(password, salt, iterations));

  return timingSafeEqual(actual, expected);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSecureToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}

async function derivePasswordKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<ArrayBuffer> {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: HASH_ALGORITHM,
      salt: saltBuffer,
      iterations,
    },
    keyMaterial,
    HASH_BYTES * 8,
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}
