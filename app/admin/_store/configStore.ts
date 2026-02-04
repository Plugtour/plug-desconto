// caminho: app/admin/_store/configStore.ts
import { promises as fs } from 'fs';
import path from 'path';

export type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

export type AdminDestino = {
  id: string;
  nome: string;
  slug: string;
  status: AdminStatus;
  criadoEm: string;
  atualizadoEm: string;
};

export type AdminCategoria = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  iconKey?: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type AdminBannerAlign = 'left' | 'center' | 'right';

export type AdminBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  highlight?: string | null;
  tag?: string | null;
  href?: string | null;
  imageUrl: string;
  align?: AdminBannerAlign;
  status: AdminStatus;
  order: number;
  criadoEm: string;
  atualizadoEm: string;
};

type AdminConfigDB = {
  destinos: any[]; // mantemos any aqui pra suportar migração de dados antigos
  categorias: AdminCategoria[];
  banners?: any[]; // ✅ novo (mantém compat com json antigo)
};

function isReadOnlyFsError(e: any) {
  const msg = String(e?.message ?? e ?? '');
  return msg.includes('EROFS') || msg.includes('read-only file system');
}

// ✅ Em produção na Vercel, o bundle é read-only (/var/task). Use /tmp.
const IS_VERCEL = Boolean(process.env.VERCEL);
const DB_PATH = IS_VERCEL
  ? path.join('/tmp', 'adminConfig.json')
  : path.join(process.cwd(), 'app', 'admin', '_store', 'adminConfig.json');

function slugify(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}

