// app/api/admin/config/destinos/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createDestino, listDestinos } from '@/app/admin/_store/configStore';

export async function GET() {
  const destinos = await listDestinos();
  return NextResponse.json({ destinos });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { nome?: string };
    const nome = (body?.nome || '').trim();
    if (!nome) return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 });

    const created = await createDestino(nome);
    return NextResponse.json({ destino: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao criar.' }, { status: 400 });
  }
}
