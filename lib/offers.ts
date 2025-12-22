// lib/offers.ts
import { safeEncode } from '@/lib/urls';
import { OFFERS as OFFERS_RAW } from '@/config/offers';

export type FixedCategoryId =
  | 'alimentacao'
  | 'passeios'
  | 'atracoes'
  | 'hospedagem'
  | 'compras'
  | 'servicos'
  | 'transporte'
  | 'eventos';

export type Offer = {
  id?: string;
  slug?: string;
  title?: string;

  // o sistema usa esses 2 para filtrar
  city?: string;
  categoryId?: string;

  // qualquer outro campo do seu config/offers.ts pode vir junto
  [key: string]: any;
};

/** Normaliza texto para comparar e filtrar */
export function normalizeCat(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Chave estável para slug (categoria, cidade, etc) */
export function slugifyKey(value: string) {
  const v = normalizeCat(value);
  return safeEncode(v.replace(/\s+/g, '-'));
}

/** Pega o array bruto do config e força para array */
function rawArray(): any[] {
  const raw: any = OFFERS_RAW as any;
  return Array.isArray(raw) ? raw : Array.isArray(raw?.OFFERS) ? raw.OFFERS : [];
}

/** Converte um item qualquer do config para o nosso Offer interno */
function coerceOffer(o: any): Offer {
  const city = o?.city ?? o?.cidade ?? o?.local ?? o?.location;
  const categoryId = o?.categoryId ?? o?.category ?? o?.categoria ?? o?.cat;

  return {
    ...o,
    city: city ? String(city) : undefined,
    categoryId: categoryId ? String(categoryId) : undefined,
    id: o?.id != null ? String(o.id) : undefined,
    slug: o?.slug != null ? String(o.slug) : undefined,
    title: o?.title ?? o?.titulo ?? o?.name,
  };
}

/** Lista já normalizada */
export function getAllOffers(): Offer[] {
  return rawArray().map(coerceOffer);
}

export function getOffersByCity(city: string): Offer[] {
  const c = normalizeCat(city);
  return getAllOffers().filter((o) => normalizeCat(String(o.city ?? '')) === c);
}

export function getOffersByCityAndCategory(city: string, categoryId: string): Offer[] {
  const c = normalizeCat(city);
  const cat = normalizeCat(categoryId);
  return getAllOffers().filter(
    (o) =>
      normalizeCat(String(o.city ?? '')) === c &&
      normalizeCat(String(o.categoryId ?? '')) === cat
  );
}

/**
 * ✅ Mantém compatibilidade com o que você tentou usar no route.ts:
 * getOffersByTenant (aqui tratamos tenant como "city")
 */
export function getOffersByTenant(tenantKey: string): Offer[] {
  return getOffersByCity(tenantKey);
}

/** Categorias com contagem (opcional, útil pro menu) */
export async function getCategoriesWithCount(city?: string) {
  const list = city ? getOffersByCity(city) : getAllOffers();
  const map = new Map<string, { label: string; count: number }>();

  for (const o of list) {
    const key = normalizeCat(String(o.categoryId ?? ''));
    if (!key) continue;

    const current = map.get(key);
    if (current) current.count += 1;
    else map.set(key, { label: String(o.categoryId ?? key), count: 1 });
  }

  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

/** Cidades com contagem (opcional) */
export async function getCitiesWithCount() {
  const list = getAllOffers();
  const map = new Map<string, { label: string; count: number }>();

  for (const o of list) {
    const key = normalizeCat(String(o.city ?? ''));
    if (!key) continue;

    const current = map.get(key);
    if (current) current.count += 1;
    else map.set(key, { label: String(o.city ?? key), count: 1 });
  }

  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

/** Busca por slug OU id (pra página do benefício) */
export function getOfferBySlugOrId(slugOrId: string): Offer | null {
  const key = String(slugOrId ?? '').trim();
  if (!key) return null;

  const list = getAllOffers();
  return (
    list.find((o) => String(o.slug ?? '').trim() === key) ??
    list.find((o) => String(o.id ?? '').trim() === key) ??
    null
  );
}
