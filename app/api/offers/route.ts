// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import type { Offer } from '@/lib/offers';
import {
  getOffersByTenant,
  getOffersByCity,
  getOffersByCityAndCategory,
  normalizeCat,
} from '@/lib/offers';

function normalizeCity(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParamRaw = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    const cityParam = cityParamRaw ? normalizeCity(cityParamRaw) : null;

    // ✅ evita erro de assinatura do tenant.ts
    const tenant: any = (getTenantFromRequest as any)(request);

    let items: Offer[] = [];

    // Prioridade:
    // 1) city + categoryId
    // 2) city
    // 3) tenant (fallback)
    if (cityParam && categoryParam) {
      // tenta por city+category
      items = getOffersByCityAndCategory(cityParam, categoryParam);

      // ✅ fallback: se city não existir no dataset, tenta como tenantKey
      if (!items.length) {
        items = getOffersByTenant(cityParam);
      }
    } else if (cityParam) {
      // tenta por city
      items = getOffersByCity(cityParam);

      // ✅ fallback: se city não existir no dataset, tenta como tenantKey
      if (!items.length) {
        items = getOffersByTenant(cityParam);
      }
    } else {
      const tenantKey =
        typeof tenant === 'string'
          ? tenant
          : (tenant?.city as string) || (tenant?.tenant as string) || '';

      items = tenantKey ? getOffersByTenant(tenantKey) : [];
    }

    // Normaliza categoryId se vier diferente
    if (categoryParam) {
      const cat = normalizeCat(categoryParam);
      items = items.filter((o) => normalizeCat(String(o.categoryId ?? '')) === cat);
    }

    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
