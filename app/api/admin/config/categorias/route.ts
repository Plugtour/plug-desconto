// app/api/admin/config/categorias/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createCategoria, listCategorias } from '@/app/admin/_store/configStore';

export async function GET() {
  const categorias = await listCategorias();
  return NextResponse.json({ categorias });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { nome?: string; iconKey?: string | null };

    const nome = (body?.nome || '').trim();
    if (!nome) return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 });

    const iconKey = typeof body?.iconKey === 'string' ? body.iconKey : null;

    const created = await createCategoria(nome, iconKey);
    return NextResponse.json({ categoria: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao criar.' }, { status: 400 });
  }
}
