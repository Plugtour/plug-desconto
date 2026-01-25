import { NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

function normalizeCity(value: string) {
  return value
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const cityParam = cityParamRaw ? normalizeCity(cityParamRaw) : null;

    // mantém compatibilidade com seu tenant.ts atual
    const tenant: any = (getTenantFromRequest as any)(request);

    const tenantKey =
      cityParam ||
      (typeof tenant === 'string'
        ? tenant
        : (tenant?.city as string) || (tenant?.tenant as string) || '');

    const where: any = {
      status: 'publicado',
    };

    if (tenantKey) where.city = normalizeCity(tenantKey);
    if (categoryParam) where.categoryId = normalizeCat(categoryParam);

    const items = await prisma.offer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
