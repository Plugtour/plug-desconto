// app/admin/_data/adminSelectors.ts
import type { OfferStatus, PartnerStatus } from './adminMappers';

/**
 * Status usados no Admin (mesmo padrão do app)
 */
export type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

export function countByStatus<T extends { status: AdminStatus }>(items: T[]) {
  return (items || []).reduce(
    (acc, item) => {
      const s = (item?.status ?? '') as AdminStatus;
      if (s in acc) acc[s] += 1;
      return acc;
    },
    {
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
      lixeira: 0,
    } as Record<AdminStatus, number>
  );
}

export function filterByStatus<T extends { status: AdminStatus }>(items: T[], status: AdminStatus | 'todos') {
  if (status === 'todos') return items || [];
  return (items || []).filter((i) => i.status === status);
}

export function searchIn<T>(items: T[], q: string, pick: (item: T) => string[]) {
  const query = String(q ?? '').trim().toLowerCase();
  if (!query) return items || [];
  return (items || []).filter((item) => pick(item).join(' ').toLowerCase().includes(query));
}

/**
 * Dashboard (real)
 * - recebe dados já mapeados do AdminDataProvider
 * - se não passar nada, devolve tudo zerado
 */
export function getDashboardData(input?: {
  offers?: Array<{ status: OfferStatus | AdminStatus }>;
  partners?: Array<{ status: PartnerStatus | AdminStatus }>;
}) {
  const offers = (input?.offers ?? []) as Array<{ status: AdminStatus }>;
  const partners = (input?.partners ?? []) as Array<{ status: AdminStatus }>;

  const offersByStatus = countByStatus(offers);
  const partnersByStatus = countByStatus(partners);

  const stats = [
    {
      label: 'Ofertas publicadas',
      value: String(offersByStatus.publicado),
      hint: 'Base atual (dados reais)',
    },
    {
      label: 'Parceiros ativos',
      value: String(partnersByStatus.publicado),
      hint: 'Publicados e visíveis',
    },
    {
      label: 'Itens em rascunho',
      value: String(offersByStatus.rascunho + partnersByStatus.rascunho),
      hint: 'Somando ofertas + parceiros',
    },
    {
      label: 'Itens na lixeira',
      value: String(offersByStatus.lixeira + partnersByStatus.lixeira),
      hint: 'Somando ofertas + parceiros',
    },
  ];

  return { stats };
}
