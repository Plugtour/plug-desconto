// app/api/admin/offers/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * ✅ Status como union type
 * (porque NÃO existe enum no Prisma)
 */
type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

const allowed = new Set<OfferStatus>([
  'rascunho',
  'publicado',
  'pausado',
  'arquivado',
]);

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

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ========================
// ADMIN: LISTA OFERTAS
// ========================
export async function GET() {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const items = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { ok: true, items, total: items.length },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: 'Falha ao buscar ofertas', detail: message },
      { status: 500 }
    );
  }
}

// ========================
// ADMIN: CRIA OFERTA
// ========================
export async function POST(request: Request) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const bodyRaw: unknown = await request.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const title = String(body.title ?? '').trim();
    const partnerName = String(body.partnerName ?? '').trim();
    const city = String(body.city ?? '').trim();
    const categoryId = String(body.categoryId ?? '').trim();
    const status = String(body.status ?? 'rascunho') as OfferStatus;

    const description = body.description ? String(body.description) : null;
    const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    const priceText = body.priceText ? String(body.priceText) : null;

    if (title.length < 4) {
      return NextResponse.json({ ok: false, error: 'Título inválido' }, { status: 400 });
    }
    if (!partnerName) {
      return NextResponse.json({ ok: false, error: 'Parceiro é obrigatório' }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ ok: false, error: 'Cidade é obrigatória' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ ok: false, error: 'Categoria é obrigatória' }, { status: 400 });
    }
    if (!allowed.has(status)) {
      return NextResponse.json({ ok: false, error: 'Status inválido' }, { status: 400 });
    }

    const tenantId = await getTenantId();

    const created = await prisma.offer.create({
      data: {
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        partnerName,
        city,
        categoryId,
        status,
        description,
        imageUrl,
        priceText,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        tenantId,
        actorRole: session.role,
        actorName: session.userName ?? null,
        action: 'OFFER_CREATED',
        entityType: 'offer',
        entityId: created.id,
        before: Prisma.JsonNull,
        after: {
          id: created.id,
          slug: created.slug,
          title: created.title,
          status: created.status,
        } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, offer: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: 'Falha ao criar oferta', detail: message },
      { status: 500 }
    );
  }
}
