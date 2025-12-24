// /_data/banners.ts

export type BannerItem = {
  id: string;

  tag: string;
  title: string;
  subtitle: string;
  highlight: string;

  imageUrl: string;
  href?: string;

  align?: 'left' | 'center' | 'right';
};

export const BANNERS: BannerItem[] = [
  {
    id: 'b1',
    tag: 'OFERTA DO DIA',
    title: 'Descontos em Gramado',
    subtitle: 'Ingressos, passeios e experiências',
    highlight: 'Economize agora na Serra Gaúcha',
    imageUrl: '/banners/banner-1.webp',
    href: '/ofertas?city=gramado',
    align: 'left',
  },
  {
    id: 'b2',
    tag: 'NOVIDADES',
    title: 'Atrações e shows',
    subtitle: 'Promoções por tempo limitado',
    highlight: 'Garanta antes que acabe',
    imageUrl: '/banners/banner-2.webp',
    href: '/ofertas',
    align: 'center',
  },
  {
    id: 'b3',
    tag: 'EXCLUSIVO',
    title: 'Clube de Descontos',
    subtitle: 'Para turistas e moradores',
    highlight: 'Vantagens em um só lugar',
    imageUrl: '/banners/banner-3.webp',
    href: '/ofertas',
    align: 'right',
  },
];
