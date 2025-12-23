// /_data/banners.ts

export type BannerItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
  align?: 'left' | 'center' | 'right';
  tone?: 'dark' | 'light';
};

export const BANNERS: BannerItem[] = [
  {
    id: 'b1',
    title: 'Descontos em Gramado',
    subtitle: 'Ingressos, passeios e experiências',
    imageUrl:
      'https://images.unsplash.com/photo-1520962917960-0b65d59a7c27?auto=format&fit=crop&w=1200&q=80',
    href: '/ofertas?city=gramado',
    align: 'left',
    tone: 'dark',
  },
  {
    id: 'b2',
    title: 'Serra Gaúcha',
    subtitle: 'Economize no que você realmente usa',
    imageUrl:
      'https://images.unsplash.com/photo-1527427337751-fdca2f128ce5?auto=format&fit=crop&w=1200&q=80',
    href: '/ofertas',
    align: 'left',
    tone: 'dark',
  },
];
