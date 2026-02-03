// app/api/config/categorias/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listCategorias } from '@/app/admin/_store/configStore';

export async function GET() {
  const categorias = await listCategorias();
  const ativas = (categorias || []).filter((c) => c.ativo);
  return NextResponse.json({ categorias: ativas }, { status: 200 });
}
