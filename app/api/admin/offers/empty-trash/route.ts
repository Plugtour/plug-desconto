// app/api/admin/offers/empty-trash/route.ts
import { NextResponse } from 'next/server';
import { Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

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

// ========================
// ADMIN: ESVAZIAR LIXEIRA (DELETE REAL)
// remove do banco tudo que estiver com status=lixeira
// ========================
export async function DELETE() {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.offer.deleteMany({
      where: { status: OfferStatus.lixeira },
    });

    const tenantId = await getTenantId();

    await prisma.adminAuditLog.create({
      data: {
        tenantId,
        actorRole: session.role,
        actorName: session.userName ?? null,
        action: 'OFFER_TRASH_EMPTIED',
        entityType: 'offer',
        entityId: null,
        before: Prisma.JsonNull,
        after: { deleted: result.count } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: 'Falha ao esvaziar lixeira', detail: message },
      { status: 500 }
    );
  }
}
