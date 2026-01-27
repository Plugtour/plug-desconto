// lib/api.ts
import { headers } from 'next/headers';

type HeadersLike = {
  get: (name: string) => string | null;
};

type EntriesLike = {
  entries: () => IterableIterator<[string, string]>;
};

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
    // Next 16: headers() pode ser Promise
    const hUnknown: unknown = await headers();

    // Caso padrão (Headers/ReadonlyHeaders)
    if (hasGet(hUnknown)) return hUnknown.get(name);

    // Caso iterável (entries)
    if (hasEntries(hUnknown)) {
      const map = new Map<string, string>();
      for (const [k, v] of hUnknown.entries()) map.set(String(k).toLowerCase(), String(v));
      return map.get(name.toLowerCase()) ?? null;
    }

    // Caso "plain object"
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

export type ApiOffer = {
  id: string;
  slug: string;
  tenantId: string;
  category: string;
  title: string;
  partner: string;
  benefit: string;
  description: string;
};

export async function apiGetOffers(categoryId?: string): Promise<ApiOffer[]> {
  const base = await getBaseUrl();
  const url = new URL('/api/offers', base);

  // a API espera "categoryId"
  if (categoryId) url.searchParams.set('categoryId', categoryId);

  const res = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar ofertas: ${res.status}`);
  }

  const json = (await res.json()) as {
    total: number;
    items: ApiOffer[];
  };

  return json.items ?? [];
}

export async function apiGetOffer(slugOrId: string): Promise<ApiOffer | null> {
  const base = await getBaseUrl();
  const url = new URL(`/api/offers/${encodeURIComponent(slugOrId)}`, base);

  const res = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Falha ao buscar oferta: ${res.status}`);
  }

  const json = (await res.json()) as {
    item: ApiOffer;
  };

  return json.item ?? null;
}
