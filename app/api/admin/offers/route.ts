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

// ADMIN: lista tudo
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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Falha ao buscar ofertas', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ADMIN: cria oferta (com auditoria)
export async function POST(request: Request) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);

    const title = String(body?.title ?? '').trim();
    const partnerName = String(body?.partnerName ?? '').trim();
    const city = String(body?.city ?? '').trim();
    const categoryId = String(body?.categoryId ?? '').trim();
    const status = String(body?.status ?? 'rascunho') as OfferStatus;

    const description = body?.description ? String(body.description) : null;
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null;
    const priceText = body?.priceText ? String(body.priceText) : null;

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

    const slug = await ensureUniqueSlug(title);
    const tenantId = await getTenantId();

    const created = await prisma.offer.create({
      data: {
        slug,
        title,
        partnerName,
        city,
        categoryId,
        status: status as any,
        description,
        imageUrl,
        priceText,
      },
    });

    // Auditoria: criação
    // Json fields: usar Prisma.JsonNull em vez de null
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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Falha ao criar oferta', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
