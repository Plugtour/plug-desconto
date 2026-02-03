// app/api/admin/offers/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { decodeSession, getSessionCookieName } from '@/lib/session';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function requireMaster() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = cookies();
  const getCookieValue = (obj: any) => obj?.get?.(getSessionCookieName())?.value ?? null;

  const raw = typeof c?.then === 'function' ? null : getCookieValue(c);

  const resolve = async () => {
    if (typeof c?.then === 'function') {
      const cc = await c;
      return getCookieValue(cc);
    }
    return raw;
  };

  return resolve().then((cookieRaw) => {
    const session = decodeSession(cookieRaw);
    if (!session || session.role !== 'master') return null;
    return session;
  });
}

async function getTenantId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h: any = headers();
  const readHeader = (obj: any) => obj?.get?.('x-tenant-id') ?? undefined;

  if (typeof h?.then === 'function') {
    const hh = await h;
    return readHeader(hh);
  }
  return readHeader(h);
}

function pickStatus(raw: unknown): OfferStatus {
  const s = String(raw ?? OfferStatus.rascunho);
  return (Object.values(OfferStatus).includes(s as OfferStatus) ? (s as OfferStatus) : OfferStatus.rascunho) as OfferStatus;
}

function toStringOrNull(v: unknown) {
  const s = typeof v === 'string' ? v : v == null ? '' : String(v);
  const out = s.trim();
  return out ? out : null;
}

function toStringArrayOrNull(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const arr = v.map((x) => String(x).trim()).filter(Boolean);
  return arr;
}

function pickFirstFromArray(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const first = v.find((x) => typeof x === 'string' && x.trim().length > 0);
  return first ? String(first).trim() : null;
}

export async function GET(_req: NextRequest, context: Ctx) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const cleanId = String(id ?? '').trim();
  if (!cleanId) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  try {
    const offer = await prisma.offer.findUnique({ where: { id: cleanId } });
    if (!offer) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    return NextResponse.json({ ok: true, offer }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'Falha ao carregar oferta', detail: message }, { status: 500 });
  }
}

/**
 * PATCH = atualização rápida (usado pelos ícones)
 */
export async function PATCH(req: NextRequest, context: Ctx) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const cleanId = String(id ?? '').trim();
  if (!cleanId) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  try {
    const before = await prisma.offer.findUnique({ where: { id: cleanId } });
    if (!before) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const bodyRaw: unknown = await req.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const status = Object.prototype.hasOwnProperty.call(body, 'status') ? pickStatus(body.status) : before.status;

    const imageUrlsFromBody = Object.prototype.hasOwnProperty.call(body, 'imageUrls') ? toStringArrayOrNull(body.imageUrls) : null;

    const compatImageUrlFromBody = Object.prototype.hasOwnProperty.call(body, 'imageUrl') ? toStringOrNull(body.imageUrl) : null;

    const finalImageUrls =
      imageUrlsFromBody !== null ? imageUrlsFromBody : Array.isArray(before.imageUrls) ? before.imageUrls : [];

    const imageUrl =
      (finalImageUrls.length ? finalImageUrls[0] : null) ??
      compatImageUrlFromBody ??
      before.imageUrl ??
      pickFirstFromArray(before.imageUrls) ??
      null;

    const updated = await prisma.offer.update({
      where: { id: cleanId },
      data: {
        status,
        imageUrl,
        imageUrls: { set: finalImageUrls },
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

export async function PUT(req: NextRequest, context: Ctx) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const cleanId = String(id ?? '').trim();
  if (!cleanId) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  try {
    const before = await prisma.offer.findUnique({ where: { id: cleanId } });
    if (!before) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const bodyRaw: unknown = await req.json().catch(() => null);
    const body = isPlainObject(bodyRaw) ? bodyRaw : {};

    const title = String(body.title ?? before.title).trim();
    const partnerName = String(body.partnerName ?? before.partnerName).trim();
    const city = String(body.city ?? before.city).trim();
    const categoryId = String(body.categoryId ?? before.categoryId).trim();
    const status = Object.prototype.hasOwnProperty.call(body, 'status') ? pickStatus(body.status) : before.status;

    const description = Object.prototype.hasOwnProperty.call(body, 'description') ? toStringOrNull(body.description) : before.description ?? null;

    const priceText = Object.prototype.hasOwnProperty.call(body, 'priceText') ? toStringOrNull(body.priceText) : before.priceText ?? null;

    const imageUrlsFromBody = Object.prototype.hasOwnProperty.call(body, 'imageUrls') ? toStringArrayOrNull(body.imageUrls) : null;

    const imageUrlFallback = Object.prototype.hasOwnProperty.call(body, 'imageUrl') ? toStringOrNull(body.imageUrl) : null;

    const finalImageUrls =
      imageUrlsFromBody !== null ? imageUrlsFromBody : Array.isArray(before.imageUrls) ? before.imageUrls : [];

    const imageUrl = (finalImageUrls.length ? finalImageUrls[0] : null) ?? imageUrlFallback ?? before.imageUrl ?? null;

    if (title.length < 4) return NextResponse.json({ ok: false, error: 'Título inválido' }, { status: 400 });
    if (!partnerName) return NextResponse.json({ ok: false, error: 'Parceiro é obrigatório' }, { status: 400 });
    if (!city) return NextResponse.json({ ok: false, error: 'Cidade é obrigatória' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ ok: false, error: 'Categoria é obrigatória' }, { status: 400 });

    const updated = await prisma.offer.update({
      where: { id: cleanId },
      data: {
        title,
        partnerName,
        city,
        categoryId,
        status,
        description,
        priceText,
        imageUrl,
        imageUrls: { set: finalImageUrls },
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
    return NextResponse.json({ ok: false, error: 'Falha ao salvar oferta', detail: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  const session = await requireMaster();
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const cleanId = String(id ?? '').trim();
  if (!cleanId) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });

  try {
    const before = await prisma.offer.findUnique({ where: { id: cleanId } });
    if (!before) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    if (before.status !== OfferStatus.lixeira) {
      return NextResponse.json({ ok: false, error: 'Só é permitido excluir definitivamente ofertas na lixeira.' }, { status: 400 });
    }

    await prisma.offer.delete({ where: { id: cleanId } });

    const tenantId = await getTenantId();

    await prisma.adminAuditLog.create({
      data: {
        tenantId,
        actorRole: session.role,
        actorName: session.userName ?? null,
        action: 'OFFER_DELETED',
        entityType: 'offer',
        entityId: cleanId,
        before: before as unknown as Prisma.InputJsonValue,
        after: Prisma.JsonNull,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'Falha ao excluir oferta', detail: message }, { status: 500 });
  }
}
