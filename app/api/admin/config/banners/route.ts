export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { listBanners, createBanner } from '@/app/admin/_store/configStore';

export async function GET() {
  try {
    const banners = await listBanners();
    return NextResponse.json({ banners });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao listar banners.' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    if (!body) throw new Error('Body inválido.');

    const created = await createBanner(body);
    return NextResponse.json({ banner: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao criar banner.' }, { status: 400 });
  }
}
