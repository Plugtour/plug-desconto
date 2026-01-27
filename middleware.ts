// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantByHost } from './config/tenants';

import { decodeSession, getSessionCookieName, type Session } from '@/lib/session';

function getHost(req: NextRequest) {
  return (req.headers.get('host') || '').toLowerCase();
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isMasterPath(pathname: string) {
  return pathname === '/master' || pathname.startsWith('/master/');
}

function isAdminApiPath(pathname: string) {
  return pathname === '/api/admin' || pathname.startsWith('/api/admin/');
}

function readSession(req: NextRequest): Session | null {
  const cookieName = getSessionCookieName();
  const raw = req.cookies.get(cookieName)?.value;
  if (!raw) return null;

  try {
    return decodeSession(raw);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const host = getHost(req);
  const tenant = resolveTenantByHost(host);

  // sempre injeta tenant headers
  const headers = new Headers(req.headers);
  headers.set('x-tenant-id', tenant.id);
  headers.set('x-tenant-host', host);

  const pathname = req.nextUrl.pathname;

  // só valida permissão nos caminhos protegidos
  const needsGuard = isAdminPath(pathname) || isMasterPath(pathname) || isAdminApiPath(pathname);
  if (!needsGuard) {
    return NextResponse.next({ request: { headers } });
  }

  const session = readSession(req);

  // API do admin: resposta JSON (sem redirect)
  if (isAdminApiPath(pathname)) {
    if (!session) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });
    }
    if (session.role !== 'master') {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403, headers });
    }
    return NextResponse.next({ request: { headers } });
  }

  // Páginas do admin/master: redirects
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url, { headers });
  }

  if (session.role !== 'master') {
    const url = req.nextUrl.clone();
    url.pathname = '/acesso-negado';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url, { headers });
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
