// app/_components/HomeScreenClient.tsx
'use client';

import React, { useMemo } from 'react';
import HomeBanner from './HomeBanner';

import QuickSearch from './search/QuickSearch';
import type { SearchCategory, SearchOffer } from './search/types';

import SponsoredOffersRow from './offers/SponsoredOffersRow';
import ExposedCarouselRow from './offers/ExposedCarouselRow';
import SponsoredOffersList from './offers/SponsoredOffersList';

import MenuCarousel from './menu/MenuCarousel';

import { SPONSORED_OFFERS } from '../../_data/sponsoredOffers';
import { EXPOSED_GASTRONOMY } from '../../_data/exposedOffers';

/* =========================
   TIPOS
========================= */

type OfferLike = any;

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star';

export default function HomeScreenClient({
  regionLabel = 'Serra Gaúcha',
  offers = [],
}: {
  regionLabel?: string;
  offers: OfferLike[];
}) {
  const categories: CategoryItem[] = useMemo(
    () => [
      { id: 'passeios', title: 'Passeios', count: 23, iconKey: 'pin' },
      { id: 'ingressos', title: 'Ingressos', count: 31, iconKey: 'ticket' },
      { id: 'servicos', title: 'Serviços', count: 12, iconKey: 'spark' },
      { id: 'gastronomia', title: 'Gastronomia', count: 8, iconKey: 'fork' },
      { id: 'hospedagem', title: 'Hospedagem', count: 5, iconKey: 'bed' },
      { id: 'compras', title: 'Compras', count: 10, iconKey: 'bag' },
      { id: 'transfers', title: 'Transfers', count: 14, iconKey: 'car' },
      { id: 'atracoes', title: 'Atrações', count: 9, iconKey: 'star' },

      { id: 'passeios2', title: 'Passeios', count: 11, iconKey: 'pin' },
      { id: 'ingressos2', title: 'Ingressos', count: 7, iconKey: 'ticket' },
      { id: 'servicos2', title: 'Serviços', count: 6, iconKey: 'spark' },
      { id: 'gastronomia2', title: 'Gastronomia', count: 4, iconKey: 'fork' },
      { id: 'hospedagem2', title: 'Hospedagem', count: 3, iconKey: 'bed' },
      { id: 'compras2', title: 'Compras', count: 8, iconKey: 'bag' },
      { id: 'transfers2', title: 'Transfers', count: 5, iconKey: 'car' },
      { id: 'atracoes2', title: 'Atrações', count: 6, iconKey: 'star' },
    ],
    []
  );

  const top10Items = useMemo(() => {
    const base = Array.isArray(EXPOSED_GASTRONOMY) ? [...EXPOSED_GASTRONOMY] : [];
    base.sort((a: any, b: any) => {
      const ar = Number(a?.rating ?? 0);
      const br = Number(b?.rating ?? 0);
      if (br !== ar) return br - ar;
      const av = Number(a?.reviews ?? 0);
      const bv = Number(b?.reviews ?? 0);
      return bv - av;
    });

    const list = base.slice(0, 10);
    while (list.length < 10) {
      const idx = list.length + 1;
      list.push({
        id: `top10-extra-${idx}`,
        title: idx === 9 ? 'Café Colonial Premium' : 'Rodízio Especial da Casa',
        imageUrl: null,
        href: '/oferta/top10',
        savingsText: 'Economize até 40%',
        rating: 5,
        reviews: idx === 9 ? 1280 : 980,
      } as any);
    }
    return list.slice(0, 10);
  }, []);

  const top10Count = 10;

  const top10ListItems = useMemo(() => {
    const mk = (n: number, title: string, priceText: string, rating: number, reviews: number) =>
      ({
        id: `top10list-${n}`,
        title,
        imageUrl: null,
        tags: ['Gramado', 'Gastronomia', 'Top 10'],
        priceText,
        rating,
        reviews,
      } as any);

    return [
      mk(1, 'Sequência de Fondue da Serra', '35%', 4.9, 2140),
      mk(2, 'Café Colonial da Vila', '30%', 4.8, 1875),
      mk(3, 'Parmegiana Gigante Artesanal', '25%', 4.8, 1422),
      mk(4, 'Pizza Napoletana Premium', '20%', 4.7, 1650),
      mk(5, 'Churrasco na Parrilla', '28%', 4.9, 980),
      mk(6, 'Hambúrguer Smash + Refri', '22%', 4.7, 1210),
      mk(7, 'Massas Italianas da Casa', '26%', 4.8, 1334),
      mk(8, 'Bistrô Francês no Centro', '18%', 4.6, 905),
      mk(9, 'Tábua de Frios Especial', '24%', 4.7, 776),
      mk(10, 'Sobremesas & Cafés Gourmet', '15%', 4.6, 690),
      mk(11, 'Menu Executivo do Chef', '19%', 4.7, 812),
      mk(12, 'Rodízio de Sushi Selecionado', '27%', 4.8, 1540),
      mk(13, 'Brunch Completo de Domingo', '21%', 4.6, 508),
      mk(14, 'Cervejaria Artesanal + Tour', '17%', 4.7, 932),
      mk(15, 'Noite de Vinhos e Tábuas', '20%', 4.8, 1104),
    ];
  }, []);

  const searchCategories: SearchCategory[] = useMemo(() => {
    return categories.map((c) => ({ id: c.id, title: c.title, count: c.count }));
  }, [categories]);

  const searchData: SearchOffer[] = useMemo(() => {
    const list = Array.isArray(offers) ? offers : [];
    return list
      .map((o: any): SearchOffer | null => {
        const id = String(o?.id ?? o?._id ?? '').trim();
        const slug = (o?.slug ?? o?.seoSlug ?? o?.slugId ?? null) as string | null;

        const title = String(o?.title ?? o?.name ?? o?.nome ?? o?.titulo ?? '').trim();
        if (!id || !title) return null;

        const subtitle =
          (o?.subtitle ?? o?.subTitle ?? o?.descricaoCurta ?? o?.shortDescription ?? null) as
            | string
            | null;

        const categoryId =
          (o?.categoryId ?? o?.category ?? o?.categoriaId ?? null) as string | null;

        const city = (o?.city ?? o?.cidade ?? o?.locationCity ?? null) as string | null;

        const priceText =
          (o?.priceText ?? o?.precoTexto ?? o?.price_label ?? o?.priceLabel ?? null) as
            | string
            | null;

        const imageUrl =
          (o?.imageUrl ?? o?.image ?? o?.cover ?? o?.coverImage ?? o?.banner ?? null) as
            | string
            | null;

        return { id, slug, title, subtitle, categoryId, city, priceText, imageUrl };
      })
      .filter(Boolean) as SearchOffer[];
  }, [offers]);

  return (
    <div className="mx-auto w-full max-w-md bg-zinc-100">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-center">
          <button className="text-2xl font-extrabold text-zinc-800">
            {regionLabel}
            <span className="ml-2 text-zinc-500">⌄</span>
          </button>
        </div>

        <div className="mt-3 border-t border-zinc-300" />
      </div>

      {/* MENU CARROSSEL (extraído 1:1) */}
      <MenuCarousel categories={categories} />

      <HomeBanner className="mt-4" />

      {/* ✅ QuickSearch fixo com respiro e fundo sólido */}
      <div className="sticky top-[0px] z-[90] bg-zinc-100">
        <div className="pt-2">
          <div className="px-4 mt-3 pb-2">
            <QuickSearch offers={searchData} categories={searchCategories} />
          </div>
        </div>
      </div>

      <SponsoredOffersRow items={SPONSORED_OFFERS} className="mt-4" />

      <ExposedCarouselRow
        className="mt-6"
        title="Top 10 mais bem avaliados"
        categoryLabel="Mais bem avaliados"
        categoryCount={top10Count}
        viewAllHref="/top-10"
        items={top10Items}
      />

      {/* ✅ pedido #1: +5px entre carrossel e filtro/lista => mt-7 (28px) */}
      <SponsoredOffersList
        className="mt-7"
        title=""
        items={top10ListItems}
        initialCount={5}
        step={5}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
      />
    </div>
  );
}
