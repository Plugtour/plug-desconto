// app/api/admin/offers/route.ts
import { NextResponse } from 'next/server';
import { Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const allowedCreate = new Set<OfferStatus>([
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

function pickStatus(raw: unknown): OfferStatus {
  const s = String(raw ?? OfferStatus.rascunho);
  return (Object.values(OfferStatus).includes(s as OfferStatus)
    ? (s as OfferStatus)
    : OfferStatus.rascunho) as OfferStatus;
}

function toStringOrNull(v: unknown) {
  const s = typeof v === 'string' ? v : v == null ? '' : String(v);
  const out = s.trim();
  return out ? out : null;
}

/**
 * Aceita:
 * - ["url1","url2"]
 * - "url1, url2" ou "url1\nurl2"
 * - { set: ["url1","url2"] }   ✅ (compat com Prisma-style)
 */
function toStringArrayFlexible(v: unknown): string[] | null {
  if (Array.isArray(v)) {
    return v.map((x) => String(x).trim()).filter(Boolean);
  }

  if (typeof v === 'string') {
    const raw = v.trim();
    if (!raw) return [];
    return raw
      .split(/[\n,]+/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  if (isPlainObject(v) && 'set' in v) {
    const inner = (v as any).set;
    if (Array.isArray(inner)) {
      return inner.map((x: any) => String(x).trim()).filter(Boolean);
    }
  }

  return null;
}

function uniq(arr: string[]) {
  const set = new Set<string>();
  for (const s of arr) {
    const t = String(s || '').trim();
    if (t) set.add(t);
  }
  return Array.from(set);
}

// ========================
// ADMIN: LISTA OFERTAS
// ========================
export async function GET() {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const items = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, items, total: items.length }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'Falha ao buscar ofertas', detail: message }, { status: 500 });
  }
}

// ========================
// ADMIN: CRIA OFERTA
// ========================
export async function POST(request: Request) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const bodyRaw: unknown = await request.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const title = String(body.title ?? '').trim();
    const partnerName = String(body.partnerName ?? '').trim();
    const city = String(body.city ?? '').trim();
    const categoryId = String(body.categoryId ?? '').trim();

    const status = pickStatus(body.status ?? OfferStatus.rascunho);
    const description = body.hasOwnProperty('description') ? toStringOrNull(body.description) : null;

    // ✅ agora entende array e também { set: [...] }
    const imageUrlsRaw = body.hasOwnProperty('imageUrls') ? toStringArrayFlexible(body.imageUrls) : null;
    const imageUrlSingle = body.hasOwnProperty('imageUrl') ? toStringOrNull(body.imageUrl) : null;

    const imageUrls = uniq([
      ...(Array.isArray(imageUrlsRaw) ? imageUrlsRaw : []),
      ...(imageUrlSingle ? [imageUrlSingle] : []),
    ]);

    const imageUrl = imageUrls.length ? imageUrls[0] : imageUrlSingle ?? null;

    const priceText = body.hasOwnProperty('priceText') ? toStringOrNull(body.priceText) : null;

    if (title.length < 4) return NextResponse.json({ ok: false, error: 'Título inválido' }, { status: 400 });
    if (!partnerName) return NextResponse.json({ ok: false, error: 'Parceiro é obrigatório' }, { status: 400 });
    if (!city) return NextResponse.json({ ok: false, error: 'Cidade é obrigatória' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ ok: false, error: 'Categoria é obrigatória' }, { status: 400 });

    if (!allowedCreate.has(status)) {
      return NextResponse.json({ ok: false, error: 'Status inválido para criação' }, { status: 400 });
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
        imageUrls,
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
        after: created as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, offer: created }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'Falha ao criar oferta', detail: message }, { status: 500 });
  }
}

// ========================
// ADMIN: ATUALIZA (COMPAT) via /api/admin/offers?id=...
// ========================
export async function PUT(request: Request) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = (url.searchParams.get('id') ?? '').trim();
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  try {
    const before = await prisma.offer.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const bodyRaw: unknown = await request.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const status = body.hasOwnProperty('status') ? pickStatus(body.status) : before.status;

    const imageUrlsRaw = body.hasOwnProperty('imageUrls')
      ? toStringArrayFlexible(body.imageUrls)
      : Array.isArray(before.imageUrls)
        ? before.imageUrls
        : [];

    const imageUrlSingle = body.hasOwnProperty('imageUrl') ? toStringOrNull(body.imageUrl) : before.imageUrl ?? null;

    const imageUrls = uniq([
      ...(Array.isArray(imageUrlsRaw) ? imageUrlsRaw : []),
      ...(imageUrlSingle ? [imageUrlSingle] : []),
    ]);

    const imageUrl = imageUrls.length ? imageUrls[0] : imageUrlSingle ?? null;

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        status,
        imageUrl,
        imageUrls: { set: imageUrls },
      },
    });

    const tenantId = await getTenantId();

    await prisma.adminAuditLog.create({
      data: {
        tenantId,
        actorRole: session.role,
        actorName: session.userName ?? null,
        action: 'OFFER_UPDATED',
        entityType: 'offer',
        entityId: updated.id,
        before: before as unknown as Prisma.InputJsonValue,
        after: updated as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, offer: updated }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'Falha ao atualizar oferta', detail: message }, { status: 500 });
  }
}
