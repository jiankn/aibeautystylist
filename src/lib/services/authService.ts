/**
 * Auth Service — 统一的认证服务层
 *
 * MVP 阶段支持 Google OAuth 2.0 登录。
 * 提供 Session 管理、用户创建、登录/登出全流程。
 */
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';
import { findOrCreateUser, findUserById, type UserRecord } from '../repositories/userRepository';
import { createSession, validateSession, deleteSession } from '../repositories/sessionRepository';
import { getUserTier, type UserTier, type PlanFeatures } from '../repositories/subscriptionRepository';

// ─── 类型定义 ───────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  features: PlanFeatures;
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// ─── Cookie 配置 ─────────────────────────────────────────────
export const SESSION_COOKIE_NAME = 'abs_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 天

export function buildSessionCookie(sessionId: string, isDev: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];
  if (!isDev) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// ─── Google OAuth 流程 ──────────────────────────────────────
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * 生成 Google OAuth 授权 URL
 */
export function getGoogleAuthUrl(
  env: RuntimeEnv | undefined,
  redirectUri: string,
  next?: string,
): string {
  const clientId = getRuntimeValue(env, 'GOOGLE_OAUTH_CLIENT_ID' as keyof RuntimeEnv);
  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID not configured');

  const state = crypto.randomUUID(); // CSRF 防护

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state: next ? `next:${encodeURIComponent(next)}` : state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * 用 authorization code 换取 tokens
 */
export async function exchangeGoogleCode(
  env: RuntimeEnv | undefined,
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse> {
  const clientId = getRuntimeValue(env, 'GOOGLE_OAUTH_CLIENT_ID' as keyof RuntimeEnv);
  const clientSecret = getRuntimeValue(env, 'GOOGLE_OAUTH_CLIENT_SECRET' as keyof RuntimeEnv);
  if (!clientId || !clientSecret) throw new Error('Google OAuth credentials not configured');

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => 'unknown');
    throw new Error(`Google token exchange failed: ${resp.status} ${errText}`);
  }

  return resp.json() as Promise<GoogleTokenResponse>;
}

/**
 * 用 access_token 获取 Google 用户信息
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const resp = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) throw new Error(`Google userinfo fetch failed: ${resp.status}`);

  return resp.json() as Promise<GoogleUserInfo>;
}

// ─── 完整登录流程 ───────────────────────────────────────────
/**
 * Google OAuth callback 处理：换取 token → 获取用户信息 → 创建/查找用户 → 创建 session
 */
export async function handleGoogleCallback(
  env: RuntimeEnv | undefined,
  code: string,
  redirectUri: string,
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<{ sessionId: string; user: UserRecord } | null> {
  // 1. 换取 access_token
  const tokens = await exchangeGoogleCode(env, code, redirectUri);

  // 2. 获取用户信息
  const googleUser = await getGoogleUserInfo(tokens.access_token);

  // 3. 创建或查找用户
  const user = await findOrCreateUser(env, {
    email: googleUser.email,
    name: googleUser.name,
    avatarUrl: googleUser.picture,
    authProvider: 'google',
    authProviderId: googleUser.id,
  });
  if (!user) return null;

  // 4. 创建 Session
  const sessionId = await createSession(env, {
    userId: user.id,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });
  if (!sessionId) return null;

  return { sessionId, user };
}

// ─── Session 验证 ───────────────────────────────────────────
/**
 * 从 Cookie 中解析 session → 验证 → 返回完整用户信息
 */
export async function getAuthUser(
  env: RuntimeEnv | undefined,
  cookieHeader?: string | null,
): Promise<AuthUser | null> {
  if (!cookieHeader) return null;

  // 解析 session cookie
  const sessionId = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (!sessionId) return null;

  // 验证 session
  const session = await validateSession(env, sessionId);
  if (!session) return null;

  // 获取用户
  const user = await findUserById(env, session.userId);
  if (!user) return null;

  // 获取会员等级
  const { tier, features } = await getUserTier(env, user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    tier,
    features,
  };
}

/**
 * 登出：删除 session
 */
export async function logout(
  env: RuntimeEnv | undefined,
  cookieHeader?: string | null,
): Promise<void> {
  if (!cookieHeader) return;

  const sessionId = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (!sessionId) return;

  await deleteSession(env, sessionId);
}

// ─── 工具函数 ───────────────────────────────────────────────
function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ?? null;
}
