import { NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { getOffersByTenant, normalizeCat, slugifyKey } from '@/lib/offers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const tenant = await getTenantFromRequest();

  const categoryParam = normalizeCat(searchParams.get('category') || undefined);
  const categoryKey = categoryParam ? slugifyKey(categoryParam) : '';

  const offers = await getOffersByTenant(tenant?.id ?? null);

  const filtered =
    categoryKey.length > 0
      ? offers.filter(
          (o) => slugifyKey((o.category || '').trim() || 'Outros') === categoryKey
        )
      : offers;

  return NextResponse.json({
    ok: true,
    total: filtered.length,
    items: filtered.map((o) => ({
      id: o.id,
      slug: o.slug,
      tenantId: o.tenantId,
      category: o.category,
      title: o.title,
      partner: o.partner,
      benefit: o.benefit,
      description: o.description,
    })),
  });
}
