// app/admin/_data/adminMappers.ts

export type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';
export type PartnerStatus = OfferStatus;
export type AffiliateStatus = OfferStatus;

// ✅ novos
export type AmbassadorStatus = OfferStatus;
export type FranchiseeStatus = OfferStatus;

function formatDateBR(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

const digitsOnly = (v: string) => (v || '').replace(/\D/g, '');

export const buildWhatsappHref = (raw: string) => {
  const digits = digitsOnly(raw);
  if (!digits) return 'https://wa.me/55';
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

const slugify = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase()
    .slice(0, 10);

function pickFirstFromArray(v: any): string | null {
  if (!Array.isArray(v)) return null;
  const first = v.find((x) => typeof x === 'string' && x.trim().length > 0);
  return first ? String(first).trim() : null;
}

function pickImageUrl(x: any): string | null {
  const raw =
    x?.imageUrl ??
    x?.imagemUrl ??
    x?.logoUrl ??
    x?.avatarUrl ??
    x?.thumbnailUrl ??
    x?.thumbUrl ??
    x?.fotoUrl ??
    x?.photoUrl ??
    x?.coverUrl ??
    x?.pictureUrl ??
    x?.image_url ??
    x?.imagem_url ??
    pickFirstFromArray(x?.images) ??
    pickFirstFromArray(x?.imagens) ??
    null;

  if (!raw) return null;
  const s = String(raw).trim();
  return s ? s : null;
}

export type AdminOfferRow = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
};

export type AdminPartnerRow = {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  whatsapp: string;
  whatsappHref: string;
  status: PartnerStatus;
  ofertasAtivas: number;
  atualizadoEm: string;
  imageUrl?: string | null;
  images?: string[] | null;
};

export type AdminAffiliateRow = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  whatsappHref: string;
  cupom: string;
  status: AffiliateStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
  canal?: string;
  leadsMes?: number;
  vendasMes?: number;
};

// ✅ novos
export type AdminAmbassadorRow = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  whatsappHref: string;
  codigo: string;
  status: AmbassadorStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
};

export type AdminFranchiseeRow = {
  id: string;
  nome: string;
  cidade: string;
  whatsapp: string;
  whatsappHref: string;
  status: FranchiseeStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
};

// =========================
// OFFERS
// =========================

export function mapDbOfferToAdminRow(db: any): AdminOfferRow {
  return {
    id: String(db?.id ?? ''),
    titulo: String(db?.title ?? db?.titulo ?? ''),
    parceiro: String(db?.partnerName ?? db?.parceiro ?? ''),
    categoria: String(db?.categoryId ?? db?.categoria ?? ''),
    status: (db?.status ?? 'rascunho') as OfferStatus,
    atualizadoEm: formatDateBR(db?.updatedAt ?? db?.createdAt),
    imageUrl: pickImageUrl(db),
  };
}

export function mapMockOfferToAdminRow(m: any): AdminOfferRow {
  return {
    id: String(m?.id ?? ''),
    titulo: String(m?.titulo ?? m?.title ?? ''),
    parceiro: String(m?.parceiro ?? m?.partnerName ?? ''),
    categoria: String(m?.categoria ?? m?.categoryId ?? ''),
    status: (m?.status ?? 'rascunho') as OfferStatus,
    atualizadoEm: formatDateBR(m?.updatedAt ?? m?.createdAt),
    imageUrl: pickImageUrl(m),
  };
}

export const mapOffer = (x: any): AdminOfferRow => {
  if (x && typeof x === 'object' && ('titulo' in x || 'parceiro' in x)) return mapMockOfferToAdminRow(x);
  return mapDbOfferToAdminRow(x);
};

// =========================
// PARTNERS
// =========================

export const mapPartner = (p: any): AdminPartnerRow => {
  const id = String(p?.id ?? '');
  const nome = String(p?.nome ?? p?.name ?? '');

  const whatsapp = String(p?.whatsapp ?? '').trim() || '51999999999';
  const whatsappHref = String(p?.whatsappHref ?? '').trim() || buildWhatsappHref(whatsapp);

  const images =
    Array.isArray(p?.images) && p.images.length
      ? p.images.filter((x: any) => typeof x === 'string' && x.trim().length > 0)
      : null;

  return {
    id,
    nome,
    categoria: String(p?.categoria ?? p?.category ?? ''),
    cidade: String(p?.cidade ?? p?.city ?? ''),
    whatsapp,
    whatsappHref,
    status: (p?.status ?? 'rascunho') as PartnerStatus,
    ofertasAtivas: Number(p?.ofertasAtivas ?? p?.activeOffers ?? 0),
    atualizadoEm: formatDateBR(p?.updatedAt ?? p?.createdAt),
    imageUrl: pickImageUrl(p),
    images,
  };
};

// =========================
// AFFILIATES
// =========================

export const mapAffiliate = (a: any): AdminAffiliateRow => {
  const id = String(a?.id ?? '');
  const nome = String(a?.nome ?? a?.name ?? '');

  const email = String(a?.email ?? '').trim() || `${slugify(nome || id).toLowerCase()}@afiliado.local`;
  const whatsapp = String(a?.whatsapp ?? '').trim() || '51999999999';
  const cupom = String(a?.cupom ?? '').trim() || slugify(nome || id) || 'CUPOM';
  const whatsappHref = String(a?.whatsappHref ?? '').trim() || buildWhatsappHref(whatsapp);

  return {
    id,
    nome,
    email,
    whatsapp,
    whatsappHref,
    cupom,
    status: (a?.status ?? 'rascunho') as AffiliateStatus,
    atualizadoEm: formatDateBR(a?.updatedAt ?? a?.createdAt),
    imageUrl: pickImageUrl(a),
    canal: a?.canal,
    leadsMes: a?.leadsMes,
    vendasMes: a?.vendasMes,
  };
};

// =========================
// AMBASSADORS
// =========================

export const mapAmbassador = (a: any): AdminAmbassadorRow => {
  const id = String(a?.id ?? '');
  const nome = String(a?.nome ?? a?.name ?? '');

  const email = String(a?.email ?? '').trim() || `${slugify(nome || id).toLowerCase()}@embaixador.local`;
  const whatsapp = String(a?.whatsapp ?? '').trim() || '51999999999';
  const codigo = String(a?.codigo ?? a?.code ?? '').trim() || slugify(nome || id) || 'CODIGO';
  const whatsappHref = String(a?.whatsappHref ?? '').trim() || buildWhatsappHref(whatsapp);

  return {
    id,
    nome,
    email,
    whatsapp,
    whatsappHref,
    codigo,
    status: (a?.status ?? 'rascunho') as AmbassadorStatus,
    atualizadoEm: formatDateBR(a?.updatedAt ?? a?.createdAt),
    imageUrl: pickImageUrl(a),
  };
};

// =========================
// FRANCHISEES
// =========================

export const mapFranchisee = (f: any): AdminFranchiseeRow => {
  const id = String(f?.id ?? '');
  const nome = String(f?.nome ?? f?.name ?? '');

  const cidade = String(f?.cidade ?? f?.city ?? '');
  const whatsapp = String(f?.whatsapp ?? '').trim() || '51999999999';
  const whatsappHref = String(f?.whatsappHref ?? '').trim() || buildWhatsappHref(whatsapp);

  return {
    id,
    nome,
    cidade,
    whatsapp,
    whatsappHref,
    status: (f?.status ?? 'rascunho') as FranchiseeStatus,
    atualizadoEm: formatDateBR(f?.updatedAt ?? f?.createdAt),
    imageUrl: pickImageUrl(f),
  };
};
