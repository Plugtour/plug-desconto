// app/api/admin/config/destinos/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createDestino, listDestinos } from '@/app/admin/_store/configStore';

export async function GET() {
  try {
    const destinos = await listDestinos();
    return NextResponse.json({ destinos });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao listar destinos.' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { nome?: string };

    const nome = String(body?.nome ?? '').trim();
    if (!nome) {
      return NextResponse.json({ error: 'Informe o nome do destino.' }, { status: 400 });
    }

    const destino = await createDestino(nome);
    return NextResponse.json({ destino });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao criar destino.' }, { status: 400 });
  }
}
