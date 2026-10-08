/**
 * Login & Sitzung für den Admin-Bereich (/admin) – gleiches Prinzip wie bei kristinainhof.at.
 * Zugangsdaten und Schlüssel kommen ausschließlich aus Cloudflare-Secrets:
 *   ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET
 */

/** Minimale Typen für Cloudflare KV (kein zusätzliches Paket nötig). */
export interface KV {
  get(key: string): Promise<string | null>;
  get<T>(key: string, type: 'json'): Promise<T | null>;
  put(key: string, value: string, options?: { expirationTtl?: number; metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
  list<M = unknown>(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    keys: { name: string; metadata?: M }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

export interface Env {
  ANFRAGEN?: KV;
  ADMIN_USER?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  /** Mailversand über World4You (empfohlen) */
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  /** Alternative: Resend */
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
  ALLOWED_ORIGINS?: string;
}

export interface Context {
  request: Request;
  env: Env;
}

const COOKIE = 'oba_admin_session';
const MAX_AGE = 60 * 60 * 8; // 8 Stunden
const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

/** Vergleich in konstanter Zeit, damit Passwörter nicht über Antwortzeiten erraten werden können. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = await hmacKey('compare');
  const [x, y] = await Promise.all([crypto.subtle.sign('HMAC', key, enc.encode(a)), crypto.subtle.sign('HMAC', key, enc.encode(b))]);
  const ax = new Uint8Array(x);
  const ay = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < ax.length; i++) diff |= ax[i] ^ ay[i];
  return diff === 0;
}

export function loginConfigured(env: Env): boolean {
  return Boolean(env.ADMIN_USER && env.ADMIN_PASSWORD && env.SESSION_SECRET && env.ANFRAGEN);
}

export async function createSessionCookie(env: Env, user: string): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: Math.floor(Date.now() / 1000) + MAX_AGE })));
  const sig = b64url(await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET!), enc.encode(payload)));
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function getSession(request: Request, env: Env): Promise<{ u: string; exp: number } | null> {
  if (!env.SESSION_SECRET) return null;
  const match = (request.headers.get('Cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return null;
  const [payload, sig] = match[1].split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env.SESSION_SECRET), b64urlDecode(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Kurzer, nicht umkehrbarer Hash (z. B. für IP-Adressen beim Rate Limiting). */
export async function shortHash(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return [...new Uint8Array(buf)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

/** Schreibende Admin-Aufrufe nur von der eigenen Seite (zusätzlich zu SameSite=Strict). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}
