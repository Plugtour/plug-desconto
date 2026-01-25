import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureUniqueSlug(base: string) {
  const cleanBase = slugify(base || 'oferta') || 'oferta';
  let slug = cleanBase;
  let i = 2;

  while (true) {
    const exists = await prisma.offer.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${cleanBase}-${i}`;
    i += 1;
  }
}

// ADMIN: lista tudo (rascunho/publicado/pausado/arquivado)
export async function GET() {
  try {
    const items = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items, total: items.length }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

// ADMIN: cria oferta
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = String(body?.title ?? '').trim();
    const partnerName = String(body?.partnerName ?? '').trim();
    const city = String(body?.city ?? '').trim();
    const categoryId = String(body?.categoryId ?? '').trim();
    const status = String(body?.status ?? 'rascunho');
    const description = body?.description ? String(body.description) : null;
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null;
    const priceText = body?.priceText ? String(body.priceText) : null;

    if (title.length < 4) {
      return NextResponse.json({ error: 'Título inválido' }, { status: 400 });
    }
    if (!partnerName) {
      return NextResponse.json({ error: 'Parceiro é obrigatório' }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: 'Cidade é obrigatória' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
    }

    const slug = await ensureUniqueSlug(title);

    const created = await prisma.offer.create({
      data: {
        slug,
        title,
        partnerName,
        city,
        categoryId,
        status: status as any,
        description,
        imageUrl,
        priceText,
      },
    });

    return NextResponse.json({ offer: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Falha ao criar oferta', detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
