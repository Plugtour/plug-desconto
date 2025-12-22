import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantByHost } from './config/tenants';

function getHost(req: NextRequest) {
  return (req.headers.get('host') || '').toLowerCase();
}

export function middleware(req: NextRequest) {
  const host = getHost(req);
  const tenant = resolveTenantByHost(host);

  const headers = new Headers(req.headers);
  headers.set('x-tenant-id', tenant.id);
  headers.set('x-tenant-host', host);

  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
