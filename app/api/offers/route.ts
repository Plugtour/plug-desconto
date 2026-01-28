// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function normalizeCity(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeCat(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const where: Prisma.OfferWhereInput = {};

    if (cityParamRaw) where.city = normalizeCity(cityParamRaw);
    if (categoryParam) where.categoryId = normalizeCat(categoryParam);

    const rows = await prisma.offer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
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

    const items = Array.isArray(rows) ? rows.map(mapOffer) : [];
    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas', detail: message },
      { status: 500 }
    );
  }
}
