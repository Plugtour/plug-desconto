import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';
const allowed = new Set<OfferStatus>(['rascunho', 'publicado', 'pausado', 'arquivado']);

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

type Params = { id: string };

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const status = body?.status as OfferStatus | undefined;

    if (!status || !allowed.has(status)) {
      return NextResponse.json({ ok: false, error: 'Status inválido' }, { status: 400 });
    }

    const tenantId = await getTenantId();

    const result = await prisma.$transaction(async (tx) => {
      const prev = await tx.offer.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!prev) return { kind: 'not_found' as const };

      const updated = await tx.offer.update({
        where: { id },
        data: { status: status as any },
        select: { id: true, status: true, updatedAt: true },
      });

      await tx.adminAuditLog.create({
        data: {
          tenantId,
          actorRole: session.role,
          actorName: session.userName ?? null,
          action: 'OFFER_STATUS_CHANGED',
          entityType: 'offer',
          entityId: id,
          before: { status: prev.status } as Prisma.InputJsonValue,
          after: { status: updated.status } as Prisma.InputJsonValue,
        },
      });

      return { kind: 'ok' as const, updated };
    });

    if (result.kind === 'not_found') {
      return NextResponse.json({ ok: false, error: 'Oferta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: result.updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Erro ao atualizar oferta' },
      { status: 500 }
    );
  }
}
