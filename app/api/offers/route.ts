// app/api/offers/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { listCategorias } from '@/app/admin/_store/configStore';

function normalizeCity(value: string) {
  return (value || '').trim();
}

function normalizeCat(value: string) {
  return (value || '').trim();
}

type ApiOffer = {
  id: string;
  slug: string;

  city: string;
  status: string;

  categoryId: string;
  category: string; // ✅ nome da categoria (quando existir)

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

function mapOffer(
  db: {
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
  },
  categoryNameById: Map<string, string>
): ApiOffer {
  const catId = (db.categoryId || '').trim();
  const catName = categoryNameById.get(catId) || catId || '';

  return {
    id: db.id,
    slug: db.slug,

    city: db.city,
    status: db.status,

    categoryId: db.categoryId,
    category: catName, // ✅ agora é o nome real (se conseguir ler)

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

async function safeListCategorias() {
  try {
    return await listCategorias();
  } catch (e: unknown) {
    // ✅ Em produção (Vercel), o FS pode ser read-only e essa leitura pode falhar.
    // Não vamos derrubar a rota por isso: apenas devolve sem nome de categoria.
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const where: Prisma.OfferWhereInput = {
      // ✅ site/app só mostra publicado
      status: OfferStatus.publicado,
    };

    if (cityParamRaw) where.city = normalizeCity(cityParamRaw);
    if (categoryParam) where.categoryId = normalizeCat(categoryParam);

    // ✅ tenta carregar categorias do Admin (se falhar, segue sem quebrar)
    const categorias = await safeListCategorias();
    const categoryNameById = new Map<string, string>();
    for (const c of categorias || []) {
      if (!c) continue;
      categoryNameById.set(String((c as any).id), String((c as any).nome ?? '').trim());
    }

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

    const items = Array.isArray(rows) ? rows.map((r) => mapOffer(r as any, categoryNameById)) : [];
    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Falha ao buscar ofertas', detail: message }, { status: 500 });
  }
}
