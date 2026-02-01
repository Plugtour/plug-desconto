// app/api/admin/config/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { deleteDestino, updateDestino } from '@/app/admin/_store/configStore';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

function isAdminStatus(v: any): v is AdminStatus {
  return v === 'rascunho' || v === 'publicado' || v === 'pausado' || v === 'arquivado' || v === 'lixeira';
}

/**
 * ✅ Rota de compatibilidade
 * Alguns pontos antigos do projeto ainda chamam:
 *   /api/admin/config/:id
 * Este handler mantém compatibilidade tratando como "destino".
 */

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = String(params?.id ?? '').trim();
    if (!id) throw new Error('ID inválido.');

    const body = (await req.json().catch(() => null)) as
      | { nome?: string; ativo?: boolean; status?: AdminStatus }
      | null;

    if (!body) throw new Error('Body inválido.');

    const patch: any = {};

    if (typeof body.nome === 'string') patch.nome = body.nome;

    // Se veio "status", converte também para "ativo" quando aplicável
    if (isAdminStatus(body.status)) {
      patch.status = body.status;

      // compat com legado (ativo)
      if (body.status === 'publicado') patch.ativo = true;
      if (body.status === 'pausado') patch.ativo = false;
    }

    // Se veio "ativo" direto, respeita
    if (typeof body.ativo === 'boolean') {
      patch.ativo = body.ativo;
    }

    const updated = await updateDestino(id, patch);
    return NextResponse.json({ destino: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao atualizar.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = String(params?.id ?? '').trim();
    if (!id) throw new Error('ID inválido.');

    await deleteDestino(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao excluir.' }, { status: 400 });
  }
}
