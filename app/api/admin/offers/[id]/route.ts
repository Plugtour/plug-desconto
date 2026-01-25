// app/api/admin/offers/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const status = String(body?.status ?? '').trim();

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    if (!['rascunho', 'publicado', 'pausado', 'arquivado'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: { status: status as any },
    });

    return NextResponse.json({ offer: updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao atualizar status', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
