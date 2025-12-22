export type OfferCategory =
  | 'gastronomia'
  | 'atracoes'
  | 'passeios'
  | 'shows'
  | 'transfers'
  | 'compras'
  | 'bem-estar'
  | 'outros';

export type Offer = {
  id: string; // ID antigo (ex: rest-01)
  slug: string; // URL amigável (ex: alpen-haus-fondue)
  tenantId: string; // ex: serra-gaucha
  category: OfferCategory;

  title: string;
  partner: string;
  benefit: string;
  description: string;
};

// Dica: mantenha slugs únicos no projeto inteiro.
export const OFFERS: Offer[] = [
  // =========================
  // GASTRONOMIA
  // =========================
  {
    id: 'rest-01',
    slug: 'alpen-haus-fondue',
    tenantId: 'serra-gaucha',
    category: 'gastronomia',
    title: 'Sequência de Fondue',
    partner: 'Restaurante Alpen Haus',
    benefit: 'Compre 1 e ganhe outro',
    description: 'Sequência completa de fondue de queijo, carne e chocolate.',
  },
  {
    id: 'rest-02',
    slug: 'casa-da-serra-cafe-colonial',
    tenantId: 'serra-gaucha',
    category: 'gastronomia',
    title: 'Café Colonial',
    partner: 'Casa da Serra',
    benefit: '50% de desconto no segundo',
    description: 'Café colonial típico da região, com variedade de doces e salgados.',
  },
  {
    id: 'rest-03',
    slug: 'churrascaria-serrana-rodizio',
    tenantId: 'serra-gaucha',
    category: 'gastronomia',
    title: 'Rodízio Serrano',
    partner: 'Churrascaria Serrana',
    benefit: '10% de desconto',
    description: 'Rodízio com cortes selecionados e buffet completo.',
  },
  {
    id: 'rest-04',
    slug: 'vinicola-degustacao-classica',
    tenantId: 'serra-gaucha',
    category: 'gastronomia',
    title: 'Degustação Clássica',
    partner: 'Vinícola Vale do Sabor',
    benefit: 'Taça de boas-vindas',
    description: 'Degustação guiada com rótulos selecionados e harmonização leve.',
  },

  // =========================
  // ATRAÇÕES
  // =========================
  {
    id: 'atr-01',
    slug: 'mundo-a-vapor-ingresso',
    tenantId: 'serra-gaucha',
    category: 'atracoes',
    title: 'Ingresso Mundo a Vapor',
    partner: 'Mundo a Vapor',
    benefit: '15% de desconto',
    description: 'Atração temática com réplicas em miniatura e experiências interativas.',
  },
  {
    id: 'atr-02',
    slug: 'skyglass-entrada',
    tenantId: 'serra-gaucha',
    category: 'atracoes',
    title: 'Skyglass',
    partner: 'Skyglass Canela',
    benefit: '10% de desconto',
    description: 'Plataforma de vidro com vista panorâmica e fotos incríveis.',
  },
  {
    id: 'atr-03',
    slug: 'mini-mundo-ingresso',
    tenantId: 'serra-gaucha',
    category: 'atracoes',
    title: 'Mini Mundo',
    partner: 'Mini Mundo',
    benefit: '5% de desconto',
    description: 'Parque ao ar livre com miniaturas e cenários que encantam todas as idades.',
  },
  {
    id: 'atr-04',
    slug: 'catedral-de-pedra-visita',
    tenantId: 'serra-gaucha',
    category: 'atracoes',
    title: 'Visita Catedral de Pedra',
    partner: 'Catedral de Pedra',
    benefit: 'Guia digital gratuito',
    description: 'Aproveite a visita com um guia digital para entender detalhes e curiosidades.',
  },

  // =========================
  // PASSEIOS
  // =========================
  {
    id: 'pas-01',
    slug: 'city-tour-gramado-canela',
    tenantId: 'serra-gaucha',
    category: 'passeios',
    title: 'City Tour Gramado e Canela',
    partner: 'Operadora Local',
    benefit: 'R$ 20 off por pessoa',
    description: 'Um roteiro clássico com paradas estratégicas para fotos e compras.',
  },
  {
    id: 'pas-02',
    slug: 'rota-dos-parques',
    tenantId: 'serra-gaucha',
    category: 'passeios',
    title: 'Rota dos Parques',
    partner: 'Operadora Local',
    benefit: '10% de desconto',
    description: 'Passeio pelos parques e atrações mais procurados da região.',
  },

  // =========================
  // SHOWS
  // =========================
  {
    id: 'sho-01',
    slug: 'noite-gaucha-show',
    tenantId: 'serra-gaucha',
    category: 'shows',
    title: 'Noite Gaúcha',
    partner: 'Casa de Espetáculos',
    benefit: 'Ingresso com desconto',
    description: 'Show típico com música e dança tradicional, em um ambiente temático.',
  },
  {
    id: 'sho-02',
    slug: 'show-tematico-serra',
    tenantId: 'serra-gaucha',
    category: 'shows',
    title: 'Show Temático da Serra',
    partner: 'Teatro Local',
    benefit: '5% de desconto',
    description: 'Espetáculo leve e divertido, perfeito para fechar a noite.',
  },

  // =========================
  // TRANSFERS
  // =========================
  {
    id: 'trf-01',
    slug: 'transfer-aeroporto-porto-alegre-gramado',
    tenantId: 'serra-gaucha',
    category: 'transfers',
    title: 'Transfer Aeroporto POA → Gramado',
    partner: 'Transfer Local',
    benefit: '10% de desconto',
    description: 'Deslocamento confortável com agendamento simples e rápido.',
  },
  {
    id: 'trf-02',
    slug: 'transfer-gramado-aeroporto-porto-alegre',
    tenantId: 'serra-gaucha',
    category: 'transfers',
    title: 'Transfer Gramado → Aeroporto POA',
    partner: 'Transfer Local',
    benefit: '10% de desconto',
    description: 'Saída pontual, com foco em conforto e praticidade.',
  },

  // =========================
  // OUTROS
  // =========================
  {
    id: 'out-01',
    slug: 'spa-massagem-relaxante',
    tenantId: 'serra-gaucha',
    category: 'bem-estar',
    title: 'Massagem Relaxante',
    partner: 'Spa da Serra',
    benefit: '20% de desconto',
    description: 'Sessão relaxante para recarregar as energias durante a viagem.',
  },
];

export function getOfferByIdOrSlug(idOrSlug: string) {
  const key = (idOrSlug || '').trim().toLowerCase();
  return OFFERS.find((o) => o.id.toLowerCase() === key || o.slug.toLowerCase() === key);
}
