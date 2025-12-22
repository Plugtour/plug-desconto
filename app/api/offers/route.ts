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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cityParam = searchParams.get('city');
    const categoryParam = searchParams.get('categoryId');

    // ✅ evita erro de "2 args esperados" sem depender da assinatura do tenant.ts
    const tenant: any = (getTenantFromRequest as any)(request);

    let items: Offer[] = [];

    // Prioridade:
    // 1) city + categoryId
    // 2) city
    // 3) tenant (fallback)
    if (cityParam && categoryParam) {
      items = getOffersByCityAndCategory(cityParam, categoryParam);
    } else if (cityParam) {
      items = getOffersByCity(cityParam);
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
