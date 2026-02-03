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

import BottomNav from './bottom-nav/BottomNav';
import { BOTTOM_NAV_ITEMS } from './bottom-nav/items';

type OfferLike = any;

/** ✅ Tipo local */
type SponsoredOffer = {
  id: string;
  title: string;
  href: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviews?: number | null;
  savingsText?: string | null;
  priceText?: string | null;
  tags?: string[] | null;
  city?: string | null;
  vendorName?: string | null;
  vendorAbout?: string | null;

  subtitle?: string | null;
  whatsappHref?: string | null;
  address?: string | null;
  addressText?: string | null;
  calendar?: any | null;
  times?: any | null;
  exceptions?: any | null;
};

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
  id: string; // ✅ chave canônica do menu (slug quando existir)
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

/**
 * ✅ NORMALIZA imageUrl para funcionar com seus componentes responsivos:
 * - remove sufixo -w### (ex: -w128, -w256)
 * - converte /uploads/offers/... -> /offers/...
 * - se vier só "arquivo.webp" -> /offers/arquivo.webp
 * - mantém URLs remotas (http/https)
 */
function normalizeImageUrl(raw: any) {
  const s0 = norm(raw);
  if (!s0) return null;

  // remoto: mantém como está
  if (/^https?:\/\//i.test(s0)) return s0;

  // separa querystring
  const [pathPart, queryPart] = s0.split('?');
  let p = String(pathPart || '').trim();
  if (!p) return null;

  // normaliza barras (windows)
  p = p.replace(/\\/g, '/').trim();

  // garante / no início para paths locais
  if (!p.startsWith('/')) p = `/${p}`;

  // remove -w### antes da extensão (qualquer extensão)
  p = p.replace(/-w\d+(?=\.[a-z0-9]+$)/i, '');

  // 🔥 AJUSTE CRÍTICO: /uploads/offers -> /offers
  p = p.replace(/^\/uploads\/offers\//i, '/offers/');

  // se veio só "/arquivo.webp" (sem pasta), assume /offers/
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 1) {
    p = `/offers/${parts[0]}`;
  }

  return queryPart ? `${p}?${queryPart}` : p;
}

function mapIconKey(raw: any, slugOrName: string): IconKey {
  const k = norm(raw).toLowerCase();

  // ✅ padrão do Admin
  if (
    k === 'food' ||
    k === 'ticket' ||
    k === 'service' ||
    k === 'shopping' ||
    k === 'hotel' ||
    k === 'transfer' ||
    k === 'attraction'
  ) {
    return k as IconKey;
  }

  // ✅ compat antigo
  if (k === 'fork') return 'food';
  if (k === 'spark') return 'service';
  if (k === 'bag') return 'shopping';
  if (k === 'bed') return 'hotel';
  if (k === 'car') return 'transfer';
  if (k === 'star') return 'attraction';
  if (k === 'pin') return 'pin';

  // ✅ fallback por slug/nome
  const s = norm(slugOrName).toLowerCase();
  if (s.includes('gast')) return 'food';
  if (s.includes('ingre') || s.includes('ticket')) return 'ticket';
  if (s.includes('serv')) return 'service';
  if (s.includes('comp')) return 'shopping';
  if (s.includes('hosp') || s.includes('hotel')) return 'hotel';
  if (s.includes('trans')) return 'transfer';
  if (s.includes('atra')) return 'attraction';
  if (s.includes('pass') || s.includes('tour')) return 'pin';

  return 'service';
}

/** Mapeia "offers" genérico -> SponsoredOffer */
function mapToSponsoredOffer(o: any, fallbackCategoryTitle: string): SponsoredOffer {
  const id = norm(o?.id ?? o?._id) || `tmp-${Math.random().toString(16).slice(2)}`;
  const title = norm(o?.title ?? o?.name ?? o?.nome ?? o?.titulo) || 'Benefício';

  const slug = norm(o?.slug ?? o?.seoSlug ?? o?.slugId);
  const href = safeHref(o?.href ?? (slug ? `/beneficio/${encodeURIComponent(slug)}` : o?.link ?? '/'));

  // ✅ aqui: normaliza URL pra base (sem -w###) e corrige /uploads/offers -> /offers
  const imageUrl = normalizeImageUrl(
    o?.imageUrl ?? o?.image ?? o?.cover ?? o?.coverImage ?? o?.coverImageUrl ?? o?.banner
  );

  const rating = safeNumber(o?.rating ?? o?.nota ?? o?.stars, 0);
  const reviews = safeNumber(o?.reviews ?? o?.reviewsCount ?? o?.avaliacoes, 0);

  const savingsText = o?.savingsText ?? o?.economyText ?? o?.economizeText ?? null;
  const priceText = o?.priceText ?? o?.precoTexto ?? o?.discountText ?? o?.desconto ?? null;

  const city = norm(o?.city ?? o?.cidade) || null;

  const tags = Array.isArray(o?.tags) && o.tags.length ? o.tags : [city || 'Serra Gaúcha', fallbackCategoryTitle];

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
    tags,
    city,
    vendorName,
    vendorAbout,
    subtitle: o?.subtitle ?? o?.subTitle ?? null,
    whatsappHref: o?.whatsappHref ?? null,
    address: o?.address ?? null,
    addressText: o?.addressText ?? null,
    calendar: o?.calendar ?? null,
    times: o?.times ?? null,
    exceptions: o?.exceptions ?? null,
  } as any;
}

