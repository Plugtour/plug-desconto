// app/api/admin/upload/partner-image/route.ts

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

    // public/partners -> /partners/...
    const uploadDir = path.join(process.cwd(), 'public', 'partners');
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const baseName = safeBaseName(file.name) || 'imagem';
      const stamp = Date.now();
      const filename = `${baseName}-${stamp}.webp`;
      const outputPath = path.join(uploadDir, filename);

      await sharp(buffer)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      urls.push(`/partners/${filename}`);
    }

    return NextResponse.json({ ok: true, urls }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: 'upload_failed', detail: message }, { status: 500 });
  }
}