async function ensureFile() {
  try {
    await fs.access(DB_PATH);
  } catch (e: any) {
    try {
      const initial: AdminConfigDB = { destinos: [], categorias: [], banners: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    } catch (err: any) {
      // Se por algum motivo não der pra gravar, não derruba a aplicação.
      if (isReadOnlyFsError(err)) return;
      throw err;
    }
  }
}

/**
 * ✅ Migra destinos antigos:
 * - se não existir status, tenta usar "ativo" antigo:
 *   ativo=true -> publicado
 *   ativo=false -> rascunho
 */
function normalizeDestino(d: any): AdminDestino {
  const now = new Date().toISOString();
  const nome = String(d?.nome ?? '').trim();
  const criadoEm = String(d?.criadoEm ?? d?.createdAt ?? now);
  const atualizadoEm = String(d?.atualizadoEm ?? d?.updatedAt ?? criadoEm);

  let status = String(d?.status ?? '').toLowerCase() as AdminStatus;
  if (
    status !== 'rascunho' &&
    status !== 'publicado' &&
    status !== 'pausado' &&
    status !== 'arquivado' &&
    status !== 'lixeira'
  ) {
    const ativo = Boolean(d?.ativo ?? true);
    status = ativo ? 'publicado' : 'rascunho';
  }

  const slug = String(d?.slug ?? slugify(nome));

  return {
    id: String(d?.id ?? uid('dest')),
    nome,
    slug,
    status,
    criadoEm,
    atualizadoEm,
  };
}

function normalizeCategoria(c: any): AdminCategoria {
  const now = new Date().toISOString();
  const nome = String(c?.nome ?? '').trim();
  const criadoEm = String(c?.criadoEm ?? c?.createdAt ?? now);
  const atualizadoEm = String(c?.atualizadoEm ?? c?.updatedAt ?? criadoEm);
  const slug = String(c?.slug ?? slugify(nome));
  const ativo = typeof c?.ativo === 'boolean' ? c.ativo : true;

  const iconKeyRaw = c?.iconKey;
  const iconKey = typeof iconKeyRaw === 'string' && iconKeyRaw.trim() ? iconKeyRaw.trim() : null;

  return {
    id: String(c?.id ?? uid('cat')),
    nome,
    slug,
    ativo,
    iconKey,
    criadoEm,
    atualizadoEm,
  };
}

function normalizeBanner(b: any): AdminBanner {
  const now = new Date().toISOString();

  const title = String(b?.title ?? b?.nome ?? '').trim();
  const subtitle = b?.subtitle != null ? String(b.subtitle) : null;
  const highlight = b?.highlight != null ? String(b.highlight) : null;
  const tag = b?.tag != null ? String(b.tag) : null;
  const href = b?.href != null ? String(b.href) : null;
  const imageUrl = String(b?.imageUrl ?? b?.image ?? b?.url ?? '').trim();

  const criadoEm = String(b?.criadoEm ?? b?.createdAt ?? now);
  const atualizadoEm = String(b?.atualizadoEm ?? b?.updatedAt ?? criadoEm);

  let status = String(b?.status ?? '').toLowerCase() as AdminStatus;
  if (
    status !== 'rascunho' &&
    status !== 'publicado' &&
    status !== 'pausado' &&
    status !== 'arquivado' &&
    status !== 'lixeira'
  ) {
    const ativo = typeof b?.active === 'boolean' ? b.active : typeof b?.ativo === 'boolean' ? b.ativo : true;
    status = ativo ? 'publicado' : 'rascunho';
  }

  const alignRaw = String(b?.align ?? '').toLowerCase();
  const align: AdminBannerAlign | undefined =
    alignRaw === 'left' || alignRaw === 'center' || alignRaw === 'right' ? (alignRaw as AdminBannerAlign) : undefined;

  const orderNum =
    typeof b?.order === 'number'
      ? b.order
      : typeof b?.ordem === 'number'
        ? b.ordem
        : Number.isFinite(Number(b?.order))
          ? Number(b?.order)
          : 0;

  return {
    id: String(b?.id ?? uid('ban')),
    title,
    subtitle,
    highlight,
    tag,
    href,
    imageUrl,
    align,
    status,
    order: Number.isFinite(orderNum) ? orderNum : 0,
    criadoEm,
    atualizadoEm,
  };
}

async function readFullConfig(): Promise<{ destinos: AdminDestino[]; categorias: AdminCategoria[]; banners: AdminBanner[] }> {
  // ✅ Se falhar ao criar/ler arquivo, devolve vazio ao invés de quebrar o site
  try {
    await ensureFile();
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return { destinos: [], categorias: [], banners: [] };
    throw e;
  }

  let raw = '';
  try {
    raw = await fs.readFile(DB_PATH, 'utf-8');
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return { destinos: [], categorias: [], banners: [] };
    // se o arquivo não existir por algum motivo, tenta recriar
    try {
      const initial: AdminConfigDB = { destinos: [], categorias: [], banners: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      raw = JSON.stringify(initial);
    } catch (err: any) {
      if (isReadOnlyFsError(err)) return { destinos: [], categorias: [], banners: [] };
      throw err;
    }
  }

  let parsed: AdminConfigDB;
  try {
    parsed = JSON.parse(raw) as AdminConfigDB;
  } catch {
    parsed = { destinos: [], categorias: [], banners: [] };
  }

  const destinos = Array.isArray(parsed.destinos) ? parsed.destinos.map(normalizeDestino) : [];
  const categorias = Array.isArray(parsed.categorias) ? parsed.categorias.map(normalizeCategoria) : [];
  const banners = Array.isArray(parsed.banners) ? parsed.banners.map(normalizeBanner) : [];

  // ✅ grava de volta já normalizado (migração silenciosa) — mas nunca derruba em prod
  try {
    await fs.writeFile(DB_PATH, JSON.stringify({ destinos, categorias, banners }, null, 2), 'utf-8');
  } catch (e: any) {
    if (!isReadOnlyFsError(e)) throw e;
  }

  return { destinos, categorias, banners };
}

async function writeFullConfig(db: { destinos: AdminDestino[]; categorias: AdminCategoria[]; banners: AdminBanner[] }) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return;
    throw e;
  }
}

export async function readConfig(): Promise<{ destinos: AdminDestino[]; categorias: AdminCategoria[] }> {
  const db = await readFullConfig();
  return { destinos: db.destinos, categorias: db.categorias };
}

