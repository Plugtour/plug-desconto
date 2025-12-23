// lib/offers.ts
import { OFFERS } from '@/config/offers';

/* =========================
   TIPOS
========================= */

export type CityId = string;

export type Offer = {
  id: string;
  slug: string;
  title: string;
  city?: CityId | null;
  categoryId?: string | null;
  tenantId?: string | null;

  [key: string]: any;
};

/* =========================
   NORMALIZAÇÃO
========================= */

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeCat(value: string) {
  return safeDecode(String(value ?? ''))
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function normalizeSlugOrId(value: string) {
  return normalizeCat(value);
}

/* =========================
   BASE
========================= */

function asOfferArray(): Offer[] {
  return Array.isArray(OFFERS) ? (OFFERS as Offer[]) : [];
}

export function getAllOffers(): Offer[] {
  return asOfferArray();
}

/* =========================
   QUERIES (compatíveis)
========================= */

export function getOffersByTenant(tenantId: string): Offer[] {
  const t = normalizeCat(tenantId);
  return asOfferArray().filter(
    (o) => normalizeCat(String(o.tenantId ?? '')) === t
  );
}

export function getOffersByCity(city: CityId): Offer[] {
  const c = normalizeCat(city);
  return asOfferArray().filter(
    (o) => normalizeCat(String(o.city ?? '')) === c
  );
}

export function getOffersByCityAndCategory(
  city: CityId,
  categoryId: string
): Offer[] {
  const c = normalizeCat(city);
  const cat = normalizeCat(categoryId);

  return asOfferArray().filter(
    (o) =>
      normalizeCat(String(o.city ?? '')) === c &&
      normalizeCat(String(o.categoryId ?? '')) === cat
  );
}

export function getOfferBySlugOrId(slugOrId: string): Offer | null {
  const key = normalizeSlugOrId(slugOrId);
  const all = asOfferArray();

  const bySlug = all.find(
    (o) => normalizeSlugOrId(String(o.slug ?? '')) === key
  );
  if (bySlug) return bySlug;

  const byId = all.find(
    (o) => normalizeSlugOrId(String(o.id ?? '')) === key
  );
  if (byId) return byId;

  return null;
}
