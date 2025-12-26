'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import ProductSideModal from './ProductSideModal';

export type ExposedCarouselItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  href: string;

  savingsText?: string | null;
  rating?: number | null;
  reviews?: number | null;

  // ===== Conteúdo do modal (expansível) =====
  gallery?: string[] | null;
  description?: string | null;
  highlights?: string[] | null;
  couponCode?: string | null;
};

type Props = {
  title?: string;
  categoryLabel?: string;
  categoryCount: number;
  viewAllHref: string;
  items: ExposedCarouselItem[];
  className?: string;
  variant?: 'default' | 'tours';
};

export default function ExposedCarouselRow({
  title = 'Você também pode gostar',
  categoryLabel = 'Gastronomia',
  categoryCount,
  viewAllHref,
  items,
  className,
  variant = 'default',
}: Props) {
  const list = useMemo(() => items ?? [], [items]);
  if (!list.length) return null;

  const [fav, setFav] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return list.find((x) => x.id === selectedId) ?? null;
  }, [selectedId, list]);

  const isSelectedFav = selectedId ? !!fav[selectedId] : false;

  function openModalFor(itemId: string, e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
      // @ts-ignore
      e.stopPropagation?.();
    }
    setSelectedId(itemId);
    setModalOpen(true);
    setModalClosing(false);
  }

  function closeModal() {
    setModalClosing(true);
    window.setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
      setSelectedId(null);
    }, 240);
  }

  function toggleSelectedFav() {
    if (!selectedId) return;
    setFav((p) => ({ ...p, [selectedId]: !p[selectedId] }));
  }

  async function shareSelected() {
    try {
      const it = selectedItem;
      if (!it) return;

      const url =
        typeof window !== 'undefined'
          ? it.href
            ? new URL(it.href, window.location.origin).toString()
            : window.location.href
          : '';

      if (navigator.share) {
        await navigator.share({
          title: it.title ?? 'Plug Desconto',
          text: '',
          url,
        });
        return;
      }

      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  }

  // esconde "Ver todas" quando chega no último card
  const [hideViewAll, setHideViewAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const tolerance = 6;
      const reachedEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - tolerance;
      setHideViewAll(reachedEnd);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  function RatingBadge({ rating, reviews }: { rating: number; reviews: number }) {
    return (
      <div className="absolute left-2 top-2 rounded-md bg-black/25 px-2 py-1 backdrop-blur-[4px] ring-1 ring-white/15 pointer-events-none">
        <div className="leading-none">
          <span className="text-[12px] font-semibold text-amber-400">★</span>{' '}
          <span className="text-[11px] font-semibold text-white">
            {rating.toFixed(1)} de {reviews}
          </span>
        </div>
      </div>
    );
  }

  function ViewAllCardDefault() {
    return (
      <Link href={viewAllHref} className="min-w-[144px] max-w-[144px] flex-shrink-0">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-white">
          <div className="absolute inset-0 grid place-items-center px-3 text-center">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Ver todos</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">
                da {categoryLabel}
              </div>
              <div className="mt-2 text-xs font-medium text-neutral-500">
                {categoryCount} opções
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  function ViewAllCardTours() {
    return (
      <Link href={viewAllHref} className="min-w-[144px] max-w-[144px] flex-shrink-0">
        <div className="relative aspect-[3/3.84] overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-white">
          <div className="absolute inset-0 grid place-items-center px-3 text-center">
            <div className="leading-tight">
              <div className="text-sm font-semibold text-neutral-900">Ver todos</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">
                da {categoryLabel}
              </div>
              <div className="mt-2 text-xs font-medium text-neutral-500">
                {categoryCount} opções
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <section className={className}>
      <ProductSideModal
        open={modalOpen}
        closing={modalClosing}
        onClose={closeModal}
        item={selectedItem}
        categoryLabel={categoryLabel}
        variant={variant}
        isFav={isSelectedFav}
        onToggleFav={toggleSelectedFav}
        onShare={shareSelected}
      />

      {/* Cabeçalho */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <div className="leading-tight">
          <h2 className="text-base font-semibold text-neutral-900 leading-tight">{title}</h2>
          <div className="text-sm font-medium text-neutral-600 leading-tight">{categoryLabel}</div>
        </div>

        {!hideViewAll ? (
          <Link
            href={viewAllHref}
            className="relative -top-[3px] text-sm font-semibold text-emerald-700 transition-colors duration-200 hover:text-emerald-800 active:opacity-80"
          >
            Ver todas ({categoryCount})
          </Link>
        ) : (
          <span className="relative -top-[3px] text-sm font-semibold text-emerald-700 opacity-0 select-none">
            Ver todas ({categoryCount})
          </span>
        )}
      </div>

      {/* Carrossel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className={[
            'no-scrollbar flex gap-3 px-4 overflow-x-auto',
            'scroll-smooth overscroll-x-contain',
            'touch-auto',
          ].join(' ')}
        >
          {/* VARIANT DEFAULT */}
          {variant === 'default' &&
            list.map((item) => {
              const rating = item.rating ?? 4.9;
              const reviews = item.reviews ?? 812;
              const isFav = !!fav[item.id];
              const savings = item.savingsText ?? 'Economia de R$50 a R$190';

              return (
                <div key={item.id} className="relative min-w-[144px] max-w-[144px] flex-shrink-0">
                  <Link
                    href={item.href}
                    className="block active:opacity-90"
                    onClick={(e) => openModalFor(item.id, e)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-200">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-300" />
                      )}

                      <RatingBadge rating={rating} reviews={reviews} />
                    </div>

                    <div className="mt-2">
                      <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                        {item.title}
                      </div>

                      <div className="mt-1 text-[12px] font-medium text-neutral-700">
                        {savings}
                      </div>

                      <button
                        type="button"
                        className="mt-2 text-[14px] font-semibold text-green-600"
                        onClick={(e) => openModalFor(item.id, e)}
                      >
                        Ver mais
                      </button>
                    </div>
                  </Link>

                  <button
                    type="button"
                    aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
                    }}
                    className="absolute right-2 top-2 z-[5] inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/20 backdrop-blur-[4px] ring-1 ring-white/15"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-6 w-6 transition ${isFav ? 'text-red-500' : 'text-white'}`}
                      fill={isFav ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={isFav ? 0 : 2}
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
                    </svg>
                  </button>
                </div>
              );
            })}

          {variant === 'default' && <ViewAllCardDefault />}

          {/* VARIANT TOURS */}
          {variant === 'tours' &&
            list.map((item) => {
              const rating = item.rating ?? 4.9;
              const reviews = item.reviews ?? 812;
              const isFav = !!fav[item.id];

              return (
                <div key={item.id} className="relative min-w-[144px] max-w-[144px] flex-shrink-0">
                  <Link
                    href={item.href}
                    className="block active:opacity-90"
                    onClick={(e) => openModalFor(item.id, e)}
                  >
                    <div className="relative aspect-[3/3.84] overflow-hidden rounded-xl bg-neutral-200">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-300" />
                      )}

                      <RatingBadge rating={rating} reviews={reviews} />

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                      <div className="absolute bottom-2 left-2 right-2 overflow-hidden">
                        <div className="text-sm font-medium text-white leading-snug max-h-[3.9em] overflow-hidden">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
                    }}
                    className="absolute right-2 top-2 z-[5] inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/20 backdrop-blur-[4px] ring-1 ring-white/15"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-6 w-6 transition ${isFav ? 'text-red-500' : 'text-white'}`}
                      fill={isFav ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={isFav ? 0 : 2}
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
                    </svg>
                  </button>
                </div>
              );
            })}

          {variant === 'tours' && <ViewAllCardTours />}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </section>
  );
}
