// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionCookieName } from '@/lib/session';

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
