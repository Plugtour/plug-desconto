// lib/api.ts
import { headers } from 'next/headers';

async function readHeader(name: string) {
  try {
    // ✅ Next 16: headers() retorna Promise
    const h: any = await headers();

    // Caso padrão (Headers)
    if (h && typeof h.get === 'function') return h.get(name);

    // Caso iterável (entries)
    if (h && typeof h.entries === 'function') {
      const map = new Map<string, string>();
      for (const [k, v] of h.entries()) map.set(String(k).toLowerCase(), String(v));
      return map.get(name.toLowerCase()) ?? null;
    }

    // Caso "plain object"
    if (h && typeof h === 'object') {
      const key = name.toLowerCase();
      for (const k of Object.keys(h)) {
        if (k.toLowerCase() === key) return String(h[k]);
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
    process.env.SITE_URL?.replace(/\/+$/, '');

  if (env) return env;

  const host =
    (await readHeader('x-forwarded-host')) ??
    (await readHeader('host')) ??
    'localhost:3000';

  const proto =
    (await readHeader('x-forwarded-proto')) ??
    'http';

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

export async function apiGetOffers(category?: string) {
  const base = await getBaseUrl();
  const url = new URL('/api/offers', base);

  if (category) url.searchParams.set('category', category);

  const res = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar ofertas: ${res.status}`);
  }

  const json = (await res.json()) as {
    ok: boolean;
    total: number;
    items: ApiOffer[];
  };

  return json.items ?? [];
}

export async function apiGetOffer(slugOrId: string) {
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
    ok: boolean;
    item: ApiOffer;
  };

  return json.item ?? null;
}
