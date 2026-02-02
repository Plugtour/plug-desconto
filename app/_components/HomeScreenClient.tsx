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

import type { SponsoredOffer } from '../../_data/sponsoredOffers';

type OfferLike = any;

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star'
  | 'food'
  | 'service'
  | 'shopping'
  | 'hotel'
  | 'transfer'
  | 'attraction';

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

type ApiCategoria = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  iconKey?: string | null;
};

function norm(v: any) {
  return typeof v === 'string' ? v.trim() : '';
}

function safeNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeHref(v: any) {
  const s = norm(v);
  return s.length ? s : '/';
}

/** Mapeia "offers" genérico -> SponsoredOffer (o formato que o SponsoredOffersList usa) */
function mapToSponsoredOffer(o: any, fallbackCategoryTitle: string): SponsoredOffer {
  const id = norm(o?.id ?? o?._id) || `tmp-${Math.random().toString(16).slice(2)}`;
  const title = norm(o?.title ?? o?.name ?? o?.nome ?? o?.titulo) || 'Benefício';

  const slug = norm(o?.slug ?? o?.seoSlug ?? o?.slugId);
  const href = safeHref(o?.href ?? (slug ? `/beneficio/${encodeURIComponent(slug)}` : o?.link ?? '/'));

  const imageUrl = norm(o?.imageUrl ?? o?.image ?? o?.cover ?? o?.coverImage ?? o?.banner) || null;

  const rating = safeNumber(o?.rating ?? o?.nota ?? o?.stars, 4.7);
  const reviews = safeNumber(o?.reviews ?? o?.reviewsCount ?? o?.avaliacoes, 320);

  const savingsText = o?.savingsText ?? o?.economyText ?? o?.economizeText ?? null;
  const priceText = o?.priceText ?? o?.precoTexto ?? o?.discountText ?? o?.desconto ?? '20%';

  const city = norm(o?.city ?? o?.cidade) || null;

  const tags =
    Array.isArray(o?.tags) && o.tags.length ? o.tags : [city || 'Serra Gaúcha', fallbackCategoryTitle, 'Top'];

  // campos extras opcionais que seu ProductDetailContent tenta ler
  const vendorName = o?.vendorName ?? o?.parceiro ?? o?.partnerName ?? null;
  const vendorAbout = o?.vendorAbout ?? o?.description ?? o?.descricao ?? o?.shortDescription ?? null;

  return {
    id,
    title,
    href,
    imageUrl,
    rating,
    reviews,
    savingsText,
    priceText,

    // opcional/extra
    tags,
    city,
    vendorName,
    vendorAbout,
    subtitle: o?.subtitle ?? o?.subTitle ?? null,

    // se tiver no backend, já passa:
    whatsappHref: o?.whatsappHref ?? null,
    address: o?.address ?? null,
    addressText: o?.addressText ?? null,
    calendar: o?.calendar ?? null,
    times: o?.times ?? null,
    exceptions: o?.exceptions ?? null,
  } as any;
}

function normalizeIconKey(v: any): IconKey {
  const s = norm(v);

  // padrão novo
  if (
    s === 'food' ||
    s === 'ticket' ||
    s === 'service' ||
    s === 'shopping' ||
    s === 'hotel' ||
    s === 'transfer' ||
    s === 'attraction'
  )
    return s;

  // compatibilidade com padrão antigo (caso venha de algum lugar)
  if (s === 'pin' || s === 'spark' || s === 'fork' || s === 'bed' || s === 'bag' || s === 'car' || s === 'star')
    return s;

  // default seguro
  return 'service';
}

function buildFallbackCategories(): CategoryItem[] {
  return [
    { id: 'fallback-1', title: 'Ingressos', count: 0, iconKey: 'ticket' },
    { id: 'fallback-2', title: 'Serviços', count: 0, iconKey: 'service' },
    { id: 'fallback-3', title: 'Gastronomia', count: 0, iconKey: 'food' },
    { id: 'fallback-4', title: 'Hospedagem', count: 0, iconKey: 'hotel' },
    { id: 'fallback-5', title: 'Compras', count: 0, iconKey: 'shopping' },
    { id: 'fallback-6', title: 'Transfers', count: 0, iconKey: 'transfer' },
    { id: 'fallback-7', title: 'Atrações', count: 0, iconKey: 'attraction' },
  ];
}

