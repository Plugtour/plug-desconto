// app/_components/offers/ExposedCarouselRow.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

// ✅ Modal 2 (bottom sheet)
import MenuCarouselModalRight from '../modals/MenuCarouselModalRight';

// ✅ store global de favoritos
import { getFavorites, onFavoritesChange, toggleFavorite } from '../favorites/favoritesStore';

// ✅ mesmo conteúdo de modal dos patrocinados
import ProductDetailContent, { type ProductModalData } from '@/app/_components/product/ProductDetailContent';
import OfferEconomyLine from '@/app/_components/offers/OfferEconomyLine';

export type ExposedCarouselItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  href: string;
  savingsText?: string | null;
  rating?: number | null;
  reviews?: number | null;

  // opcionais (se já existir no seu data depois)
  priceText?: string | null;
  vendorName?: string | null;
  vendorAbout?: string | null;
  addressText?: string | null;
  whatsappHref?: string | null;

  calendar?: ProductModalData['calendar'] | null;
  times?: ProductModalData['times'] | null;
  exceptions?: ProductModalData['exceptions'] | null;
};

type Props = {
  title?: string;
  categoryLabel?: string;
  categoryCount: number;
  viewAllHref: string;
  items: ExposedCarouselItem[];
  className?: string;
};

/* =========================
   HELPERS
========================= */
function safeHref(v: any) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : '/';
}

function isAllowedMediaSrc(src: string) {
  const s = String(src || '').trim();
  return s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://');
}

function safeNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatPtOne(n: number) {
  return n.toFixed(1);
}

/* =========================
   IMG RESPONSIVA (cards)
   - aceita:
     /offers/cafe-colonial
     /offers/cafe-colonial.webp
     /offers/cafe-colonial-w256.webp  (limpa e gera variantes)
========================= */
function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function addQuery(url: string, key: string, val: string | number) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
}

function splitUrl(url: string) {
  const u = String(url || '').trim();
  const clean = u.split('?')[0] || u;
  const q = u.includes('?') ? u.slice(u.indexOf('?')) : '';
  return { clean, q };
}

// remove sufixo "-w###" se existir
function stripWidthSuffix(pathname: string) {
  return pathname.replace(/-w\d+(?=\.[a-z0-9]+$)/i, '');
}

// garante extensão .webp quando não houver extensão
function ensureExt(pathname: string) {
  const hasExt = /\.[a-z0-9]+$/i.test(pathname);
  return hasExt ? pathname : `${pathname}.webp`;
}

function localVariant(url: string, width: number) {
  // exemplos aceitos:
  // /offers/cafe-colonial            -> /offers/cafe-colonial-w512.webp
  // /offers/cafe-colonial.webp       -> /offers/cafe-colonial-w512.webp
  // /offers/cafe-colonial-w256.webp  -> /offers/cafe-colonial-w512.webp
  const { clean, q } = splitUrl(url);
  const baseWithExt = ensureExt(stripWidthSuffix(clean));

  const lastDot = baseWithExt.lastIndexOf('.');
  if (lastDot <= 0) return `${baseWithExt}-w${width}${q}`;

  const base = baseWithExt.slice(0, lastDot);
  const ext = baseWithExt.slice(lastDot);
  return `${base}-w${width}${ext}${q}`;
}

function variantUrl(url: string, width: number) {
  const u = String(url || '').trim();
  if (!u) return '';
  if (isRemoteUrl(u)) return addQuery(u, 'w', width);
  return localVariant(u, width);
}

function buildSrcSet(url: string, widths: number[]) {
  const u = String(url || '').trim();
  if (!u) return '';
  return widths.map((w) => `${variantUrl(u, w)} ${w}w`).join(', ');
}

/* =========================
   ESTRELAS
========================= */
function Star({ fillPct }: { fillPct: number }) {
  const id = React.useId();
  const pct = Math.max(0, Math.min(100, fillPct));

  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
        className="fill-zinc-300"
      />
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={`${pct}%`} height="24" />
        </clipPath>
      </defs>
      <path
        d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
        className="fill-yellow-400"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

function StarsRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return (
          <span key={i} className={i === 0 ? '' : '-ml-[3px]'}>
            <Star fillPct={fill} />
          </span>
        );
      })}
    </div>
  );
}

