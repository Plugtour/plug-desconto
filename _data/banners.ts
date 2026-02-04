// caminho: _data/banners.ts

export type BannerItem = {
  id: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  tag?: string;
  href?: string;
  imageUrl: string;
  align?: 'left' | 'center' | 'right';
  active?: boolean;
  order?: number;
};

/**
 * Fallback local (quando não existir banner vindo do Admin).
 *
 * ✅ Se você usar imagem LOCAL, coloque o arquivo em /public e use URL assim:
 *   imageUrl: "/banners/banner-01.webp"
 *
 * ✅ Se você usar imagem REMOTA (https://...), pode ser CDN.
 */
export const BANNERS: BannerItem[] = [
  // Exemplo (descomentando):
  // {
  //   id: 'ban_local_01',
  //   title: 'Descontos em Gramado',
  //   subtitle: 'Compre com vantagem hoje',
  //   highlight: 'Ofertas novas toda semana',
  //   tag: 'Destaque',
  //   href: '/ofertas',
  //   imageUrl: '/banners/banner-01.webp',
  //   align: 'left',
  //   active: true,
  //   order: 1,
  // },
];
