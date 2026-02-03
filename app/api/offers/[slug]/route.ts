// app/api/offers/[slug]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function normalizeSlug(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function looksLikeCuid(value: string) {
  return /^c[a-z0-9]{24,}$/i.test(value);
}

type RouteCtx = { params: Promise<{ slug: string }> };

type ApiOffer = {
  id: string;
  slug: string;

  city: string;
  status: string;

  categoryId: string;
  category: string;

  title: string;

  partnerName: string;
  partner: string;

  description: string | null;

  priceText: string | null;
  benefit: string;

  imageUrl: string | null;
  images: string[];

  createdAt: string;
  updatedAt: string;

  tenantId: string;
};

function pickImages(imageUrl: string | null) {
  const url = (imageUrl || '').trim();
  return url ? [url] : [];
}

function mapOffer(db: {
  id: string;
  slug: string;
  city: string;
  status: string;
  categoryId: string;
  title: string;
  partnerName: string;
  description: string | null;
  imageUrl: string | null;
  priceText: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ApiOffer {
  return {
    id: db.id,
    slug: db.slug,

    city: db.city,
    status: db.status,

    categoryId: db.categoryId,
    category: db.categoryId,

    title: db.title,

    partnerName: db.partnerName,
    partner: db.partnerName,

    description: db.description ?? null,

    priceText: db.priceText ?? null,
    benefit: (db.priceText || '').trim() ? String(db.priceText) : db.title,

    imageUrl: db.imageUrl ?? null,
    images: pickImages(db.imageUrl),

    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),

    tenantId: 'default',
  };
}

export async function GET(_request: NextRequest, context: RouteCtx) {
  try {
    const { slug } = await context.params;
    const raw = decodeURIComponent(slug || '');

    const whereBase: Prisma.OfferWhereInput = {};

    let row: {
      id: string;
      slug: string;
      city: string;
      status: string;
      categoryId: string;
      title: string;
      partnerName: string;
      description: string | null;
      imageUrl: string | null;
      priceText: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null = null;

    if (looksLikeCuid(raw)) {
      row = await prisma.offer.findFirst({
        where: { ...whereBase, id: raw },
        select: {
          id: true,
          slug: true,
          city: true,
          status: true,
          categoryId: true,
          title: true,
          partnerName: true,
          description: true,
          imageUrl: true,
          priceText: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (!row) {
      const slugNorm = normalizeSlug(raw);
      row = await prisma.offer.findFirst({
        where: { ...whereBase, slug: slugNorm },
        select: {
          id: true,
          slug: true,
          city: true,
          status: true,
          categoryId: true,
          title: true,
          partnerName: true,
          description: true,
          imageUrl: true,
          priceText: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (!row) {
      return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ item: mapOffer(row) }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Falha ao buscar oferta', detail: message }, { status: 500 });
  }
}
