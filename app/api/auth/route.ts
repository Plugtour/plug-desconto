// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeSession, defaultGuestSession, getSessionCookieName } from '@/lib/session';

export async function GET() {
  const c = await cookies();
  const raw = c.get(getSessionCookieName())?.value ?? null;
  const session = decodeSession(raw) ?? defaultGuestSession;

  return NextResponse.json({ ok: true, session });
}

// Mantém compatibilidade: POST aqui também desloga (mas o endpoint oficial é /api/auth/logout)
export async function POST() {
  const c = await cookies();
  c.set(getSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true });
}
