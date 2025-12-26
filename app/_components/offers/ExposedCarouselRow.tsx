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
      className={`h-6 w-6 transition ${filled ? 'text-red-500' : 'text-white'}`}
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
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px]"
      />

      <div className="absolute inset-0">
        <div className="absolute right-0 top-[50px] bottom-0 w-[calc(100%-12px)] max-w-md">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-0 -top-9 rounded-md bg-white/80 ring-1 ring-black/10 px-3 py-1.5 text-[13px] text-red-500 hover:text-red-600"
          >
            Fechar
          </button>

          <div className="h-full w-full rounded-tl-md bg-zinc-100 ring-1 ring-black/10" />
        </div>
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
    function onScroll() {
      const el = scrollRef.current;
      if (!el) return;
      const tol = 4;
      setHideViewAll(el.scrollLeft + el.clientWidth >= el.scrollWidth - tol);
    }

    const el = scrollRef.current;
    if (!el) return;

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
      <div className="px-4 mb-2 flex items-center justify-between">
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
          <span className="text-sm font-semibold text-emerald-700 opacity-0 select-none relative -top-[3px]">
            Ver todas ({categoryCount})
          </span>
        )}
      </div>

      {/* Carrossel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 px-4 overflow-x-auto scroll-smooth overscroll-x-contain"
        >
          {list.map((item) => {
            const rating = item.rating ?? 4.8;
            const isFav = !!fav[item.id];

            /* =========================
               VARIANTE — PASSEIOS / TRANSFERS
               - texto dentro da imagem
               - MÁX 2 linhas + reticências
            ========================= */
            if (variant === 'tours') {
              return (
                <div
                  key={item.id}
                  className="relative min-w-[144px] max-w-[144px] flex-shrink-0"
                >
                  <Link href={item.href} onClick={openModal}>
                    <div className="relative aspect-[3/3.2] overflow-hidden rounded-xl bg-neutral-200">
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

                      {/* Nota */}
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white backdrop-blur">
                        <span className="text-amber-400">★</span> {rating.toFixed(1)}
                      </div>

                      {/* Favorito */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
                        }}
                        className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
                      >
                        <HeartIcon filled={isFav} />
                      </button>

                      {/* Gradiente */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* TEXTO — máx 2 linhas com reticências */}
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <div className="text-sm font-semibold leading-snug text-white line-clamp-2">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            }

            /* =========================
               VARIANTE PADRÃO — GASTRONOMIA
            ========================= */
            return (
              <div
                key={item.id}
                className="relative min-w-[144px] max-w-[144px] flex-shrink-0"
              >
                <Link href={item.href} onClick={openModal}>
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

                    <div className="absolute left-2 top-2 rounded-md bg-black/25 px-2 py-1 backdrop-blur text-xs text-white">
                      ★ {(item.rating ?? 4.9).toFixed(1)} de {item.reviews ?? 812}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-neutral-700">
                      {item.savingsText ?? 'Economia exclusiva'}
                    </div>
                    <span className="mt-2 inline-block text-sm font-semibold text-green-600">
                      Ver mais
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
                  }}
                  className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/20 backdrop-blur flex items-center justify-center"
                >
                  <HeartIcon filled={isFav} />
                </button>
              </div>
            );
          })}

          {/* Card final */}
          <Link
            href={viewAllHref}
            className="min-w-[144px] max-w-[144px] flex-shrink-0"
          >
            <div className="aspect-square rounded-lg border border-dashed border-neutral-300 bg-white flex items-center justify-center text-center text-sm font-semibold text-neutral-900">
              Ver todos<br />({categoryCount})
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
