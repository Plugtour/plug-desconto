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
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const bodyRaw: unknown = await req.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const data: Prisma.OfferUpdateInput = {};

    if (typeof body.status === 'string') {
      const status = body.status as OfferStatus;
      if (!allowed.has(status)) {
        return NextResponse.json({ ok: false, error: 'Status inválido' }, { status: 400 });
      }
      data.status = status;
    }

    if (typeof body.title === 'string') data.title = body.title.trim();
    if (typeof body.partnerName === 'string') data.partnerName = body.partnerName.trim();
    if (typeof body.city === 'string') data.city = body.city.trim();
    if (typeof body.categoryId === 'string') data.categoryId = body.categoryId.trim();
    if (typeof body.description === 'string' || body.description === null)
      data.description = body.description;
    if (typeof body.imageUrl === 'string' || body.imageUrl === null)
      data.imageUrl = body.imageUrl;
    if (typeof body.priceText === 'string' || body.priceText === null)
      data.priceText = body.priceText;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: 'Nada para atualizar' }, { status: 400 });
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
        data,
      });

      await tx.adminAuditLog.create({
        data: {
          tenantId,
          actorRole: session.role,
          actorName: session.userName ?? null,
          action: 'OFFER_UPDATED',
          entityType: 'offer',
          entityId: id,
          before: prev as Prisma.InputJsonValue,
          after: updated as Prisma.InputJsonValue,
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
