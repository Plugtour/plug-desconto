// app/api/admin/offers/route.ts
import { NextResponse } from 'next/server';
import { Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const allowed = new Set<OfferStatus>([
  OfferStatus.rascunho,
  OfferStatus.publicado,
  OfferStatus.pausado,
  OfferStatus.arquivado,
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureUniqueSlug(base: string) {
  const cleanBase = slugify(base || 'oferta') || 'oferta';
  let slug = cleanBase;
  let i = 2;

  while (true) {
    const exists = await prisma.offer.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${cleanBase}-${i}`;
    i += 1;
  }
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

    return NextResponse.json({ ok: true, items, total: items.length }, { status: 200 });
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

    const statusRaw = String(body.status ?? OfferStatus.rascunho);
    const status = (Object.values(OfferStatus).includes(statusRaw as OfferStatus)
      ? (statusRaw as OfferStatus)
      : OfferStatus.rascunho) as OfferStatus;

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
    const slug = await ensureUniqueSlug(title);

    const created = await prisma.offer.create({
      data: {
        slug,
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
          partnerName: created.partnerName,
          city: created.city,
          categoryId: created.categoryId,
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
