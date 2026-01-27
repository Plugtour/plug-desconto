// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getTenantFromRequest } from '@/lib/tenant';

function normalizeCity(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeCat(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function extractTenantKey(tenant: unknown): string {
  if (!tenant) return '';

  if (typeof tenant === 'string') return tenant;

  if (typeof tenant === 'object') {
    const t = tenant as Record<string, unknown>;

    const city = typeof t.city === 'string' ? t.city : '';
    const id = typeof t.id === 'string' ? t.id : '';
    const tenantKey = typeof t.tenant === 'string' ? t.tenant : '';

    return city || id || tenantKey || '';
  }

  return '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // URL pode mandar city, mas se não mandar, usamos o tenant
    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const cityParam = cityParamRaw ? normalizeCity(cityParamRaw) : '';

    // ✅ sua função NÃO recebe request
    const tenant = await getTenantFromRequest();
    const tenantKey = cityParam || extractTenantKey(tenant);

    const where: Prisma.OfferWhereInput = {
      // ⚠️ evita erro de enum/string no schema
      status: 'publicado' as any,
    };

    if (tenantKey) where.city = normalizeCity(tenantKey);
    if (categoryParam) where.categoryId = normalizeCat(categoryParam);

    const items = await prisma.offer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Falha ao buscar ofertas', detail: message }, { status: 500 });
  }
}
