// app/api/admin/upload/offer-image/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

import { decodeSession, getSessionCookieName } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function requireMaster() {
  const c = await cookies();
  const raw = c.get(getSessionCookieName())?.value ?? null;
  const session = decodeSession(raw);
  if (!session || session.role !== 'master') return null;
  return session;
}

function safeBaseName(input: string) {
  const ext = path.extname(input).toLowerCase();
  return path
    .basename(input, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(req: Request) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ ok: false, error: 'no_files' }, { status: 400 });
    }

    // public/offers -> /offers/...
    const uploadDir = path.join(process.cwd(), 'public', 'offers');
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    // tamanhos usados pelo SponsoredOffersList (thumb 106px => 128/256)
    const VARIANTS = [128, 256];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const baseName = safeBaseName(file.name) || 'imagem';
      const stamp = Date.now();
      const fileBase = `${baseName}-${stamp}`;
      const filename = `${fileBase}.webp`;

      const outputPath = path.join(uploadDir, filename);

      // base (modal / telas maiores)
      await sharp(buffer)
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      // variantes responsivas: -w128 / -w256
      for (const w of VARIANTS) {
        const variantName = `${fileBase}-w${w}.webp`;
        const variantPath = path.join(uploadDir, variantName);

        await sharp(buffer)
          .rotate()
          .resize({ width: w, height: w, fit: 'cover', position: 'centre' })
          .webp({ quality: 78 })
          .toFile(variantPath);
      }

      // retorna a URL base (sem -w###)
      urls.push(`/offers/${filename}`);
    }

    return NextResponse.json({ ok: true, urls }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'upload_failed', detail: message }, { status: 500 });
  }
}