export default function HomeScreenClient({
  regionLabel = 'Serra Gaúcha',
  offers = [],
}: {
  regionLabel?: string;
  offers: OfferLike[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(() => buildFallbackCategories());

  // Carrega categorias cadastradas no Admin (ativas) e calcula count pelas offers
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const r = await fetch('/api/categories', { cache: 'no-store' });
        const j = await r.json().catch(() => null);

        const list = (j?.categories ?? j?.categorias ?? []) as ApiCategoria[];
        const raw = Array.isArray(list) ? list : [];

        const active = raw.filter((c) => c && c.ativo);

        // contador por categoryId (oferta precisa ter categoryId = id da categoria)
        const counts = new Map<string, number>();
        const rawOffers = Array.isArray(offers) ? offers : [];
        for (const o of rawOffers) {
          const cid = norm(o?.categoryId ?? o?.category ?? o?.categoriaId);
          if (!cid) continue;
          counts.set(cid, (counts.get(cid) ?? 0) + 1);
        }

        const mapped: CategoryItem[] = active.map((c) => ({
          id: String(c.id),
          title: String(c.nome ?? '').trim() || 'Categoria',
          count: counts.get(String(c.id)) ?? 0,
          iconKey: normalizeIconKey(c.iconKey),
        }));

        // se vier vazio, mantém fallback
        if (!alive) return;
        setCategories(mapped.length ? mapped : buildFallbackCategories());
      } catch {
        if (!alive) return;
        setCategories(buildFallbackCategories());
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [offers]);

  /* =========================
     MODAL (Categorias)
  ========================= */
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuModalCategoryId, setMenuModalCategoryId] = useState<string>('');
  const [menuModalCategoryName, setMenuModalCategoryName] = useState<string>('');
  const [menuModalCategoryCount, setMenuModalCategoryCount] = useState<number>(0);

  const closeMenuModal = () => setMenuModalOpen(false);

  const handleCategoryClick = (cat: CategoryItem) => {
    setMenuModalCategoryId(cat?.id ?? '');
    setMenuModalCategoryName(cat?.title ?? '');
    setMenuModalCategoryCount(Number(cat?.count ?? 0));
    setMenuModalOpen(true);
  };

  /* =========================
     MODAL (Busca rápida)
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
          (o?.subtitle ?? o?.subTitle ?? o?.descricaoCurta ?? o?.shortDescription ?? null) as string | null;

        const categoryId = (o?.categoryId ?? o?.category ?? o?.categoriaId ?? null) as string | null;

        const city = (o?.city ?? o?.cidade ?? o?.locationCity ?? null) as string | null;

        const priceText =
          (o?.priceText ?? o?.precoTexto ?? o?.price_label ?? o?.priceLabel ?? null) as string | null;

        const imageUrl =
          (o?.imageUrl ?? o?.image ?? o?.cover ?? o?.coverImage ?? o?.banner ?? null) as string | null;

        return { id, slug, title, subtitle, categoryId, city, priceText, imageUrl };
      })
      .filter(Boolean) as SearchOffer[];
  }, [offers]);

  /* =========================
     LISTA DO MODAL POR CATEGORIA
  ========================= */
  const modalItems: SponsoredOffer[] = useMemo(() => {
    const selectedId = norm(menuModalCategoryId);
    const catTitle = categories.find((c) => c.id === selectedId)?.title || menuModalCategoryName || 'Categoria';

    const raw = Array.isArray(offers) ? offers : [];
    const filtered = selectedId
      ? raw.filter((o: any) => norm(o?.categoryId ?? o?.category ?? o?.categoriaId) === selectedId)
      : raw;

    const mapped = filtered.map((o: any) => mapToSponsoredOffer(o, catTitle));

    if (mapped.length) return mapped;

    // fallback (não fica vazio)
    return Array.from({ length: 12 }).map((_, i) =>
      mapToSponsoredOffer(
        {
          id: `mock-${selectedId || 'cat'}-${i + 1}`,
          title: `${catTitle} em destaque ${i + 1}`,
          imageUrl: null,
          href: '/beneficio/mock',
          rating: i % 3 === 0 ? 4.9 : 4.7,
          reviews: 200 + i * 37,
          priceText: i % 2 === 0 ? '25%' : '20%',
          savingsText: 'Economize agora',
          tags: [regionLabel, catTitle, 'Destaque'],
        },
        catTitle
      )
    );
  }, [offers, menuModalCategoryId, menuModalCategoryName, categories, regionLabel]);

  /* =========================
     MENU FLUTUANTE (trigger)
  ========================= */
  const gridMenuRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const FLOATING_MENU_H = 75;
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
      <div id="top-fixed-stack" className="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true">
        <div style={{ height: showFloatingMenu ? FLOATING_MENU_H : 0 }} />
      </div>

      {/* ✅ MODAL (Categorias) — com lista */}
      <MenuCarouselModal
        open={menuModalOpen}
        onClose={closeMenuModal}
        title="Categoria"
        categoryName={menuModalCategoryName}
        categoryCount={menuModalCategoryCount}
      >
        <div className="px-0 pb-2">
          <SponsoredOffersList
            className="mt-0"
            title=""
            items={modalItems}
            initialCount={10}
            step={10}
            categories={categories.map((c) => ({ id: c.id, title: c.title }))}
          />
        </div>
      </MenuCarouselModal>

      {/* ✅ MODAL (Busca rápida) */}
      <MenuCarouselModal open={searchModalOpen} onClose={closeSearchModal} hideHeader>
        <div className="rounded-t-md bg-zinc-100/92 shadow-2xl ring-1 ring-black/10 overflow-hidden">
          <QuickSearchPanel offers={searchData} categories={searchCategories} onRequestClose={closeSearchModal} />
        </div>
      </MenuCarouselModal>

      {/* MENU CARROSSEL */}
      <div ref={gridMenuRef}>
        <MenuCarousel categories={categories} className="pt-0" onCategoryClick={handleCategoryClick} />
      </div>

      <HomeBanner className="mt-4" />

      {/* MENU FLUTUANTE */}
      <FloatingTopMenu categories={categories} visible={showFloatingMenu} onCategoryClick={handleCategoryClick} />

      <div className="pt-1">
        <div className="px-4 mt-1 pb-2">
          <QuickSearch offers={searchData} categories={searchCategories} useExternalModal onOpenExternal={openSearchModal} />
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
        items={top10ListItems as any}
        initialCount={5}
        step={5}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
      />

      <BottomNav items={BOTTOM_NAV_ITEMS} heightPx={74} />
    </div>
  );
}
