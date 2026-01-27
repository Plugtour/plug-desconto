// app/api/offers/[slug]/route.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { getTenantFromRequest } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

function normalizeCity(value: string) {
  return (value || '')
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

// Prisma cuid() geralmente começa com "c" e tem ~25+ chars
function looksLikeCuid(value: string) {
  return /^c[a-z0-9]{24,}$/i.test(value);
}

function extractTenantKey(tenant: unknown): string {
  if (!tenant) return '';

  if (typeof tenant === 'string') return tenant;

  if (typeof tenant === 'object') {
    const t = tenant as Record<string, unknown>;

    const city = typeof t.city === 'string' ? t.city : '';
    const id = typeof t.id === 'string' ? t.id : '';
    const tenantKey = typeof t.tenant === 'string' ? t.tenant : '';

    return city || id || tenantKey || '';
  }

  return '';
}

/**
 * 🔧 AJUSTE AQUI:
 * Next 16 exige params como Promise
 */
type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteCtx) {
  try {
    // 🔧 AJUSTE AQUI
    const { slug } = await context.params;

    const raw = decodeURIComponent(slug || '');

    // ✅ sua função NÃO recebe request
    const tenant = await getTenantFromRequest();
    const tenantKey = extractTenantKey(tenant);

    const city = tenantKey ? normalizeCity(tenantKey) : '';

    const whereBase: Prisma.OfferWhereInput = {
      // ⚠️ mantém como estava para não mexer no schema agora
      status: 'publicado' as any,
      ...(city ? { city } : {}),
    };

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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Falha ao buscar oferta', detail: message }, { status: 500 });
  }
}
