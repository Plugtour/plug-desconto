'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import HomeBanner from './HomeBanner';

import QuickSearch, { QuickSearchPanel } from './search/QuickSearch';
import type { SearchCategory, SearchOffer } from './search/types';

import SponsoredOffersRow from './offers/SponsoredOffersRow';
import ExposedCarouselRow from './offers/ExposedCarouselRow';
import SponsoredOffersList from './offers/SponsoredOffersList';

import MenuCarousel from './menu/MenuCarousel';
import FloatingTopMenu from './menu/FloatingTopMenu';
import MenuCarouselModal from './menu/MenuCarouselModal';

import { SPONSORED_OFFERS } from '../../_data/sponsoredOffers';
import { EXPOSED_GASTRONOMY } from '../../_data/exposedOffers';

import BottomNav from './bottom-nav/BottomNav';
import { BOTTOM_NAV_ITEMS } from './bottom-nav/items';

type OfferLike = any;

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star';

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

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

  /* =========================
     MODAL (Categorias)
  ========================= */
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuModalCategoryName, setMenuModalCategoryName] = useState<string>('');
  const [menuModalCategoryCount, setMenuModalCategoryCount] = useState<number>(0);

  const openMenuModal = () => setMenuModalOpen(true);
  const closeMenuModal = () => setMenuModalOpen(false);

  const handleCategoryClick = (cat: CategoryItem) => {
    setMenuModalCategoryName(cat?.title ?? '');
    setMenuModalCategoryCount(Number(cat?.count ?? 0));
    openMenuModal();
  };

  /* =========================
     ✅ NOVO: MODAL (Busca rápida)
  ========================= */
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const openSearchModal = () => setSearchModalOpen(true);
  const closeSearchModal = () => setSearchModalOpen(false);

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

  /* =========================
     MENU FLUTUANTE (trigger)
  ========================= */
  const gridMenuRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const FLOATING_MENU_H = 75; // px
  const rafRef = useRef<number | null>(null);
  const HYSTERESIS_PX = 18;
  const MIN_SCROLL_TO_ENABLE = 8;

  useEffect(() => {
    const computeTriggerDocY = () => {
      const el = gridMenuRef.current;
      if (!el) return null;

      const rect = el.getBoundingClientRect();
      const topDoc = window.scrollY + rect.top;

      const rowH = rect.height / 2;
      return topDoc + rowH * 1.5;
    };

    const onScroll = () => {
      if (rafRef.current) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const triggerDocY = computeTriggerDocY();
        if (triggerDocY == null) return;

        const y = window.scrollY;

        if (y < MIN_SCROLL_TO_ENABLE) {
          setShowFloatingMenu(false);
          return;
        }

        const shouldShow = y >= triggerDocY;
        const shouldHide = y < triggerDocY - HYSTERESIS_PX;

        setShowFloatingMenu((prev) => {
          if (!prev && shouldShow) return true;
          if (prev && shouldHide) return false;
          return prev;
        });
      });
    };

    setShowFloatingMenu(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const stickyStackPx = showFloatingMenu ? FLOATING_MENU_H : 0;

  return (
    <div
      className="mx-auto w-full max-w-md bg-zinc-100"
      style={{
        paddingBottom: 'calc(74px + env(safe-area-inset-bottom))',
        ['--app-header-h' as any]: 'var(--app-header-h, calc(56px + env(safe-area-inset-top)))',
        ['--floating-menu-h' as any]: showFloatingMenu ? `${FLOATING_MENU_H}px` : '0px',
        ['--quicksearch-h' as any]: '0px',
        ['--sticky-stack-h' as any]: `${stickyStackPx}px`,
      }}
    >
      <div
        id="top-fixed-stack"
        className="pointer-events-none absolute inset-x-0 top-0"
        aria-hidden="true"
      >
        <div style={{ height: showFloatingMenu ? FLOATING_MENU_H : 0 }} />
      </div>

      {/* ✅ MODAL (Categorias) */}
      <MenuCarouselModal
        open={menuModalOpen}
        onClose={closeMenuModal}
        title="Categoria"
        categoryName={menuModalCategoryName}
        categoryCount={menuModalCategoryCount}
      />

      {/* ✅ MODAL (Busca rápida) — mesmo componente, conteúdo do QuickSearchPanel */}
      <MenuCarouselModal
        open={searchModalOpen}
        onClose={closeSearchModal}
        hideHeader
      >
        <div className="rounded-t-md bg-zinc-100/92 shadow-2xl ring-1 ring-black/10 overflow-hidden">
          <QuickSearchPanel
            offers={searchData}
            categories={searchCategories}
            onRequestClose={closeSearchModal}
          />
        </div>
      </MenuCarouselModal>

      {/* MENU CARROSSEL */}
      <div ref={gridMenuRef}>
        <MenuCarousel
          categories={categories}
          className="pt-0"
          onOpenModal={() => openMenuModal()}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      <HomeBanner className="mt-4" />

      {/* MENU FLUTUANTE */}
      <FloatingTopMenu
        categories={categories}
        visible={showFloatingMenu}
        onOpenModal={() => openMenuModal()}
        onCategoryClick={handleCategoryClick}
      />

      <div className="pt-1">
        <div className="px-4 mt-1 pb-2">
          {/* ✅ AQUI: clique na busca abre o MenuCarouselModal (com conteúdo da 2ª imagem) */}
          <QuickSearch
            offers={searchData}
            categories={searchCategories}
            useExternalModal
            onOpenExternal={openSearchModal}
          />
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

      <SponsoredOffersList
        className="mt-7"
        title=""
        items={top10ListItems}
        initialCount={5}
        step={5}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
      />

      <BottomNav items={BOTTOM_NAV_ITEMS} heightPx={74} />
    </div>
  );
}
