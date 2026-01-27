// app/api/admin/offers/[id]/route.ts
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

/**
 * 🔧 AJUSTE AQUI:
 * Next 16 exige params como Promise
 */
type RouteCtx = { params: Promise<{ id: string }> };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export async function PATCH(req: Request, context: RouteCtx) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    // 🔧 AJUSTE AQUI
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const bodyRaw: unknown = await req.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const status = (typeof body.status === 'string' ? body.status : '') as OfferStatus;

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
        data: { status }, // mantém exatamente como estava
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: message || 'Erro ao atualizar oferta' },
      { status: 500 }
    );
  }
}
