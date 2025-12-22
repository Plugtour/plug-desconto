// lib/session.ts
import { cookies } from 'next/headers';
import crypto from 'crypto';

export type SessionRole = 'guest' | 'visitor' | 'user' | 'partner' | 'admin';

// Compatibilidade com imports antigos (lib/auth.ts)
export type Role = SessionRole;

export type Session = {
  role: SessionRole;
  planActive: boolean;
  tenantId?: string | null;
  iat?: number; // unix seconds
  exp?: number; // unix seconds
};

export const defaultGuestSession: Session = {
  role: 'guest',
  planActive: false,
  tenantId: null,
};

const COOKIE_NAME = 'pd_session';

// Se definir SESSION_SECRET no Vercel, o cookie fica assinado (recomendado).
const SECRET = process.env.SESSION_SECRET || '';

function base64UrlEncode(input: string | Buffer) {
  const b64 = Buffer.isBuffer(input)
    ? input.toString('base64')
    : Buffer.from(input, 'utf8').toString('base64');

  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function sign(payloadB64: string) {
  if (!SECRET) return '';
  return crypto.createHmac('sha256', SECRET).update(payloadB64).digest('hex');
}

export function encodeSession(session: Session) {
  const now = Math.floor(Date.now() / 1000);

  const payload: Session = {
    role: session.role ?? 'guest',
    planActive: !!session.planActive,
    tenantId: session.tenantId ?? null,
    iat: session.iat ?? now,
    exp: session.exp, // opcional
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  // Se tiver secret, assina: payload.sig
  if (SECRET) {
    const sig = sign(payloadB64);
    return `${payloadB64}.${sig}`;
  }

  // Sem secret: só payload
  return payloadB64;
}

export function decodeSession(value: string | null | undefined): Session | null {
  if (!value) return null;

  try {
    const parts = value.split('.');

    // Com assinatura: payload.sig
    if (parts.length === 2) {
      const [payloadB64, sig] = parts;

      if (SECRET) {
        const expected = sign(payloadB64);
        // timingSafeEqual exige buffers do mesmo tamanho
        if (sig.length !== expected.length) return null;
        if (
          !crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
        ) {
          return null;
        }
      }

      const json = base64UrlDecode(payloadB64);
      const parsed = JSON.parse(json) as Session;

      if (parsed?.exp && Math.floor(Date.now() / 1000) > parsed.exp) return null;
      return parsed;
    }

    // Sem assinatura: payload
    const json = base64UrlDecode(value);
    const parsed = JSON.parse(json) as Session;

    if (parsed?.exp && Math.floor(Date.now() / 1000) > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function getSession(): Session {
  const c = cookies().get(COOKIE_NAME)?.value ?? null;
  const parsed = decodeSession(c);

  return parsed ?? defaultGuestSession;
}

export function setSession(session: Session) {
  const value = encodeSession(session);

  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function clearSession() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
