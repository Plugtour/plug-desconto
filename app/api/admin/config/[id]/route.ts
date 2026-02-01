// app/api/admin/config/destinos/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { deleteDestino, updateDestino } from '@/app/admin/_store/configStore';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { nome?: string; ativo?: boolean };
    const updated = await updateDestino(params.id, body);
    return NextResponse.json({ destino: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao atualizar.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await deleteDestino(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao excluir.' }, { status: 400 });
  }
}
