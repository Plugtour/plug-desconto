// lib/api.ts
import { headers } from 'next/headers';

type HeadersLike = { get: (name: string) => string | null };
type EntriesLike = { entries: () => IterableIterator<[string, string]> };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function hasGet(v: unknown): v is HeadersLike {
  return isObject(v) && typeof (v as Record<string, unknown>).get === 'function';
}
function hasEntries(v: unknown): v is EntriesLike {
  return isObject(v) && typeof (v as Record<string, unknown>).entries === 'function';
}

async function readHeader(name: string): Promise<string | null> {
  try {
    const hUnknown: unknown = await headers();

    if (hasGet(hUnknown)) return hUnknown.get(name);

    if (hasEntries(hUnknown)) {
      const map = new Map<string, string>();
      for (const [k, v] of hUnknown.entries()) map.set(String(k).toLowerCase(), String(v));
      return map.get(name.toLowerCase()) ?? null;
    }

    if (isObject(hUnknown)) {
      const key = name.toLowerCase();
      for (const k of Object.keys(hUnknown)) {
        if (k.toLowerCase() === key) return String(hUnknown[k]);
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function getBaseUrl(): Promise<string> {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
    process.env.SITE_URL?.replace(/\/+$/, '');

  if (env) return env;

  const host =
    (await readHeader('x-forwarded-host')) ?? (await readHeader('host')) ?? 'localhost:3000';
  const proto = (await readHeader('x-forwarded-proto')) ?? 'http';

  return `${proto}://${host}`;
}

async function readError(res: Response) {
  try {
    const data = (await res.json().catch(() => null)) as any;
    if (!data) return '';
    const msg = data.error || data.message || '';
    const detail = data.detail || '';
    const out = [String(msg || '').trim(), String(detail || '').trim()].filter(Boolean).join('\n');
    return out;
  } catch {
    return '';
  }
}

export type ApiOffer = {
  id: string;
  slug: string;

  city: string;
  status: string;

  categoryId: string;
  category: string;

  title: string;

  partnerName: string;
  partner: string;

  description: string | null;

  priceText: string | null;
  benefit: string;

  imageUrl: string | null;
  images: string[];

  createdAt: string;
  updatedAt: string;

  tenantId: string;
};

export async function apiGetOffers(categoryId?: string): Promise<ApiOffer[]> {
  const base = await getBaseUrl();
  const url = new URL('/api/offers', base);

  if (categoryId) url.searchParams.set('categoryId', categoryId);

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (!res.ok) {
    const msg = await readError(res);
    throw new Error(`Falha ao buscar ofertas: ${res.status}${msg ? `\n${msg}` : ''}`);
  }

  const json = (await res.json()) as { total?: number; items?: ApiOffer[] };
  return Array.isArray(json.items) ? json.items : [];
}

export async function apiGetOffer(slugOrId: string): Promise<ApiOffer | null> {
  const base = await getBaseUrl();
  const url = new URL(`/api/offers/${encodeURIComponent(slugOrId)}`, base);

  const res = await fetch(url.toString(), { cache: 'no-store' });

  if (res.status === 404) return null;

  if (!res.ok) {
    const msg = await readError(res);
    throw new Error(`Falha ao buscar oferta: ${res.status}${msg ? `\n${msg}` : ''}`);
  }

  const json = (await res.json()) as { item?: ApiOffer };
  return json.item ?? null;
}