function isPublished(o: any) {
  const s = norm(o?.status ?? o?.offerStatus ?? o?.state).toLowerCase();
  if (!s) return true;
  return s === 'publicado' || s === 'published' || s === 'active' || s === 'ativo';
}

export default function HomeScreenClient({
  regionLabel = 'Serra Gaúcha',
  offers = [],
}: {
  regionLabel?: string;
  offers: OfferLike[];
}) {
  /* =========================
     OFERTAS
  ========================= */
  const [apiOffers, setApiOffers] = useState<OfferLike[]>([]);
  const [offersErr, setOffersErr] = useState<string | null>(null);

  const inputOffers = Array.isArray(offers) ? offers : [];

  useEffect(() => {
    let alive = true;

    async function loadOffersIfNeeded() {
      if (inputOffers.length > 0) return;

      try {
        setOffersErr(null);
        const r = await fetch('/api/offers', { cache: 'no-store' });
        const j = await r.json();
        const list = Array.isArray(j?.items) ? j.items : [];
        if (!alive) return;
        setApiOffers(list);
      } catch (e: any) {
        if (!alive) return;
        setOffersErr(e?.message || 'Falha ao carregar ofertas');
        setApiOffers([]);
      }
    }

    loadOffersIfNeeded();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputOffers.length]);

  const usedOffers = inputOffers.length > 0 ? inputOffers : apiOffers;

  const publishedOffers = useMemo(() => {
    const list = Array.isArray(usedOffers) ? usedOffers : [];
    return list.filter(isPublished);
  }, [usedOffers]);

  /* =========================
     CATEGORIAS (Admin)
  ========================= */
  const [cats, setCats] = useState<ApiCategoria[]>([]);
  const [catsErr, setCatsErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadCats() {
      try {
        setCatsErr(null);
        const r = await fetch('/api/admin/config/categorias', { cache: 'no-store' });
        const j = await r.json();
        const list = Array.isArray(j?.categorias) ? (j.categorias as ApiCategoria[]) : [];
        if (!alive) return;
        setCats(list);
      } catch (e: any) {
        if (!alive) return;
        setCatsErr(e?.message || 'Falha ao carregar categorias');
        setCats([]);
      }
    }

    loadCats();
    return () => {
      alive = false;
    };
  }, []);

  /**
   * ✅ resolve o "0":
   * - offer pode vir com categoryId = slug OU id
   * - menu usa slug como chave canônica
   */
  const catMaps = useMemo(() => {
    const rawCats = Array.isArray(cats) ? cats : [];
    const activeCats = rawCats.filter((c) => !!c && c.ativo !== false);

    const idToSlug = new Map<string, string>();
    const slugSet = new Set<string>();

    for (const c of activeCats) {
      const cid = norm(c.id);
      const slug = norm(c.slug) || cid;
      if (cid && slug) idToSlug.set(cid, slug);
      if (slug) slugSet.add(slug);
    }

    function resolveToSlug(key: any) {
      const k = norm(key);
      if (!k) return '';
      if (slugSet.has(k)) return k; // já é slug
      if (idToSlug.has(k)) return idToSlug.get(k) || '';
      return k; // fallback
    }

    return { activeCats, resolveToSlug };
  }, [cats]);

  /**
   * ✅ MENU
   * - usa categorias do admin quando existir
   * - se vier vazio, cria fallback pelas ofertas (para nunca sumir)
   */
  const categories: CategoryItem[] = useMemo(() => {
    const bySlugCount = new Map<string, number>();

    for (const o of publishedOffers) {
      const raw = norm(o?.categoryId ?? o?.category ?? o?.categoriaId);
      if (!raw) continue;

      const slugKey = catMaps.resolveToSlug(raw);
      if (!slugKey) continue;

      bySlugCount.set(slugKey, (bySlugCount.get(slugKey) ?? 0) + 1);
    }

    // 1) Preferência: categorias do admin
    const adminCats = (catMaps.activeCats || [])
      .map((c) => {
        const slug = norm(c.slug) || norm(c.id);
        if (!slug) return null;

        const title = norm(c.nome) || slug || 'Categoria';
        const count = bySlugCount.get(slug) ?? 0;

        return {
          id: slug,
          title,
          count,
          iconKey: mapIconKey(c.iconKey, `${c.slug || ''} ${c.nome || ''}`),
        } as CategoryItem;
      })
      .filter(Boolean) as CategoryItem[];

    if (adminCats.length > 0) {
      adminCats.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      return adminCats;
    }

    // 2) Fallback: cria categorias a partir das ofertas
    const fallback: CategoryItem[] = [];
    for (const [slug, count] of bySlugCount.entries()) {
      fallback.push({
        id: slug,
        title: slug,
        count,
        iconKey: mapIconKey(null, slug),
      });
    }

    fallback.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    return fallback;
  }, [publishedOffers, catMaps]);

  const categoryTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.title);
    return m;
  }, [categories]);

  /* =========================
     ITENS (HOME)
  ========================= */
  const allSponsoredItems: SponsoredOffer[] = useMemo(() => {
    const raw = Array.isArray(publishedOffers) ? publishedOffers : [];

    return raw
      .map((o: any) => {
        const rawCid = norm(o?.categoryId ?? o?.category ?? o?.categoriaId);
        const slugCid = catMaps.resolveToSlug(rawCid);
        const catTitle = (slugCid && categoryTitleById.get(slugCid)) || 'Categoria';
        return mapToSponsoredOffer(o, catTitle);
      })
      .filter(Boolean) as SponsoredOffer[];
  }, [publishedOffers, categoryTitleById, catMaps]);

  const bestRatedTop10 = useMemo(() => {
    const base = [...allSponsoredItems];
    base.sort((a: any, b: any) => {
      const ar = safeNumber(a?.rating, 0);
      const br = safeNumber(b?.rating, 0);
      if (br !== ar) return br - ar;
      const av = safeNumber(a?.reviews, 0);
      const bv = safeNumber(b?.reviews, 0);
      return bv - av;
    });
    return base.slice(0, 10);
  }, [allSponsoredItems]);

  const bestRatedCount = bestRatedTop10.length;

  const bestRatedCarouselItems = useMemo(() => {
    return bestRatedTop10.map((o: any) => ({
      id: o.id,
      title: o.title,
      imageUrl: o.imageUrl ?? null,
      href: o.href,
      savingsText: o.savingsText ?? (o.priceText ? `Economize ${o.priceText}` : null),
      rating: safeNumber(o.rating, 0),
      reviews: safeNumber(o.reviews, 0),
    }));
  }, [bestRatedTop10]);

  const mainListItems = useMemo(() => {
    const base = [...allSponsoredItems];
    base.sort((a: any, b: any) => {
      const ar = safeNumber(a?.rating, 0);
      const br = safeNumber(b?.rating, 0);
      if (br !== ar) return br - ar;
      const av = safeNumber(a?.reviews, 0);
      const bv = safeNumber(b?.reviews, 0);
      return bv - av;
    });
    return base.slice(0, 30);
  }, [allSponsoredItems]);

  const sponsoredRowItems = useMemo(() => {
    const base = [...allSponsoredItems];

    const withSavings = base.filter((x: any) => norm(x?.savingsText) || norm(x?.priceText));
    const src = withSavings.length ? withSavings : base;

    src.sort((a: any, b: any) => {
      const ar = safeNumber(a?.rating, 0);
      const br = safeNumber(b?.rating, 0);
      if (br !== ar) return br - ar;
      const av = safeNumber(a?.reviews, 0);
      const bv = safeNumber(b?.reviews, 0);
      return bv - av;
    });

    return src.slice(0, 12);
  }, [allSponsoredItems]);

  /* =========================
     MODAL (Categorias)
  ========================= */
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuModalCategoryId, setMenuModalCategoryId] = useState<string>(''); // slug
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

  const searchCategories: SearchCategory[] = useMemo(() => {
    return categories.map((c) => ({ id: c.id, title: c.title, count: c.count }));
  }, [categories]);

  const searchData: SearchOffer[] = useMemo(() => {
    const list = Array.isArray(publishedOffers) ? publishedOffers : [];
    return list
      .map((o: any): SearchOffer | null => {
        const id = String(o?.id ?? o?._id ?? '').trim();
        const slug = (o?.slug ?? o?.seoSlug ?? o?.slugId ?? null) as string | null;

        const title = String(o?.title ?? o?.name ?? o?.nome ?? o?.titulo ?? '').trim();
        if (!id || !title) return null;

        const subtitle =
          (o?.subtitle ?? o?.subTitle ?? o?.descricaoCurta ?? o?.shortDescription ?? null) as string | null;

        const rawCid = (o?.categoryId ?? o?.category ?? o?.categoriaId ?? null) as string | null;
        const categoryId = rawCid ? catMaps.resolveToSlug(rawCid) : null;

        const city = (o?.city ?? o?.cidade ?? o?.locationCity ?? null) as string | null;

        const priceText = (o?.priceText ?? o?.precoTexto ?? o?.price_label ?? o?.priceLabel ?? null) as string | null;

        const imageUrl = normalizeImageUrl(
          o?.imageUrl ?? o?.image ?? o?.cover ?? o?.coverImage ?? o?.coverImageUrl ?? o?.banner
        ) as string | null;

        return { id, slug, title, subtitle, categoryId, city, priceText, imageUrl };
      })
      .filter(Boolean) as SearchOffer[];
  }, [publishedOffers, catMaps, categories]);

  /* =========================
     LISTA DO MODAL POR CATEGORIA
  ========================= */
  const modalItems: SponsoredOffer[] = useMemo(() => {
    const selectedSlug = norm(menuModalCategoryId);
    const catTitle = categories.find((c) => c.id === selectedSlug)?.title || menuModalCategoryName || 'Categoria';

    const raw = Array.isArray(publishedOffers) ? publishedOffers : [];

    const filtered = selectedSlug
      ? raw.filter((o: any) => {
          const rawCid = norm(o?.categoryId ?? o?.category ?? o?.categoriaId);
          if (!rawCid) return false;
          const offerSlug = catMaps.resolveToSlug(rawCid);
          return offerSlug === selectedSlug;
        })
      : raw;

    return filtered.map((o: any) => mapToSponsoredOffer(o, catTitle));
  }, [publishedOffers, menuModalCategoryId, menuModalCategoryName, categories, catMaps]);

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

      {/* ✅ MODAL (Categorias) */}
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
        {catsErr || offersErr ? (
          <div className="px-4 pt-3 text-[12px] text-red-600">
            {catsErr ? `Categorias: ${catsErr}` : null}
            {catsErr && offersErr ? ' • ' : null}
            {offersErr ? `Ofertas: ${offersErr}` : null}
          </div>
        ) : null}

        <MenuCarousel categories={categories as any} className="pt-0" onCategoryClick={handleCategoryClick} />
      </div>

      <HomeBanner className="mt-4" />

      {/* MENU FLUTUANTE */}
      <FloatingTopMenu categories={categories as any} visible={showFloatingMenu} onCategoryClick={handleCategoryClick} />

      <div className="pt-1">
        <div className="px-4 mt-1 pb-2">
          <QuickSearch offers={searchData} categories={searchCategories} useExternalModal onOpenExternal={openSearchModal} />
        </div>
      </div>

      {sponsoredRowItems.length ? <SponsoredOffersRow items={sponsoredRowItems as any} className="mt-4" /> : null}

      {bestRatedCarouselItems.length ? (
        <ExposedCarouselRow
          className="mt-6"
          title="Top 10 mais bem avaliados"
          categoryLabel="Mais bem avaliados"
          categoryCount={bestRatedCount}
          viewAllHref="/ofertas"
          items={bestRatedCarouselItems as any}
        />
      ) : null}

      <SponsoredOffersList
        className="mt-7"
        title=""
        items={mainListItems as any}
        initialCount={5}
        step={5}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
      />

      <BottomNav items={BOTTOM_NAV_ITEMS} heightPx={74} />
    </div>
  );
}
