// app/api/categories/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listCategorias } from '@/app/admin/_store/configStore';

export async function GET() {
  const categorias = await listCategorias();

  const active = (categorias || [])
    .filter((c) => c && c.ativo)
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      ativo: c.ativo,
      iconKey: c.iconKey ?? null,
    }));

  return NextResponse.json({ categories: active });
}
