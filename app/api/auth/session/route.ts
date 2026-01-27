// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeSession, getSessionCookieName, defaultGuestSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const c = await cookies();
  const raw = c.get(getSessionCookieName())?.value ?? null;

  const session = decodeSession(raw) ?? defaultGuestSession;

  return NextResponse.json({ ok: true, session }, { status: 200 });
}
