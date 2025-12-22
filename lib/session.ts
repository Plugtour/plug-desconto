// lib/session.ts
import { cookies } from 'next/headers';
import crypto from 'crypto';

export type SessionRole = 'visitor' | 'user' | 'partner' | 'admin';

export type Session = {
  role: SessionRole;
  planActive: boolean;
  tenantId?: string | null;
  iat?: number; // issued at (unix seconds)
  exp?: number; // expires at (unix seconds)
};

const COOKIE_NAME = 'pd_session';

// Se você definir SESSION_SECRET no Vercel, o cookie fica assinado (recomendado).
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
    role: session.role ?? 'visitor',
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

      // Se houver secret, valida assinatura
      if (SECRET) {
        const expected = sign(payloadB64);
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
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

  // Default para visitante
  return (
    parsed ?? {
      role: 'visitor',
      planActive: false,
      tenantId: null,
    }
  );
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
