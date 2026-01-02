// app/_components/favorites/favoritesStore.ts
'use client';

export type FavoriteItem = {
  id: string;
  title: string;
  href: string;

  imageUrl?: string | null;
  subtitle?: string | null;
  city?: string | null;
  priceText?: string | null;

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

/**
 * ✅ Retorna um cleanup que devolve VOID (não boolean)
 * Isso evita o erro do useEffect (EffectCallback).
 */
export function onFavoritesChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn); // delete() retorna boolean, mas nós NÃO retornamos isso
  };
}

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FavoriteItem[];
  } catch {
    return [];
  }
}

function setFavorites(list: FavoriteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  emit();
}

export function isFavorite(id: string) {
  return getFavorites().some((x) => x.id === id);
}

export function toggleFavorite(item: FavoriteItem) {
  const list = getFavorites();
  const exists = list.some((x) => x.id === item.id);

  if (exists) {
    setFavorites(list.filter((x) => x.id !== item.id));
    return { active: false, count: Math.max(0, list.length - 1) };
  }

  setFavorites([item, ...list]);
  return { active: true, count: list.length + 1 };
}

export function removeFavorite(id: string) {
  const list = getFavorites();
  setFavorites(list.filter((x) => x.id !== id));
}

export function clearFavorites() {
  setFavorites([]);
}
