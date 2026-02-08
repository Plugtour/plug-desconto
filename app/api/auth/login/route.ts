// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import {
  encodeSession,
  getSessionCookieName,
  type Session,
  type SessionRole,
} from '@/lib/session';

function pickString(v: unknown) {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // { role, planActive, userName?, email?, userEmail?, name? }
  const role = (body?.role ?? 'guest') as SessionRole;
  const planActive = Boolean(body?.planActive);

  const email = pickString(body?.email) || pickString(body?.userEmail);
  const name = pickString(body?.userName) || pickString(body?.name);

  // ✅ Regra: se vier email, salva no userName (pra tela /afiliado achar por email)
  const userName = email ?? name;

  const session: Session = {
    role,
    planActive,
    userName,
  };

  const value = encodeSession(session);

  const c = await cookies();
  c.set(getSessionCookieName(), value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true, session });
}
