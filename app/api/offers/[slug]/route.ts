import { NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

function normalizeCity(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeSlug(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Prisma cuid() geralmente começa com "c" e tem ~25 chars
function looksLikeCuid(value: string) {
  return /^c[a-z0-9]{24,}$/i.test(value);
}

type Params = Promise<{ slug: string }>;

export async function GET(request: Request, context: { params: Params }) {
  try {
    const { slug } = await context.params;
    const raw = decodeURIComponent(slug || '');

    // compatível com tenant.ts atual
    const tenant: any = (getTenantFromRequest as any)(request);
    const tenantKey =
      typeof tenant === 'string'
        ? tenant
        : (tenant?.city as string) || (tenant?.tenant as string) || '';

    const city = tenantKey ? normalizeCity(tenantKey) : null;

    const whereBase: any = {
      status: 'publicado',
    };

    // se tiver tenant/cidade, trava a consulta na cidade
    if (city) whereBase.city = city;

    let offer = null;

    // tenta por ID (cuid) ou por slug
    if (looksLikeCuid(raw)) {
      offer = await prisma.offer.findFirst({
        where: { ...whereBase, id: raw },
      });
    }

    if (!offer) {
      const slugNorm = normalizeSlug(raw);
      offer = await prisma.offer.findFirst({
        where: { ...whereBase, slug: slugNorm },
      });
    }

    if (!offer) {
      return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ offer }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao buscar oferta', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