export async function writeConfig(db: { destinos: AdminDestino[]; categorias: AdminCategoria[] }) {
  // ✅ não derruba banners existentes
  const full = await readFullConfig();
  full.destinos = db.destinos;
  full.categorias = db.categorias;
  await writeFullConfig(full);
}

export async function listDestinos(): Promise<AdminDestino[]> {
  const db = await readConfig();
  return db.destinos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function createDestino(nome: string) {
  const db = await readConfig();
  const now = new Date().toISOString();
  const clean = nome.trim();
  const slug = slugify(clean);

  const exists = db.destinos.some((d) => d.slug === slug);
  if (exists) throw new Error('Já existe um destino com esse nome.');

  const item: AdminDestino = {
    id: uid('dest'),
    nome: clean,
    slug,
    status: 'publicado',
    criadoEm: now,
    atualizadoEm: now,
  };

  db.destinos.push(item);
  await writeConfig(db);
  return item;
}

export async function updateDestino(id: string, patch: Partial<Pick<AdminDestino, 'nome' | 'status'>>) {
  const db = await readConfig();
  const idx = db.destinos.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Destino não encontrado.');

  const current = db.destinos[idx];
  const now = new Date().toISOString();

  const nextNome = patch.nome?.trim() ?? current.nome;
  const nextSlug = slugify(nextNome);

  const conflict = db.destinos.some((d) => d.id !== id && d.slug === nextSlug);
  if (conflict) throw new Error('Já existe outro destino com esse nome.');

  let nextStatus = (patch.status ?? current.status) as AdminStatus;
  if (
    nextStatus !== 'rascunho' &&
    nextStatus !== 'publicado' &&
    nextStatus !== 'pausado' &&
    nextStatus !== 'arquivado' &&
    nextStatus !== 'lixeira'
  ) {
    nextStatus = current.status;
  }

  db.destinos[idx] = {
    ...current,
    nome: nextNome,
    slug: nextSlug,
    status: nextStatus,
    atualizadoEm: now,
  };

  await writeConfig(db);
  return db.destinos[idx];
}

export async function deleteDestino(id: string) {
  const db = await readConfig();
  const before = db.destinos.length;
  db.destinos = db.destinos.filter((d) => d.id !== id);
  if (db.destinos.length === before) throw new Error('Destino não encontrado.');
  await writeConfig(db);
  return true;
}

// ===== categorias =====

export async function listCategorias() {
  const db = await readConfig();
  return db.categorias.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function createCategoria(nome: string, iconKey?: string | null) {
  const db = await readConfig();
  const now = new Date().toISOString();
  const cleanName = nome.trim();
  const slug = slugify(cleanName);

  const exists = db.categorias.some((c) => c.slug === slug);
  if (exists) throw new Error('Já existe uma categoria com esse nome.');

  const cleanIcon = typeof iconKey === 'string' && iconKey.trim() ? iconKey.trim() : null;

  const item: AdminCategoria = {
    id: uid('cat'),
    nome: cleanName,
    slug,
    ativo: true,
    iconKey: cleanIcon,
    criadoEm: now,
    atualizadoEm: now,
  };

  db.categorias.push(item);
  await writeConfig(db);
  return item;
}

export async function updateCategoria(id: string, patch: Partial<Pick<AdminCategoria, 'nome' | 'ativo' | 'iconKey'>>) {
  const db = await readConfig();
  const idx = db.categorias.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoria não encontrada.');

  const current = db.categorias[idx];
  const now = new Date().toISOString();

  const nextNome = patch.nome?.trim() ?? current.nome;
  const nextSlug = slugify(nextNome);

  const conflict = db.categorias.some((c) => c.id !== id && c.slug === nextSlug);
  if (conflict) throw new Error('Já existe outra categoria com esse nome.');

  const nextIcon =
    patch.hasOwnProperty('iconKey')
      ? typeof patch.iconKey === 'string' && patch.iconKey.trim()
        ? patch.iconKey.trim()
        : null
      : current.iconKey ?? null;

  db.categorias[idx] = {
    ...current,
    nome: nextNome,
    slug: nextSlug,
    ativo: patch.ativo ?? current.ativo,
    iconKey: nextIcon,
    atualizadoEm: now,
  };

  await writeConfig(db);
  return db.categorias[idx];
}

export async function deleteCategoria(id: string) {
  const db = await readConfig();
  const before = db.categorias.length;
  db.categorias = db.categorias.filter((c) => c.id !== id);
  if (db.categorias.length === before) throw new Error('Categoria não encontrada.');
  await writeConfig(db);
  return true;
}

// ===== banners =====

export async function listBanners(): Promise<AdminBanner[]> {
  const db = await readFullConfig();
  return db.banners
    .slice()
    .sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title, 'pt-BR'));
}

