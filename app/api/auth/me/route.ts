// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeSession, defaultGuestSession, getSessionCookieName } from '@/lib/session';

export async function GET() {
  const c = await cookies();
  const raw = c.get(getSessionCookieName())?.value ?? null;

  const session = decodeSession(raw) ?? defaultGuestSession;

  return NextResponse.json({ ok: true, session }, { status: 200 });
}