/* =========================
   CORAÇÃO
========================= */
function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
    </svg>
  );
}

function buildFavMapFromStore(): Record<string, boolean> {
  const list = getFavorites?.() ?? [];
  const map: Record<string, boolean> = {};
  for (const it of list as any[]) {
    const id = String((it as any)?.id ?? '');
    if (id) map[id] = true;
  }
  return map;
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function ExposedCarouselRow({
  title = 'Top 10 mais bem avaliados',
  categoryLabel = 'Mais bem avaliados',
  categoryCount,
  viewAllHref,
  items,
  className,
}: Props) {
  const list = useMemo(() => items ?? [], [items]);
  if (!list.length) return null;

  void categoryCount;

  const [favIds, setFavIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hideViewRank, setHideViewRank] = useState(false);

  // ✅ Modal 2
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExposedCarouselItem | null>(null);

  useEffect(() => {
    const sync = () => setFavIds(buildFavMapFromStore());
    sync();

    const off = onFavoritesChange?.(sync);
    return () => {
      if (typeof off === 'function') off();
    };
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const last = scroller.lastElementChild as HTMLElement | null;
      if (!last) return;

      const sr = scroller.getBoundingClientRect();
      const lr = last.getBoundingClientRect();

      const visible = lr.left < sr.right && lr.right > sr.left;
      setHideViewRank(visible);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const openModal = (item: ExposedCarouselItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const closeModal = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

  // ✅ Modal com o MESMO conteúdo/padrão do patrocinado (ProductDetailContent)
  const modalContent = useMemo(() => {
    if (!selectedItem) return <div className="p-2" />;

    const o: any = selectedItem as any;
    const id = String(o.id ?? '');
    const isFav = !!favIds[id];

    const rating = safeNumber(o.rating) ?? 0;
    const reviews = safeNumber(o.reviews) ?? 0;
    const hrefSafe = safeHref(o.href);
    const imageUrl = o.imageUrl ?? null;

    const mediaList = [
      ...(imageUrl && isAllowedMediaSrc(String(imageUrl)) ? [{ src: String(imageUrl), alt: String(o.title ?? '') }] : []),
      { src: '/banners/banner-1.webp', alt: 'Banner 1' },
      { src: '/banners/banner-2.webp', alt: 'Banner 2' },
      { src: '/banners/banner-3.webp', alt: 'Banner 3' },
    ];

    const data: ProductModalData = {
      id,
      title: String(o.title ?? ''),
      headline: String(categoryLabel ?? ''),
      vendorName: String((o.vendorName ?? '').trim() || o.title || ''),
      vendorAbout: String((o.vendorAbout ?? '').trim() || ''),
      media: mediaList,
      addressText: String((o.addressText ?? '').trim() || ''),
      rating,
      reviews,
      savingsText: o.savingsText ?? null,
      priceText: o.priceText ?? null,
      calendar: o.calendar ?? null,
      times: o.times ?? null,
      exceptions: o.exceptions ?? null,
    };

    return (
      <ProductDetailContent
        data={data}
        isFavorite={isFav}
        onToggleFavorite={() => {
          toggleFavorite?.({
            id,
            title: o.title ?? '',
            href: hrefSafe,
            imageUrl: imageUrl ?? null,
            subtitle: categoryLabel ?? null,
            city: null,
            priceText: o.priceText ?? null,
            savingsText: o.savingsText ?? null,
            rating: o.rating ?? null,
            reviews: o.reviews ?? null,
            tags: null,
            categoryLabel: categoryLabel ?? null,
          } as any);
        }}
        onClose={closeModal}
        economySlot={<OfferEconomyLine savingsText={o.savingsText ?? null} priceText={o.priceText ?? null} />}
        whatsappHref={o.whatsappHref ?? '#'}
      />
    );
  }, [selectedItem, favIds, categoryLabel]);

  // ✅ card fixo 228px, então sizes é constante
  const cardSizes = '228px';
  // ✅ escolhas práticas: 256 (normal) e 512 (retina)
  const CARD_WIDTHS = [256, 512];

  return (
    <section className={className}>
      {/* ✅ Modal 2 */}
      <MenuCarouselModalRight open={drawerOpen} onClose={closeModal} hideHeader>
        {modalContent}
      </MenuCarouselModalRight>

      {/* Cabeçalho */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="leading-[1.1]">
          <h2 className="text-base font-semibold text-zinc-900 leading-[1.15]">{title}</h2>
          <div className="-mt-[2px] text-sm font-medium text-zinc-600">{categoryLabel}</div>
        </div>

        {!hideViewRank ? (
          <Link href={safeHref(viewAllHref)} className="text-sm font-semibold text-emerald-700">
            Ver Rank
          </Link>
        ) : (
          <span className="text-sm font-semibold text-emerald-700 opacity-0 select-none">Ver Rank</span>
        )}
      </div>

      {/* Carrossel */}
      <div ref={scrollRef} className="no-scrollbar flex gap-4 px-4 overflow-x-auto scroll-smooth">
        {list.map((item) => {
          const rating = safeNumber(item.rating);
          const reviews = safeNumber(item.reviews);
          const savings = (typeof item.savingsText === 'string' ? item.savingsText.trim() : '') || '';
          const isFav = !!favIds[item.id];

          const src = item.imageUrl ? variantUrl(item.imageUrl, 256) || item.imageUrl : '';
          const srcSet = item.imageUrl ? buildSrcSet(item.imageUrl, CARD_WIDTHS) : '';

          return (
            <div
              key={item.id}
              className="relative min-w-[228px] max-w-[228px] flex-shrink-0 rounded-lg overflow-hidden"
              onClick={() => openModal(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openModal(item);
              }}
              role="button"
              tabIndex={0}
            >
              {/* FOTO */}
              <div className="relative h-[144px] bg-zinc-200">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    srcSet={srcSet || undefined}
                    sizes={cardSizes}
                    width={228}
                    height={144}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="auto"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-300" />
                )}

                {/* coração (store) */}
                <button
                  type="button"
                  aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    toggleFavorite?.({
                      id: item.id,
                      title: item.title ?? '',
                      imageUrl: item.imageUrl ?? null,
                      href: safeHref(item.href),
                      savingsText: item.savingsText ?? null,
                      rating: item.rating ?? null,
                      reviews: item.reviews ?? null,
                      categoryLabel,
                    } as any);
                  }}
                  className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center"
                >
                  <HeartIcon
                    filled={isFav}
                    className={['h-9 w-9 transition', isFav ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-400'].join(
                      ' '
                    )}
                  />
                </button>
              </div>

              {/* TEXTO */}
              <div className="bg-zinc-200 px-4 py-3">
                <div className="min-h-[36px] text-[13px] font-extrabold leading-[1.25] text-zinc-900 line-clamp-2">
                  {item.title}
                </div>

                {(categoryLabel || savings) ? (
                  <div className="mt-3">
                    {categoryLabel ? (
                      <div className="text-[12px] font-normal text-zinc-600 leading-[1.2]">{categoryLabel}</div>
                    ) : null}
                    {savings ? (
                      <div className="mt-[3px] text-[12px] font-medium text-zinc-900 leading-[1.2]">{savings}</div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    {rating !== null ? <StarsRow rating={rating} /> : null}
                    <div className="text-[12px] text-zinc-500">
                      <span className="font-semibold text-zinc-700">{rating !== null ? formatPtOne(rating) : '—'}</span>{' '}
                      de <span className="font-semibold text-zinc-700">{reviews !== null ? reviews : '—'}</span>
                    </div>
                  </div>

                  <span className="text-[14px] font-semibold text-green-600">Ver mais</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* CARD FINAL */}
        <Link href={safeHref(viewAllHref)} className="min-w-[228px] max-w-[228px] flex-shrink-0 rounded-lg overflow-hidden">
          <div className="bg-zinc-200 h-full grid place-items-center px-4 text-center">
            <div className="text-sm font-semibold text-zinc-900 leading-tight">
              <div>Ver Rank</div>
              <div>Completo</div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
