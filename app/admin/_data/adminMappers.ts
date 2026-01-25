// app/admin/_data/adminMappers.ts

export type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';
export type PartnerStatus = OfferStatus;
export type AffiliateStatus = OfferStatus;

function formatDateBR(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

const digitsOnly = (v: string) => (v || '').replace(/\D/g, '');

const buildWhatsappHref = (raw: string) => {
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

export type AdminOfferRow = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
};

export type AdminPartnerRow = {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  whatsapp: string; // ✅ aqui é a correção principal
  status: PartnerStatus;
  ofertasAtivas: number;
  atualizadoEm: string;
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
  canal?: string;
  leadsMes?: number;
  vendasMes?: number;
};

// =========================
// OFFERS
// =========================

export function mapDbOfferToAdminRow(db: any): AdminOfferRow {
  return {
    id: String(db?.id ?? ''),
    titulo: String(db?.title ?? ''),
    parceiro: String(db?.partnerName ?? ''),
    categoria: String(db?.categoryId ?? ''),
    status: (db?.status ?? 'rascunho') as OfferStatus,
    atualizadoEm: formatDateBR(db?.updatedAt ?? db?.createdAt),
  };
}

export function mapMockOfferToAdminRow(m: any): AdminOfferRow {
  return {
    id: String(m?.id ?? ''),
    titulo: String(m?.titulo ?? ''),
    parceiro: String(m?.parceiro ?? ''),
    categoria: String(m?.categoria ?? ''),
    status: (m?.status ?? 'rascunho') as OfferStatus,
    atualizadoEm: formatDateBR(m?.updatedAt ?? m?.createdAt),
  };
}

export const mapOffer = (x: any): AdminOfferRow => {
  if (x && typeof x === 'object' && 'titulo' in x) return mapMockOfferToAdminRow(x);
  return mapDbOfferToAdminRow(x);
};

// =========================
// PARTNERS
// =========================

export const mapPartner = (p: any): AdminPartnerRow => {
  return {
    id: String(p?.id ?? ''),
    nome: String(p?.nome ?? p?.name ?? ''),
    categoria: String(p?.categoria ?? p?.category ?? ''),
    cidade: String(p?.cidade ?? p?.city ?? ''),
    whatsapp: String(p?.whatsapp ?? p?.phone ?? ''), // ✅ garante campo
    status: (p?.status ?? 'rascunho') as PartnerStatus,
    ofertasAtivas: Number(p?.ofertasAtivas ?? p?.activeOffers ?? 0),
    atualizadoEm: formatDateBR(p?.updatedAt ?? p?.createdAt),
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
    canal: a?.canal,
    leadsMes: a?.leadsMes,
    vendasMes: a?.vendasMes,
  };
};
