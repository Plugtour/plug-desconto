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

/**
 * Normaliza imageUrl vindo do banco para o formato público correto
 * - troca \ por /
 * - garante "/" no início
 * - troca /uploads/offers/ -> /offers/
 * - remove sufixo -w### antes da extensão
 */
function normalizeImageUrl(value: string | null) {
  const s0 = (value || '').trim();
  if (!s0) return null;

  // remoto: mantém
  if (/^https?:\/\//i.test(s0)) return s0;

  const [pathPart, queryPart] = s0.split('?');
  let p = String(pathPart || '').trim();
  if (!p) return null;

  p = p.replace(/\\/g, '/').trim();

  if (!p.startsWith('/')) p = `/${p}`;

  // remove -w### antes da extensão
  p = p.replace(/-w\d+(?=\.[a-z0-9]+$)/i, '');

  // /uploads/offers -> /offers
  p = p.replace(/^\/uploads\/offers\//i, '/offers/');

  // se veio só "/arquivo.webp", assume /offers/
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 1) {
    p = `/offers/${parts[0]}`;
  }

  return queryPart ? `${p}?${queryPart}` : p;
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

  const normalizedImageUrl = normalizeImageUrl(db.imageUrl);

  return {
    id: db.id,
    slug: db.slug,

    city: db.city,
    status: db.status,

    categoryId: db.categoryId,
    category: catName,

    title: db.title,

    partnerName: db.partnerName,
    partner: db.partnerName,

    description: db.description ?? null,

    priceText: db.priceText ?? null,
    benefit: (db.priceText || '').trim() ? String(db.priceText) : db.title,

    imageUrl: normalizedImageUrl,
    images: pickImages(normalizedImageUrl),

    createdAt: db.createdAt.toISOString(),
    updatedAt: db.updatedAt.toISOString(),

    tenantId: 'default',
  };
}

async function safeListCategorias() {
  try {
    return await listCategorias();
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const where: Prisma.OfferWhereInput = {
      status: OfferStatus.publicado,
    };

    if (cityParamRaw) where.city = normalizeCity(cityParamRaw);
    if (categoryParam) where.categoryId = normalizeCat(categoryParam);

    const categorias = await safeListCategorias();
    const categoryNameById = new Map<string, string>();
    for (const c of categorias || []) {
      if (!c) continue;
      categoryNameById.set(String((c as any).id), String((c as any).nome ?? '').trim());
    }

    // ✅ IMPORTANTE: se o Prisma falhar por env/DB, não derruba a Home
    let rows: any[] = [];
    try {
      rows = await prisma.offer.findMany({
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
    } catch (err: any) {
      // fallback: devolve vazio com 200 (pra Home renderizar)
      return NextResponse.json(
        { items: [], total: 0, warning: 'Prisma/DB indisponível no momento.' },
        { status: 200 }
      );
    }

    const items = Array.isArray(rows) ? rows.map((r) => mapOffer(r as any, categoryNameById)) : [];
    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Falha ao buscar ofertas', detail: message }, { status: 500 });
  }
}
