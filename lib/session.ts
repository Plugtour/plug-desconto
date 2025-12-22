// lib/session.ts
import { cookies } from 'next/headers';

export type SessionRole =
  | 'guest'
  | 'user'
  | 'affiliate'
  | 'partner'
  | 'master';

export type Role = SessionRole;

export type Session = {
  role: SessionRole;
  planActive: boolean;
  userName?: string; // ✅ novo campo (opcional)
};

const COOKIE_NAME = 'pd_session';

export const defaultGuestSession: Session = {
  role: 'guest',
  planActive: false,
  userName: undefined,
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

/**
 * Serializa a sessão para string
 */
export function encodeSession(session: Session): string {
  // ✅ mantém só campos conhecidos e garante tipagem
  const payload: Session = {
    role: session.role,
    planActive: session.planActive,
    userName: session.userName,
  };
  return JSON.stringify(payload);
}

/**
 * Desserializa a sessão
 */
export function decodeSession(value?: string | null): Session | null {
  const parsed = safeJsonParse<Partial<Session>>(value ?? null);
  if (!parsed) return null;

  const role = parsed.role;
  const planActive = parsed.planActive;

  if (!role || typeof role !== 'string') return null;
  if (typeof planActive !== 'boolean') return null;

  // ✅ valida role
  const allowed: SessionRole[] = ['guest', 'user', 'affiliate', 'partner', 'master'];
  if (!allowed.includes(role as SessionRole)) return null;

  const userName =
    typeof parsed.userName === 'string' && parsed.userName.trim()
      ? parsed.userName.trim()
      : undefined;

  return {
    role: role as SessionRole,
    planActive,
    userName,
  };
}

/**
 * Lê a sessão do cookie (Server)
 */
export async function getSession(): Promise<Session> {
  const c = await cookies(); // ✅ Next 16: cookies() é async
  const raw = c.get(COOKIE_NAME)?.value ?? null;
  const parsed = decodeSession(raw);
  return parsed ?? defaultGuestSession;
}

/**
 * Grava a sessão no cookie (Server)
 */
export async function setSession(session: Session) {
  const value = encodeSession(session);
  const c = await cookies(); // ✅ Next 16: cookies() é async

  c.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Remove a sessão (logout)
 */
export async function clearSession() {
  const c = await cookies(); // ✅ Next 16: cookies() é async
  c.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}
