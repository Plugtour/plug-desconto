// app/admin/_store/configStore.ts
import { promises as fs } from 'fs';
import path from 'path';

export type AdminDestino = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type AdminCategoria = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type AdminConfigDB = {
  destinos: AdminDestino[];
  categorias: AdminCategoria[];
};

const DB_PATH = path.join(process.cwd(), 'app', 'admin', '_store', 'adminConfig.json');

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
  } catch {
    const initial: AdminConfigDB = { destinos: [], categorias: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export async function readConfig(): Promise<AdminConfigDB> {
  await ensureFile();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw) as AdminConfigDB;
}

export async function writeConfig(db: AdminConfigDB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function listDestinos() {
  const db = await readConfig();
  return db.destinos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function listCategorias() {
  const db = await readConfig();
  return db.categorias.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export async function createDestino(nome: string) {
  const db = await readConfig();
  const now = new Date().toISOString();
  const slug = slugify(nome);

  const exists = db.destinos.some((d) => d.slug === slug);
  if (exists) throw new Error('Já existe um destino com esse nome.');

  const item: AdminDestino = {
    id: uid('dest'),
    nome: nome.trim(),
    slug,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
  };

  db.destinos.push(item);
  await writeConfig(db);
  return item;
}

export async function updateDestino(id: string, patch: Partial<Pick<AdminDestino, 'nome' | 'ativo'>>) {
  const db = await readConfig();
  const idx = db.destinos.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Destino não encontrado.');

  const current = db.destinos[idx];
  const now = new Date().toISOString();

  const nextNome = patch.nome?.trim() ?? current.nome;
  const nextSlug = slugify(nextNome);

  const conflict = db.destinos.some((d) => d.id !== id && d.slug === nextSlug);
  if (conflict) throw new Error('Já existe outro destino com esse nome.');

  db.destinos[idx] = {
    ...current,
    nome: nextNome,
    slug: nextSlug,
    ativo: patch.ativo ?? current.ativo,
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

export async function createCategoria(nome: string) {
  const db = await readConfig();
  const now = new Date().toISOString();
  const slug = slugify(nome);

  const exists = db.categorias.some((c) => c.slug === slug);
  if (exists) throw new Error('Já existe uma categoria com esse nome.');

  const item: AdminCategoria = {
    id: uid('cat'),
    nome: nome.trim(),
    slug,
    ativo: true,
    criadoEm: now,
    atualizadoEm: now,
  };

  db.categorias.push(item);
  await writeConfig(db);
  return item;
}

export async function updateCategoria(id: string, patch: Partial<Pick<AdminCategoria, 'nome' | 'ativo'>>) {
  const db = await readConfig();
  const idx = db.categorias.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoria não encontrada.');

  const current = db.categorias[idx];
  const now = new Date().toISOString();

  const nextNome = patch.nome?.trim() ?? current.nome;
  const nextSlug = slugify(nextNome);

  const conflict = db.categorias.some((c) => c.id !== id && c.slug === nextSlug);
  if (conflict) throw new Error('Já existe outra categoria com esse nome.');

  db.categorias[idx] = {
    ...current,
    nome: nextNome,
    slug: nextSlug,
    ativo: patch.ativo ?? current.ativo,
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
