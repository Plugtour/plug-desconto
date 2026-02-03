// app/api/admin/config/destinos/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { deleteDestino, updateDestino } from '@/app/admin/_store/configStore';

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
      | { nome?: string; status?: AdminStatus; ativo?: boolean }
      | null;

    if (!body) throw new Error('Body inválido.');

    const patch: any = {};

    // nome
    if (typeof body.nome === 'string') patch.nome = body.nome;

    // status (novo padrão)
    if (isAdminStatus(body.status)) {
      patch.status = body.status;
    }

    // compat legado (se vier ativo)
    if (typeof body.ativo === 'boolean') {
      patch.status = body.ativo ? 'publicado' : 'pausado';
    }

    // se não veio nada pra atualizar
    if (!('nome' in patch) && !('status' in patch)) {
      throw new Error('Nada para atualizar.');
    }

    const updated = await updateDestino(cleanId, patch);
    return NextResponse.json({ destino: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao atualizar.' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    await deleteDestino(cleanId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao excluir.' }, { status: 400 });
  }
}
