// _data/banners.ts

export type BannerItem = {
  id: string;

  // Texto (padrão Instagram: linha pequena colorida + título + subtítulo + linha menor colorida)
  tag: string;           // texto pequeno acima do título (colorido)
  title: string;         // título grande
  subtitle: string;      // subtítulo menor
  highlight: string;     // texto menor colorido (abaixo)

  imageUrl: string;
  href?: string;

  // Alinhamento do texto por banner
  align?: 'left' | 'center' | 'right';
};

export const BANNERS: BannerItem[] = [
  {
    id: 'b1',
    tag: 'OFERTA DO DIA',
    title: 'Descontos em Gramado',
    subtitle: 'Ingressos, passeios e experiências',
    highlight: 'Economize agora na Serra Gaúcha',
    imageUrl:
      'https://images.unsplash.com/photo-1520962917960-0b65d59a7c27?auto=format&fit=crop&w=1400&q=80',
    href: '/ofertas?city=gramado',
    align: 'left',
  },
  {
    id: 'b2',
    tag: 'NOVIDADES',
    title: 'Atrações e shows',
    subtitle: 'Promoções por tempo limitado',
    highlight: 'Garanta antes que acabe',
    imageUrl:
      'https://images.unsplash.com/photo-1527427337751-fdca2f128ce5?auto=format&fit=crop&w=1400&q=80',
    href: '/ofertas',
    align: 'center',
  },
  {
    id: 'b3',
    tag: 'EXCLUSIVO',
    title: 'Clube de Descontos',
    subtitle: 'Para turistas e moradores',
    highlight: 'Vantagens em um só lugar',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    href: '/ofertas',
    align: 'right',
  },
];
