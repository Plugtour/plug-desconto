// caminho: app/api/admin/config/banners/[id]/route.ts

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { updateBanner, deleteBanner } from '@/app/admin/_store/configStore';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    const body = (await req.json().catch(() => null)) as any;
    if (!body) throw new Error('Body inválido.');

    const updated = await updateBanner(cleanId, body);
    return NextResponse.json({ banner: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao atualizar banner.' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const cleanId = String(id ?? '').trim();
    if (!cleanId) throw new Error('ID inválido.');

    await deleteBanner(cleanId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao excluir banner.' }, { status: 400 });
  }
}
