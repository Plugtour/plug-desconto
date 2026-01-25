// app/api/admin/offers/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

const allowed = new Set<OfferStatus>([
  'rascunho',
  'publicado',
  'pausado',
  'arquivado',
]);

type Params = { id: string };

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> } // ✅ Next 16.1 valida como Promise
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const status = body?.status as OfferStatus | undefined;

    if (!status || !allowed.has(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: { status: status as any }, // ✅ evita depender do enum do Prisma
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao atualizar oferta' },
      { status: 500 }
    );
  }
}
