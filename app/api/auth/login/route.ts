import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encodeSession, getSessionCookieName, type Role } from '@/lib/session';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    role?: Role;
    planActive?: boolean;
    userName?: string;
  };

  const role: Role = body?.role ?? 'guest';
  const planActive = Boolean(body?.planActive);
  const userName = body?.userName ?? undefined;

  const value = encodeSession({ role, planActive, userName });

  const c = await cookies();
  c.set(getSessionCookieName(), value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
