import type { AstroCookies } from "astro";

import { getClientIp } from "./rateLimit";
import type { D1DatabaseLike } from "./runtime";
import { generateToken, hashToken } from "./tokens";

export const PINTEREST_GUEST_COOKIE = "abs_pin_guest";
export const PINTEREST_GUEST_TTL_SECONDS = 60 * 60 * 24 * 30;
export const PINTEREST_GUEST_DEVICE_WINDOW_MS =
  PINTEREST_GUEST_TTL_SECONDS * 1000;
export const PINTEREST_GUEST_IP_WINDOW_MS = 24 * 60 * 60 * 1000;
export const PINTEREST_GUEST_DEFAULT_IP_LIMIT = 3;
export const PINTEREST_GUEST_DEFAULT_DAILY_LIMIT = 100;

export interface PinterestGuestPass {
  id: string;
  tokenHash: string;
  guestUserId: string;
  source?: string;
  utmContent?: string;
  clientKeyHash?: string;
  deviceKeyHash?: string;
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
  device_key_hash: string | null;
  user_agent_hash: string | null;
  upload_id: string | null;
  job_id: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  completed_at: string | null;
}

export interface PinterestGuestIdentity {
  clientKeyHash: string;
  deviceKeyHash?: string;
  userAgentHash?: string;
}

export interface PinterestGuestGenerationLimits {
  maxPerIp: number;
  maxDaily: number;
}

export interface PinterestGuestAllowance {
  allowed: boolean;
  reason?: "device" | "ip" | "budget";
  retryAt: string;
}

