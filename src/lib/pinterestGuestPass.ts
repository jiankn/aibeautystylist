import type { AstroCookies } from "astro";

import { getClientIp } from "./rateLimit";
import type { D1DatabaseLike } from "./runtime";
import { generateToken, hashToken } from "./tokens";

export const PINTEREST_GUEST_COOKIE = "abs_pin_guest";
export const PINTEREST_GUEST_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface PinterestGuestPass {
  id: string;
  tokenHash: string;
  guestUserId: string;
  source?: string;
  utmContent?: string;
  clientKeyHash?: string;
  userAgentHash?: string;
  uploadId?: string;
  jobId?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  completedAt?: string;
}

export interface PinterestGuestPassPublicState {
  available: boolean;
  used: boolean;
  remaining: 0 | 1;
  expiresAt: string;
  uploadId?: string;
  jobId?: string;
  source?: string;
  utmContent?: string;
}

interface PinterestGuestPassRow {
  id: string;
  token_hash: string;
  guest_user_id: string;
  source: string | null;
  utm_content: string | null;
  client_key_hash: string | null;
  user_agent_hash: string | null;
  upload_id: string | null;
  job_id: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  completed_at: string | null;
}

export function isPinterestGuestTryonParams(params: URLSearchParams): boolean {
  return isCampaignGuestTryonParams(params);
}

export function isCampaignGuestTryonParams(params: URLSearchParams): boolean {
  const guestTry = params.get("guest_try") === "1";
  const utmSource = params.get("utm_source")?.toLowerCase();
  const source = params.get("source")?.toLowerCase();
  return (
    guestTry &&
    (utmSource === "pinterest" ||
      utmSource === "google_images" ||
      Boolean(source?.startsWith("pinterest")) ||
      Boolean(source?.startsWith("google_images")))
  );
}

export function pinterestGuestPassState(
  pass: PinterestGuestPass,
  now = new Date(),
): PinterestGuestPassPublicState {
  const expired = new Date(pass.expiresAt).getTime() <= now.getTime();
  const used = Boolean(pass.usedAt || pass.jobId || expired);
  return {
    available: !used,
    used,
    remaining: used ? 0 : 1,
    expiresAt: pass.expiresAt,
    uploadId: pass.uploadId,
    jobId: pass.jobId,
    source: pass.source,
    utmContent: pass.utmContent,
  };
}

export function setPinterestGuestCookie(
  cookies: AstroCookies,
  token: string,
  isProd: boolean,
): void {
  cookies.set(PINTEREST_GUEST_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: PINTEREST_GUEST_TTL_SECONDS,
  });
}

export async function getOrCreatePinterestGuestPass(input: {
  cookies: AstroCookies;
  request: Request;
  DB: D1DatabaseLike;
  params: URLSearchParams;
  now?: Date;
}): Promise<{ pass: PinterestGuestPass; token?: string; created: boolean }> {
  const now = input.now ?? new Date();
  const existing = await resolvePinterestGuestPass(
    input.cookies,
    input.DB,
    now,
  );
  if (existing) return { pass: existing, created: false };

  const token = generateToken(32);
  const tokenHash = await hashToken(token);
  const id = `pguest_${crypto.randomUUID()}`;
  const pass: PinterestGuestPass = {
    id,
    tokenHash,
    guestUserId: `guest_${id}`,
    source: cleanSource(input.params.get("source")),
    utmContent: cleanSource(input.params.get("utm_content")),
    clientKeyHash: await clientKeyHash(input.request),
    userAgentHash: await userAgentHash(input.request),
    createdAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + PINTEREST_GUEST_TTL_SECONDS * 1000,
    ).toISOString(),
  };

  await input.DB.prepare(
    "INSERT INTO pinterest_guest_passes (id, token_hash, guest_user_id, source, utm_content, client_key_hash, user_agent_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      pass.id,
      pass.tokenHash,
      pass.guestUserId,
      pass.source ?? null,
      pass.utmContent ?? null,
      pass.clientKeyHash ?? null,
      pass.userAgentHash ?? null,
      pass.createdAt,
      pass.expiresAt,
    )
    .run();

  return { pass, token, created: true };
}

