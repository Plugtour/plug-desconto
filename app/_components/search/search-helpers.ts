// app/_components/search/search-helpers.ts

import type { SearchCategory, SearchOffer } from './types';

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function buildOfferHref(o: Pick<SearchOffer, 'id' | 'slug'>) {
  const key = o.slug && o.slug.trim() ? o.slug.trim() : o.id;
  return `/oferta/${encodeURIComponent(key)}`;
}

function scoreOffer(queryN: string, offer: SearchOffer) {
  const titleN = normalizeText(offer.title || '');
  const subtitleN = normalizeText(offer.subtitle || '');
  const cityN = normalizeText(offer.city || '');

  if (titleN.startsWith(queryN)) return 100;
  if (titleN.includes(queryN)) return 80;
  if (subtitleN.includes(queryN)) return 55;
  if (cityN.includes(queryN)) return 40;

  return 0;
}

export function searchOffers(offers: SearchOffer[], query: string, limit = 8) {
  const qN = normalizeText(query ?? '');
  if (!qN || qN.length < 1) return [];

  return offers
    .map((o) => ({ o, s: scoreOffer(qN, o) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.o);
}

export function filterCategories(categories: SearchCategory[], query: string, limit = 20) {
  const qN = normalizeText(query ?? '');
  if (!qN) return categories.slice(0, limit);

  return categories
    .map((c) => {
      const tN = normalizeText(c.title || '');
      let s = 0;
      if (tN.startsWith(qN)) s = 100;
      else if (tN.includes(qN)) s = 70;
      return { c, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}
