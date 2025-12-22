// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  encodeSession,
  getSessionCookieName,
  type Session,
  type SessionRole,
} from '@/lib/session';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // Você pode enviar isso pelo front:
  // { role: "affiliate" | "partner" | "master" | "user", planActive: true/false, userName?: string }
  const role = (body?.role ?? 'guest') as SessionRole;
  const planActive = Boolean(body?.planActive);

  const userName =
    typeof body?.userName === 'string' && body.userName.trim()
      ? body.userName.trim()
      : undefined;

  const session: Session = {
    role,
    planActive,
    userName,
  };

  const value = encodeSession(session);

  const c = await cookies(); // ✅ Next 16: cookies() é async
  c.set(getSessionCookieName(), value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true, session });
}
