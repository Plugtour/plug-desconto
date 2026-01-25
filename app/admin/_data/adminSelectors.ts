// app/admin/_data/adminSelectors.ts
import { adminMock, countByStatus } from './adminMock';
import { mapOffer, mapPartner, mapAffiliate } from './adminMappers';

export function getAdminUiData() {
  const offers = adminMock.offers.map(mapOffer);
  const partners = adminMock.partners.map(mapPartner);
  const affiliates = adminMock.affiliates.map(mapAffiliate);

  return { offers, partners, affiliates };
}

export function getDashboardData() {
  const { offers, partners } = getAdminUiData();

  const offersByStatus = countByStatus(adminMock.offers);
  const partnersByStatus = countByStatus(adminMock.partners);

  const chart = {
    yearLabel: '2026',
    isMock: true,
    months: adminMock.dashboard.months, // [{label,value}]
    bars: adminMock.dashboard.months.map((m) => m.value),
  };

  const stats = [
    {
      label: 'Ofertas publicadas',
      value: String(offersByStatus.publicado),
      hint: 'Base atual (mock central)',
    },
    {
      label: 'Parceiros ativos',
      value: String(partnersByStatus.publicado),
      hint: 'Publicados e visíveis (mock)',
    },
    {
      label: 'Cupons utilizados',
      value: '912',
      hint: 'Total acumulado (mock)',
    },
    {
      label: 'Receita estimada',
      value: 'R$ 18.420',
      hint: 'Simulação (MVP)',
    },
  ];

  return { stats, chart, offers, partners };
}
