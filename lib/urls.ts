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

// ✅ precisa ser exportado (seu erro estava aqui)
export function safeEncode(value: string) {
  return encodeURIComponent(normalize(value));
}

function getSlugOrId(input: BenefitLike | string) {
  if (typeof input === 'string') return input;
  return input.slug || input.id || '';
}

/**
 * Path interno do benefício.
 * Aceita string (slug) ou objeto (Offer/ApiOffer/etc com slug/id).
 */
export function benefitPath(input: BenefitLike | string) {
  const key = getSlugOrId(input);
  return `/beneficio/${safeEncode(key)}`;
}

/**
 * URL absoluta do benefício (canônica).
 */
export function benefitCanonicalUrl(
  input: BenefitLike | string,
  baseUrl?: string
) {
  const siteUrl =
    baseUrl?.replace(/\/+$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
    process.env.SITE_URL?.replace(/\/+$/, '') ||
    'http://localhost:3000';

  return `${siteUrl}${benefitPath(input)}`;
}

/**
 * Alias (muitos arquivos acabam chamando "benefitUrl").
 */
export function benefitUrl(input: BenefitLike | string, baseUrl?: string) {
  return benefitCanonicalUrl(input, baseUrl);
}
