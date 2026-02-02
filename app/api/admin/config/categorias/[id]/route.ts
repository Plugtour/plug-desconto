// app/api/admin/config/categorias/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { deleteCategoria, updateCategoria } from '@/app/admin/_store/configStore';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    const body = (await req.json().catch(() => null)) as { nome?: string; ativo?: boolean; iconKey?: string | null } | null;
    if (!body) throw new Error('Body inválido.');

    const patch: any = {};

    if (typeof body.nome === 'string') patch.nome = body.nome;
    if (typeof body.ativo === 'boolean') patch.ativo = body.ativo;

    if (typeof body.iconKey === 'string') patch.iconKey = body.iconKey;
    if (body.iconKey === null) patch.iconKey = null;

    const updated = await updateCategoria(cleanId, patch);
    return NextResponse.json({ categoria: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao atualizar.' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    await deleteCategoria(cleanId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao excluir.' }, { status: 400 });
  }
}
