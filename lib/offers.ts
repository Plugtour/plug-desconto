// lib/offers.ts
import { OFFERS, type Offer, type OfferCategory } from '@/config/offers';

export type CategoryItem = {
  key: string;   // chave estável (slugificada)
  label: string; // nome exibido
  count: number; // quantidade
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSlugOrId(value: string) {
  return safeDecode(value).trim();
}

export function normalizeCat(value?: string) {
  if (!value) return '';
  return safeDecode(value).trim();
}

export function slugifyKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Retorna ofertas filtrando por tenant (quando existir) e por categoria (opcional).
 * ✅ Regra do projeto: retorna somente itens com slug válido (para o frontend usar sempre slug).
 */
export async function getOffersByTenant(
  tenantId?: string | null,
  category?: OfferCategory
): Promise<Offer[]> {
  const filtered = OFFERS.filter((offer) => {
    if (tenantId && offer.tenantId !== tenantId) return false;
    if (category && offer.category !== category) return false;
    return true;
  });

  const withSlug = filtered.filter((o) => typeof o.slug === 'string' && o.slug.trim().length > 0);

  // ajuda a detectar dados incompletos
  const missing = filtered.filter((o) => !o.slug || !o.slug.trim());
  for (const m of missing) {
    console.warn(`[Plug Desconto] Oferta sem slug (não será listada): id=${m.id} title="${m.title}"`);
  }

  return withSlug;
}

/**
 * Busca por SLUG ou pelo ID antigo (compatibilidade).
 * Retorna a oferta mesmo se acessar via id antigo.
 */
export async function getOfferBySlugOrId(
  tenantId: string | null | undefined,
  slugOrId: string
): Promise<Offer | null> {
  const key = normalizeSlugOrId(slugOrId).toLowerCase();

  const scope = OFFERS.filter((o) => (tenantId ? o.tenantId === tenantId : true));

  // 1) slug (principal)
  const bySlug = scope.find((o) => (o.slug || '').toLowerCase() === key);
  if (bySlug) return bySlug;

  // 2) id antigo (fallback)
  const byId = scope.find((o) => (o.id || '').toLowerCase() === key);
  return byId ?? null;
}

/**
 * Mantém compatibilidade com a função antiga, se você ainda usar em algum lugar.
 * (Agora é só um wrapper do método novo.)
 */
export async function getOfferBySlug(
  tenantId: string,
  slug: string
): Promise<Offer | undefined> {
  const found = await getOfferBySlugOrId(tenantId, slug);
  return found ?? undefined;
}

export async function getCategories(offers: Offer[]): Promise<CategoryItem[]> {
  const map = new Map<string, { label: string; count: number }>();

  for (const offer of offers) {
    const label = (offer.category || '').toString().trim() || 'Outros';
    const key = slugifyKey(label);

    const current = map.get(key);
    if (current) current.count += 1;
    else map.set(key, { label, count: 1 });
  }

  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
