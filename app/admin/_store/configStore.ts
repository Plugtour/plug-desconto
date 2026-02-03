// app/admin/_store/configStore.ts
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

type AdminConfigDB = {
  destinos: any[]; // mantemos any aqui pra suportar migração de dados antigos
  categorias: AdminCategoria[];
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
      const initial: AdminConfigDB = { destinos: [], categorias: [] };
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

export async function readConfig(): Promise<{ destinos: AdminDestino[]; categorias: AdminCategoria[] }> {
  // ✅ Se falhar ao criar/ler arquivo, devolve vazio ao invés de quebrar o site
  try {
    await ensureFile();
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return { destinos: [], categorias: [] };
    throw e;
  }

  let raw = '';
  try {
    raw = await fs.readFile(DB_PATH, 'utf-8');
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return { destinos: [], categorias: [] };
    // se o arquivo não existir por algum motivo, tenta recriar
    try {
      const initial: AdminConfigDB = { destinos: [], categorias: [] };
      await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      raw = JSON.stringify(initial);
    } catch (err: any) {
      if (isReadOnlyFsError(err)) return { destinos: [], categorias: [] };
      throw err;
    }
  }

  let parsed: AdminConfigDB;
  try {
    parsed = JSON.parse(raw) as AdminConfigDB;
  } catch {
    parsed = { destinos: [], categorias: [] };
  }

  const destinos = Array.isArray(parsed.destinos) ? parsed.destinos.map(normalizeDestino) : [];
  const categorias = Array.isArray(parsed.categorias) ? parsed.categorias.map(normalizeCategoria) : [];

  // ✅ grava de volta já normalizado (migração silenciosa) — mas nunca derruba em prod
  try {
    await fs.writeFile(DB_PATH, JSON.stringify({ destinos, categorias }, null, 2), 'utf-8');
  } catch (e: any) {
    if (!isReadOnlyFsError(e)) throw e;
  }

  return { destinos, categorias };
}

export async function writeConfig(db: { destinos: AdminDestino[]; categorias: AdminCategoria[] }) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e: any) {
    if (isReadOnlyFsError(e)) return;
    throw e;
  }
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

export async function updateCategoria(
  id: string,
  patch: Partial<Pick<AdminCategoria, 'nome' | 'ativo' | 'iconKey'>>
) {
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
