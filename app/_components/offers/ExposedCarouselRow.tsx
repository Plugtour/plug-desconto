'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type ExposedCarouselItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  href: string;
  savingsText?: string | null;
  rating?: number | null;
  reviews?: number | null;
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

/* =========================
   CORAÇÃO
========================= */
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${filled ? 'text-red-500' : 'text-white'}`}
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

/* =========================
   MODAL LATERAL
========================= */
function SponsoredSideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[6px]"
      />

      <div className="absolute right-0 top-[50px] bottom-0 w-[calc(100%-12px)] max-w-md">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-0 -top-9 bg-white/80 px-3 py-1.5 text-[13px] text-red-500 rounded-md"
        >
          Fechar
        </button>

        <div className="h-full w-full bg-zinc-100 rounded-tl-md" />
      </div>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
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
  const [open, setOpen] = useState(false);

  const [hideViewAll, setHideViewAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const tol = 4;
      setHideViewAll(el.scrollLeft + el.clientWidth >= el.scrollWidth - tol);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  function openModal(e?: React.SyntheticEvent) {
    e?.preventDefault();
    // @ts-ignore
    e?.stopPropagation?.();
    setOpen(true);
  }

  return (
    <section className={className}>
      <SponsoredSideModal open={open} onClose={() => setOpen(false)} />

      {/* Cabeçalho */}
      <div className="px-4 mb-2 flex justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          <div className="text-sm font-medium text-neutral-600">{categoryLabel}</div>
        </div>

        {!hideViewAll ? (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-emerald-700 relative -top-[3px]"
          >
            Ver todas ({categoryCount})
          </Link>
        ) : (
          <span className="opacity-0 select-none text-sm font-semibold">
            Ver todas
          </span>
        )}
      </div>

      {/* Carrossel */}
      <div ref={scrollRef} className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
        {list.map((item) => {
          const rating = item.rating ?? 4.9;
          const reviews = item.reviews ?? 812;
          const isFav = !!fav[item.id];

          const RatingBadge = (
            <div className="absolute left-2 top-2 rounded-md bg-black/25 px-2 py-1 backdrop-blur">
              <span className="text-[14px] font-semibold text-amber-400">★</span>{' '}
              <span className="text-[11px] font-semibold text-white">
                {rating.toFixed(1)} de {reviews}
              </span>
            </div>
          );

          const FavoriteButton = (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
              }}
              className="absolute right-2 top-2 bg-black/20 backdrop-blur rounded-full h-7 w-7 flex items-center justify-center"
            >
              <HeartIcon filled={isFav} />
            </button>
          );

          /* =========================
             2º CARROSSEL — PASSEIOS / TRANSFERS
             3 LINHAS MÁX, SEM RETICÊNCIAS
          ========================= */
          if (variant === 'tours') {
            return (
              <div key={item.id} className="min-w-[144px]">
                <Link href={item.href} onClick={openModal}>
                  <div className="relative aspect-[3/3.2] rounded-xl overflow-hidden">
                    <img
                      src={item.imageUrl ?? ''}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />

                    {RatingBadge}
                    {FavoriteButton}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* TEXTO — corte seco após 3 linhas */}
                    <div className="absolute bottom-2 left-2 right-2 overflow-hidden">
                      <div
                        className="text-sm font-medium text-white leading-snug"
                        style={{ maxHeight: '3.9em' }} // 3 linhas (~1.3em cada)
                      >
                        {item.title}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          }

          /* =========================
             1º CARROSSEL — GASTRONOMIA
          ========================= */
          return (
            <div key={item.id} className="min-w-[144px]">
              <Link href={item.href} onClick={openModal}>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={item.imageUrl ?? ''}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />

                  {RatingBadge}
                  {FavoriteButton}
                </div>

                <div className="mt-2">
                  <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                    {item.title}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
