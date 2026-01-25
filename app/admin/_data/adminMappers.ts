// app/admin/_data/adminMappers.ts

export type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

export type AdminOfferRow = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
};

function formatDateBR(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

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

/**
 * Alias para uso com dados mock / selectors
 * Mantém compatibilidade com adminSelectors.ts
 */
export const mapOffer = mapDbOfferToAdminRow;

/**
 * Placeholders seguros para evitar erro de build
 * Ajustaremos depois conforme o mock evoluir
 */
export const mapPartner = (p: any) => ({
  id: String(p?.id ?? ''),
  nome: String(p?.name ?? ''),
  status: p?.status ?? 'rascunho',
});

export const mapAffiliate = (a: any) => ({
  id: String(a?.id ?? ''),
  nome: String(a?.name ?? ''),
  status: a?.status ?? 'rascunho',
});
