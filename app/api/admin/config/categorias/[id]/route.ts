// app/api/admin/config/categorias/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { deleteCategoria, updateCategoria } from '@/app/admin/_store/configStore';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

function isAdminStatus(v: any): v is AdminStatus {
  return v === 'rascunho' || v === 'publicado' || v === 'pausado' || v === 'arquivado' || v === 'lixeira';
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    const body = (await req.json().catch(() => null)) as
      | { nome?: string; ativo?: boolean; status?: AdminStatus; iconKey?: string | null }
      | null;

    if (!body) throw new Error('Body inválido.');

    const patch: any = {};

    if (typeof body.nome === 'string') patch.nome = body.nome;

    if (typeof body.iconKey === 'string' || body.iconKey === null) {
      patch.iconKey = body.iconKey;
    }

    if (isAdminStatus(body.status)) {
      patch.status = body.status;

      if (body.status === 'publicado') patch.ativo = true;
      if (body.status === 'pausado') patch.ativo = false;
    }

    if (typeof body.ativo === 'boolean') {
      patch.ativo = body.ativo;
    }

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