interface PinterestGuestAllowanceRow {
  device_count: number | string;
  ip_count: number | string;
  daily_count: number | string;
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

export function isSameOriginGuestPassRequest(request: Request): boolean {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (!origin && !referer) return false;
  if (origin && origin !== expectedOrigin) return false;
  if (fetchSite && fetchSite !== "same-origin") return false;

  if (referer) {
    try {
      if (new URL(referer).origin !== expectedOrigin) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function normalizePinterestGuestDeviceId(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return /^[a-zA-Z0-9_-]{16,128}$/.test(cleaned) ? cleaned : undefined;
}

export function getPinterestGuestGenerationLimits(
  ipLimit?: string | number,
  dailyLimit?: string | number,
): PinterestGuestGenerationLimits {
  return {
    maxPerIp: normalizeLimit(ipLimit, PINTEREST_GUEST_DEFAULT_IP_LIMIT),
    maxDaily: normalizeLimit(dailyLimit, PINTEREST_GUEST_DEFAULT_DAILY_LIMIT),
  };
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
  deviceId?: string;
  identity?: PinterestGuestIdentity;
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
  const identity =
    input.identity ??
    (await getPinterestGuestIdentity(input.request, input.deviceId));
  const pass: PinterestGuestPass = {
    id,
    tokenHash,
    guestUserId: `guest_${id}`,
    source: cleanSource(input.params.get("source")),
    utmContent: cleanSource(input.params.get("utm_content")),
    clientKeyHash: identity.clientKeyHash,
    deviceKeyHash: identity.deviceKeyHash,
    userAgentHash: identity.userAgentHash,
    createdAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + PINTEREST_GUEST_TTL_SECONDS * 1000,
    ).toISOString(),
  };

  await input.DB.prepare(
    "INSERT INTO pinterest_guest_passes (id, token_hash, guest_user_id, source, utm_content, client_key_hash, device_key_hash, user_agent_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      pass.id,
      pass.tokenHash,
      pass.guestUserId,
      pass.source ?? null,
      pass.utmContent ?? null,
      pass.clientKeyHash ?? null,
      pass.deviceKeyHash ?? null,
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
    "SELECT id, token_hash, guest_user_id, source, utm_content, client_key_hash, device_key_hash, user_agent_hash, upload_id, job_id, created_at, expires_at, used_at, completed_at FROM pinterest_guest_passes WHERE token_hash = ?",
  )
    .bind(tokenHash)
    .first<PinterestGuestPassRow>();
  if (!row) return undefined;
  if (new Date(row.expires_at).getTime() <= now.getTime()) return undefined;
  return fromRow(row);
}

export async function getPinterestGuestIdentity(
  request: Request,
  deviceId?: string,
): Promise<PinterestGuestIdentity> {
  const normalizedDeviceId = normalizePinterestGuestDeviceId(deviceId);
  return {
    clientKeyHash: await clientKeyHash(request),
    deviceKeyHash: normalizedDeviceId
      ? await hashToken(`pinterest-device:${normalizedDeviceId}`)
      : undefined,
    userAgentHash: await userAgentHash(request),
  };
}

export async function getPinterestGuestAllowance(input: {
  DB: D1DatabaseLike;
  clientKeyHash?: string;
  deviceKeyHash?: string;
  limits: PinterestGuestGenerationLimits;
  now?: Date;
}): Promise<PinterestGuestAllowance> {
  const now = input.now ?? new Date();
  const deviceCutoff = new Date(
    now.getTime() - PINTEREST_GUEST_DEVICE_WINDOW_MS,
  ).toISOString();
  const dailyCutoff = new Date(
    now.getTime() - PINTEREST_GUEST_IP_WINDOW_MS,
  ).toISOString();
  const row = await input.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM pinterest_guest_passes WHERE device_key_hash = ?1 AND used_at >= ?2) AS device_count,
      (SELECT COUNT(*) FROM pinterest_guest_passes WHERE client_key_hash = ?3 AND used_at >= ?4) AS ip_count,
      (SELECT COUNT(*) FROM pinterest_guest_passes WHERE used_at >= ?4) AS daily_count`,
  )
    .bind(
      input.deviceKeyHash ?? "",
      deviceCutoff,
      input.clientKeyHash ?? "",
      dailyCutoff,
    )
    .first<PinterestGuestAllowanceRow>();

  const deviceCount = Number(row?.device_count ?? 0);
  const ipCount = Number(row?.ip_count ?? 0);
  const dailyCount = Number(row?.daily_count ?? 0);
  if (input.deviceKeyHash && deviceCount >= 1) {
    return blockedAllowance(now, "device", PINTEREST_GUEST_DEVICE_WINDOW_MS);
  }
  if (input.clientKeyHash && ipCount >= input.limits.maxPerIp) {
    return blockedAllowance(now, "ip", PINTEREST_GUEST_IP_WINDOW_MS);
  }
  if (dailyCount >= input.limits.maxDaily) {
    return blockedAllowance(now, "budget", PINTEREST_GUEST_IP_WINDOW_MS);
  }
  return {
    allowed: true,
    retryAt: new Date(
      now.getTime() + PINTEREST_GUEST_DEVICE_WINDOW_MS,
    ).toISOString(),
  };
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
  options: {
    limits?: PinterestGuestGenerationLimits;
    now?: Date;
  } = {},
): Promise<boolean> {
  if (!DB || pass.usedAt || pass.jobId || pass.uploadId !== uploadId) {
    return false;
  }
  const now = options.now ?? new Date();
  const limits = options.limits ?? getPinterestGuestGenerationLimits();
  const deviceCutoff = new Date(
    now.getTime() - PINTEREST_GUEST_DEVICE_WINDOW_MS,
  ).toISOString();
  const dailyCutoff = new Date(
    now.getTime() - PINTEREST_GUEST_IP_WINDOW_MS,
  ).toISOString();
  const result = await DB.prepare(
    `UPDATE pinterest_guest_passes
      SET used_at = ?1
      WHERE id = ?2
        AND upload_id = ?3
        AND used_at IS NULL
        AND job_id IS NULL
        AND (?4 = '' OR NOT EXISTS (
          SELECT 1 FROM pinterest_guest_passes
          WHERE device_key_hash = ?4 AND id <> ?2 AND used_at >= ?5
        ))
        AND (?6 = '' OR (
          SELECT COUNT(*) FROM pinterest_guest_passes
          WHERE client_key_hash = ?6 AND used_at >= ?7
        ) < ?8)
        AND (
          SELECT COUNT(*) FROM pinterest_guest_passes WHERE used_at >= ?7
        ) < ?9`,
  )
    .bind(
      now.toISOString(),
      pass.id,
      uploadId,
      pass.deviceKeyHash ?? "",
      deviceCutoff,
      pass.clientKeyHash ?? "",
      dailyCutoff,
      limits.maxPerIp,
      limits.maxDaily,
    )
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

function normalizeLimit(value: string | number | undefined, fallback: number) {
  if (value === undefined || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(Math.floor(parsed), 10_000);
}

function blockedAllowance(
  now: Date,
  reason: NonNullable<PinterestGuestAllowance["reason"]>,
  windowMs: number,
): PinterestGuestAllowance {
  return {
    allowed: false,
    reason,
    retryAt: new Date(now.getTime() + windowMs).toISOString(),
  };
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
    deviceKeyHash: row.device_key_hash ?? undefined,
    userAgentHash: row.user_agent_hash ?? undefined,
    uploadId: row.upload_id ?? undefined,
    jobId: row.job_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
