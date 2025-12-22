// lib/urls.ts

export type BenefitLike = {
  id?: string | null;
  slug?: string | null;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalize(value: string) {
  return safeDecode(value).trim();
}

function safeEncode(value: string) {
  return encodeURIComponent(normalize(value));
}

/**
 * Retorna o identificador “oficial” (slug quando existir; senão id)
 * SEM encode, já normalizado.
 */
export function benefitKey(offer: BenefitLike) {
  const slug = normalize((offer?.slug ?? '').trim());
  const id = normalize((offer?.id ?? '').trim());

  if (slug) return slug;
  if (id) return id;

  return 'nao-encontrado';
}

/**
 * Path interno SEM encode (bom p/ revalidatePath e comparações)
 */
export function benefitPath(offer: BenefitLike) {
  return `/beneficio/${benefitKey(offer)}`;
}

/**
 * URL pronta p/ Link/redirect (com encode seguro)
 * REGRA: sempre usar slug quando existir.
 */
export function benefitUrl(offer: BenefitLike) {
  const key = benefitKey(offer);

  // mantém fallback consistente
  if (key === 'nao-encontrado') return '/beneficio/nao-encontrado';

  return `/beneficio/${safeEncode(key)}`;
}

/**
 * Canonical oficial (SEO): sempre slug quando existir.
 * Se não existir slug, usa id.
 */
export function benefitCanonicalUrl(offer: BenefitLike) {
  // canonical pode ser path “bonito” (sem encode extra)
  // mas como o Next aceita ambos, manteremos alinhado ao helper principal
  return benefitUrl(offer);
}

/**
 * Para quando você tem só uma string (slug ou id).
 */
export function benefitUrlFromSlugOrId(slugOrId: string) {
  const key = normalize(slugOrId);
  if (!key) return '/beneficio/nao-encontrado';
  return `/beneficio/${encodeURIComponent(key)}`;
}
