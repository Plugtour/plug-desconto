// caminho: app/api/admin/upload/banner-image/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

import { decodeSession, getSessionCookieName } from '@/lib/session';

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

function isProdOnVercel() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export async function POST(req: Request) {
  const session = await requireMaster();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const baseName = safeBaseName(file.name) || 'banner';
    const stamp = Date.now();
    const fileBase = `${baseName}-${stamp}`;
    const filename = `${fileBase}.webp`;

    // gera webp (buffer) com sharp
    const webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    // ✅ Produção (Vercel): salva no Vercel Blob (persistente)
    if (isProdOnVercel()) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        return NextResponse.json(
          { ok: false, error: 'missing_blob_token', detail: 'Defina BLOB_READ_WRITE_TOKEN na Vercel.' },
          { status: 500 }
        );
      }

      let put: any;
      try {
        ({ put } = await import('@vercel/blob'));
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: 'missing_vercel_blob_pkg',
            detail: 'Instale @vercel/blob (npm i @vercel/blob) para upload funcionar na Vercel.',
          },
          { status: 500 }
        );
      }

      const blobPath = `banners/${filename}`;

      const res = await put(blobPath, webpBuffer, {
        access: 'public',
        contentType: 'image/webp',
        token,
        addRandomSuffix: false,
      });

      // res.url já é público
      return NextResponse.json({ ok: true, url: res.url }, { status: 200 });
    }

    // ✅ Localhost: salva em public/banners -> /banners/...
    const uploadDir = path.join(process.cwd(), 'public', 'banners');
    await fs.mkdir(uploadDir, { recursive: true });

    const outputPath = path.join(uploadDir, filename);
    await fs.writeFile(outputPath, webpBuffer);

    const url = `/banners/${filename}`;
    return NextResponse.json({ ok: true, url }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'upload_failed', detail: message }, { status: 500 });
  }
}
