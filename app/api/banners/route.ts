// caminho: app/api/banners/route.ts

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listBanners } from '@/app/admin/_store/configStore';

export async function GET() {
  try {
    const all = await listBanners();

    // retorna só publicados (e com imagem)
    const banners = (Array.isArray(all) ? all : [])
      .filter((b: any) => String(b?.status ?? '').toLowerCase() === 'publicado')
      .filter((b: any) => String(b?.imageUrl ?? '').trim().length > 0)
      .sort((a: any, b: any) => Number(a?.order ?? 0) - Number(b?.order ?? 0));

    return NextResponse.json({ banners });
  } catch (e: any) {
    return NextResponse.json({ banners: [] });
  }
}
