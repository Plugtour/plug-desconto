// app/api/offers/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getOfferBySlugOrId, normalizeSlugOrId } from '@/lib/offers';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, context: { params: Params }) {
  try {
    const { slug } = await context.params;

    const key = normalizeSlugOrId(slug);
    const offer = getOfferBySlugOrId(key);

    if (!offer) {
      return NextResponse.json(
        { error: 'Oferta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ offer }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao buscar oferta', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
