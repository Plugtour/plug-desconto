import { NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { getOfferBySlugOrId, normalizeSlugOrId } from '@/lib/offers';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const tenant = await getTenantFromRequest();

  const { slug } = await params;
  const raw = normalizeSlugOrId(slug);

  const offer = await getOfferBySlugOrId(tenant?.id ?? null, raw);

  if (!offer) {
    return NextResponse.json(
      { ok: false, error: 'Oferta não encontrada' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    item: {
      id: offer.id,
      slug: offer.slug,
      tenantId: offer.tenantId,
      category: offer.category,
      title: offer.title,
      partner: offer.partner,
      benefit: offer.benefit,
      description: offer.description,
    },
  });
}
