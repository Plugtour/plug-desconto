// app/_components/favorites/favoritesStore.ts
'use client';

export type FavoriteItem = {
  id: string;
  title: string;
  href: string;

  imageUrl?: string | null;

  // usados na UI
  subtitle?: string | null;
  city?: string | null;
  priceText?: string | null;

  // extras (pra reaproveitar)
  savingsText?: string | null;
  rating?: number | null;
  reviews?: number | null;
  tags?: any;
  categoryLabel?: string | null;

  categoryId?: string | null;
};

const KEY = 'plugdesconto_favorites_v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      // ignore
    }
  }
}

function safeHref(v: any) {
  const s = typeof v === 'string' ? v.trim() : '';
  // Link do Next aceita string (inclusive "/"), então garantimos fallback
  return s.length ? s : '/';
}

function normalizeItem(raw: any): FavoriteItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = String(raw.id ?? '').trim();
  const title = String(raw.title ?? '').trim();

  if (!id || !title) return null;

  return {
    id,
    title,
    href: safeHref(raw.href),

    imageUrl: raw.imageUrl ?? null,

    subtitle: raw.subtitle ?? null,
    city: raw.city ?? null,
    priceText: raw.priceText ?? null,

    savingsText: raw.savingsText ?? null,
    rating: raw.rating ?? null,
    reviews: raw.reviews ?? null,
    tags: raw.tags ?? null,
    categoryLabel: raw.categoryLabel ?? null,

    categoryId: raw.categoryId ?? null,
  };
}

function setFavorites(list: FavoriteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  emit();
}

/** Retorna cleanup VOID (não boolean) */
export function onFavoritesChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const normalized: FavoriteItem[] = [];
    for (const it of parsed) {
      const n = normalizeItem(it);
      if (n) normalized.push(n);
    }

    // ✅ auto-corrige storage se tinha itens inválidos (ex: href null)
    const needsRewrite =
      normalized.length !== parsed.length ||
      normalized.some((x) => typeof x.href !== 'string' || !x.href.trim());

    if (needsRewrite) {
      try {
        localStorage.setItem(KEY, JSON.stringify(normalized));
      } catch {
        // ignore
      }
    }

    return normalized;
  } catch {
    return [];
  }
}

export function isFavorite(id: string) {
  const sid = String(id ?? '').trim();
  if (!sid) return false;
  return getFavorites().some((x) => x.id === sid);
}

export function toggleFavorite(item: FavoriteItem) {
  // ✅ garante href sempre string
  const safeItem: FavoriteItem = {
    ...item,
    id: String(item.id ?? '').trim(),
    title: String(item.title ?? '').trim(),
    href: safeHref(item.href),
  };

  if (!safeItem.id || !safeItem.title) return { active: false, count: getFavorites().length };

  const list = getFavorites();
  const exists = list.some((x) => x.id === safeItem.id);

  if (exists) {
    setFavorites(list.filter((x) => x.id !== safeItem.id));
    return { active: false, count: Math.max(0, list.length - 1) };
  }

  setFavorites([safeItem, ...list]);
  return { active: true, count: list.length + 1 };
}

export function removeFavorite(id: string) {
  const sid = String(id ?? '').trim();
  if (!sid) return;
  const list = getFavorites();
  setFavorites(list.filter((x) => x.id !== sid));
}

export function clearFavorites() {
  setFavorites([]);
}