export async function resolvePinterestGuestPass(
  cookies: AstroCookies,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<PinterestGuestPass | undefined> {
  if (!DB) return undefined;
  const token = cookies.get(PINTEREST_GUEST_COOKIE)?.value;
  if (!token) return undefined;
  const tokenHash = await hashToken(token);
  const row = await DB.prepare(
    "SELECT id, token_hash, guest_user_id, source, utm_content, client_key_hash, user_agent_hash, upload_id, job_id, created_at, expires_at, used_at, completed_at FROM pinterest_guest_passes WHERE token_hash = ?",
  )
    .bind(tokenHash)
    .first<PinterestGuestPassRow>();
  if (!row) return undefined;
  if (new Date(row.expires_at).getTime() <= now.getTime()) return undefined;
  return fromRow(row);
}

export async function assignPinterestGuestUpload(
  pass: PinterestGuestPass,
  uploadId: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (!DB || pass.uploadId || pass.usedAt || pass.jobId) return false;
  const result = await DB.prepare(
    "UPDATE pinterest_guest_passes SET upload_id = ? WHERE id = ? AND upload_id IS NULL AND used_at IS NULL AND job_id IS NULL",
  )
    .bind(uploadId, pass.id)
    .run();
  return updateChanged(result);
}

export async function reservePinterestGuestGeneration(
  pass: PinterestGuestPass,
  uploadId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<boolean> {
  if (!DB || pass.usedAt || pass.jobId || pass.uploadId !== uploadId) {
    return false;
  }
  const result = await DB.prepare(
    "UPDATE pinterest_guest_passes SET used_at = ? WHERE id = ? AND upload_id = ? AND used_at IS NULL AND job_id IS NULL",
  )
    .bind(now.toISOString(), pass.id, uploadId)
    .run();
  return updateChanged(result);
}

export async function attachPinterestGuestJob(
  passId: string,
  jobId: string,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (!DB) return;
  await DB.prepare(
    "UPDATE pinterest_guest_passes SET job_id = ? WHERE id = ? AND job_id IS NULL",
  )
    .bind(jobId, passId)
    .run();
}

export async function releasePinterestGuestGeneration(
  passId: string,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (!DB) return;
  await DB.prepare(
    "UPDATE pinterest_guest_passes SET used_at = NULL WHERE id = ? AND job_id IS NULL",
  )
    .bind(passId)
    .run();
}

export async function completePinterestGuestJob(
  passId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  if (!DB) return;
  await DB.prepare(
    "UPDATE pinterest_guest_passes SET completed_at = COALESCE(completed_at, ?) WHERE id = ?",
  )
    .bind(now.toISOString(), passId)
    .run();
}

export async function resolvePinterestGuestUploadOwner(
  cookies: AstroCookies,
  uploadId: string,
  DB?: D1DatabaseLike,
): Promise<PinterestGuestPass | undefined> {
  const pass = await resolvePinterestGuestPass(cookies, DB);
  return pass?.uploadId === uploadId ? pass : undefined;
}

export async function resolvePinterestGuestJobOwner(
  cookies: AstroCookies,
  jobId: string,
  DB?: D1DatabaseLike,
): Promise<PinterestGuestPass | undefined> {
  const pass = await resolvePinterestGuestPass(cookies, DB);
  return pass?.jobId === jobId ? pass : undefined;
}

function cleanSource(value: string | null): string | undefined {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, 120) : undefined;
}

async function clientKeyHash(request: Request): Promise<string> {
  const ip = getClientIp(request);
  return hashToken(`pinterest-guest:${ip}`);
}

async function userAgentHash(request: Request): Promise<string | undefined> {
  const userAgent = request.headers.get("user-agent")?.trim();
  return userAgent ? hashToken(userAgent.slice(0, 500)) : undefined;
}

function updateChanged(result: unknown): boolean {
  const changes = (result as { meta?: { changes?: number } } | undefined)?.meta
    ?.changes;
  return typeof changes === "number" ? changes > 0 : true;
}

function fromRow(row: PinterestGuestPassRow): PinterestGuestPass {
  return {
    id: row.id,
    tokenHash: row.token_hash,
    guestUserId: row.guest_user_id,
    source: row.source ?? undefined,
    utmContent: row.utm_content ?? undefined,
    clientKeyHash: row.client_key_hash ?? undefined,
    userAgentHash: row.user_agent_hash ?? undefined,
    uploadId: row.upload_id ?? undefined,
    jobId: row.job_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
