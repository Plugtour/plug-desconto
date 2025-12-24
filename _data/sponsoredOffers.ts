// app/_data/sponsoredOffers.ts

export type SponsoredOffer = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  priceText?: string; // ex: "a partir de R$ 79"
  badge?: string; // ex: "Patrocinado"
  href: string; // por enquanto pode apontar para /oferta/[slug] ou link interno
};

export const SPONSORED_OFFERS: SponsoredOffer[] = [
  {
    id: 'sp-1',
    title: 'Tour Uva e Vinho + Almoço Italiano + Trem Maria Fumaça',
    subtitle: 'Passeio com economia',
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
    priceText: 'a partir de R$ 79',
    badge: 'Patrocinado',
    href: '/oferta/trem-maria-fumaca',
  },
  {
    id: 'sp-2',
    title: 'Tour Linha Bella',
    subtitle: 'Gastronomia + cultura',
    imageUrl:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80',
    priceText: 'a partir de R$ 129',
    badge: 'Patrocinado',
    href: '/oferta/tour-linha-bella',
  },
  {
    id: 'sp-3',
    title: 'Transfer Aeroporto → Gramado',
    subtitle: 'Conforto e pontualidade',
    imageUrl:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80',
    priceText: 'a partir de R$ 149',
    badge: 'Patrocinado',
    href: '/oferta/transfer-aeroporto-gramado',
  },
  {
    id: 'sp-4',
    title: 'Noite Alemã',
    subtitle: 'Show + jantar típico',
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
    priceText: 'a partir de R$ 189',
    badge: 'Patrocinado',
    href: '/oferta/noite-alema',
  },
  {
    id: 'sp-5',
    title: 'Café Colonial',
    subtitle: 'Experiência completa',
    imageUrl:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1400&q=80',
    priceText: 'a partir de R$ 69',
    badge: 'Patrocinado',
    href: '/oferta/cafe-colonial',
  },
];