export async function createBanner(input: Omit<AdminBanner, 'id' | 'criadoEm' | 'atualizadoEm'>) {
  const db = await readFullConfig();
  const now = new Date().toISOString();

  const title = String(input?.title ?? '').trim();
  const imageUrl = String(input?.imageUrl ?? '').trim();
  if (!title) throw new Error('Título inválido.');
  if (!imageUrl) throw new Error('Imagem inválida.');

  const item: AdminBanner = {
    id: uid('ban'),
    title,
    subtitle: input.subtitle ?? null,
    highlight: input.highlight ?? null,
    tag: input.tag ?? null,
    href: input.href ?? null,
    imageUrl,
    align: input.align,
    status: input.status ?? 'publicado',
    order: Number.isFinite(input.order) ? input.order : 0,
    criadoEm: now,
    atualizadoEm: now,
  };

  db.banners.push(item);
  await writeFullConfig(db);
  return item;
}

export async function updateBanner(
  id: string,
  patch: Partial<
    Pick<
      AdminBanner,
      'title' | 'subtitle' | 'highlight' | 'tag' | 'href' | 'imageUrl' | 'align' | 'status' | 'order'
    >
  >
) {
  const db = await readFullConfig();
  const idx = db.banners.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Banner não encontrado.');

  const current = db.banners[idx];
  const now = new Date().toISOString();

  const nextTitle = patch.title != null ? String(patch.title).trim() : current.title;
  const nextImageUrl = patch.imageUrl != null ? String(patch.imageUrl).trim() : current.imageUrl;

  if (!nextTitle) throw new Error('Título inválido.');
  if (!nextImageUrl) throw new Error('Imagem inválida.');

  let nextStatus = (patch.status ?? current.status) as AdminStatus;
  if (
    nextStatus !== 'rascunho' &&
    nextStatus !== 'publicado' &&
    nextStatus !== 'pausado' &&
    nextStatus !== 'arquivado' &&
    nextStatus !== 'lixeira'
  ) {
    nextStatus = current.status;
  }

  const alignRaw = patch.align ?? current.align;
  const nextAlign: AdminBannerAlign | undefined =
    alignRaw === 'left' || alignRaw === 'center' || alignRaw === 'right' ? alignRaw : undefined;

  const nextOrder =
    patch.hasOwnProperty('order') ? (Number.isFinite(Number(patch.order)) ? Number(patch.order) : 0) : current.order;

  db.banners[idx] = {
    ...current,
    title: nextTitle,
    subtitle: patch.hasOwnProperty('subtitle') ? (patch.subtitle ?? null) : current.subtitle ?? null,
    highlight: patch.hasOwnProperty('highlight') ? (patch.highlight ?? null) : current.highlight ?? null,
    tag: patch.hasOwnProperty('tag') ? (patch.tag ?? null) : current.tag ?? null,
    href: patch.hasOwnProperty('href') ? (patch.href ?? null) : current.href ?? null,
    imageUrl: nextImageUrl,
    align: nextAlign,
    status: nextStatus,
    order: nextOrder,
    atualizadoEm: now,
  };

  await writeFullConfig(db);
  return db.banners[idx];
}

export async function deleteBanner(id: string) {
  const db = await readFullConfig();
  const before = db.banners.length;
  db.banners = db.banners.filter((b) => b.id !== id);
  if (db.banners.length === before) throw new Error('Banner não encontrado.');
  await writeFullConfig(db);
  return true;
}
