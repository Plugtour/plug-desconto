// _data/sponsoredOffers.ts

export type SponsoredOffer = {
  id: string;
  title: string;

  // legado (se algum ponto do projeto ainda usar)
  subtitle?: string;

  // TAGS sempre: Cidade | Categoria | Tipo
  tags: [string, string, string];

  imageUrl: string;

  // intervalo de economia (o texto "Economia de" é montado no componente)
  priceText?: string; // ex: "R$50 a R$190"

  badge?: string; // ex: "Patrocinado"
  href: string;

  // avaliações
  rating?: number; // ex: 4.8
  reviews?: number; // ex: 275
};

export const SPONSORED_OFFERS: SponsoredOffer[] = [
  {
    id: 'sp-1',
    title: 'Tour Uva e Vinho + Almoço Italiano + Trem Maria Fumaça',
    subtitle: 'Passeio + Almoço',
    tags: ['Bento Gonçalves', 'Passeios', 'Enoturismo'],
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
    priceText: 'R$50 a R$190',
    badge: 'Patrocinado',
    href: '/oferta/trem-maria-fumaca',
    rating: 4.8,
    reviews: 275,
  },
  {
    id: 'sp-2',
    title: 'Tour Linha Bella',
    subtitle: 'Gastronomia + cultura',
    tags: ['Bento Gonçalves', 'Gastronomia', 'Cultura'],
    imageUrl:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80',
    priceText: 'R$40 a R$120',
    badge: 'Patrocinado',
    href: '/oferta/tour-linha-bella',
    rating: 4.7,
    reviews: 198,
  },
  {
    id: 'sp-3',
    title: 'Transfer Aeroporto → Gramado',
    subtitle: 'Conforto e pontualidade',
    tags: ['Gramado', 'Transfers', 'Aeroporto'],
    imageUrl:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80',
    priceText: 'R$60 a R$150',
    badge: 'Patrocinado',
    href: '/oferta/transfer-aeroporto-gramado',
    rating: 4.9,
    reviews: 412,
  },
  {
    id: 'sp-4',
    title: 'Noite Alemã',
    subtitle: 'Show + jantar típico',
    tags: ['Gramado', 'Shows', 'Jantar típico'],
    imageUrl:
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1400&q=80',
    priceText: 'R$70 a R$200',
    badge: 'Patrocinado',
    href: '/oferta/noite-alema',
    rating: 4.6,
    reviews: 321,
  },
  {
    id: 'sp-5',
    title: 'Café Colonial',
    subtitle: 'Experiência completa',
    tags: ['Gramado', 'Gastronomia', 'Café colonial'],
    imageUrl:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1400&q=80',
    priceText: 'R$30 a R$90',
    badge: 'Patrocinado',
    href: '/oferta/cafe-colonial',
    rating: 4.8,
    reviews: 654,
  },
];
