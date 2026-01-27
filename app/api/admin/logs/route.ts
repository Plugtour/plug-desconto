// app/api/admin/logs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { decodeSession, getSessionCookieName } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function requireMaster() {
  const c = await cookies();
  const raw = c.get(getSessionCookieName())?.value ?? null;
  const session = decodeSession(raw);
  if (!session || session.role !== 'master') return null;
  return session;
}

async function getTenantId() {
  const h = await headers();
  return h.get('x-tenant-id') ?? undefined;
}

type SortDir = 'asc' | 'desc';

function toSortDir(v: string | null): SortDir {
  const s = (v || '').toLowerCase();
  return s === 'asc' ? 'asc' : 'desc';
}

function asPositiveInt(value: string | null, fallback: number) {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.floor(n));
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getErrorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export async function GET(req: Request) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const page = asPositiveInt(searchParams.get('page'), 1);
    const pageSize = clampInt(asPositiveInt(searchParams.get('pageSize'), 20), 10, 50);

    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;

    // sort=asc|desc (default desc)
    const sort = toSortDir(searchParams.get('sort'));

    const tenantId = await getTenantId();

    const where = {
      ...(tenantId ? { tenantId } : {}),
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: sort },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      page,
      pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      sort,
      items,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: 'Falha ao carregar logs', detail: getErrorMessage(e) },
      { status: 500 }
    );
  }
}
