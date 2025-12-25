'use client';

import React, { useMemo, useState } from 'react';
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
};

/* =========================
   CORAÇÃO (path aprovado)
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
   MODAL (estrutura igual patrocinado)
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
        className="absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px] touch-manipulation"
      />

      <div className="absolute inset-0">
        <div className="absolute right-0 top-[50px] bottom-0 w-[calc(100%-12px)] max-w-md touch-manipulation">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-0 -top-9 touch-manipulation rounded-md bg-white/80 ring-1 ring-black/10 px-3 py-1.5 text-[13px] font-normal text-red-500 hover:text-red-600 hover:bg-white"
          >
            Fechar
          </button>

          <div className="h-full w-full rounded-tr-none rounded-br-none rounded-bl-none rounded-tl-md bg-zinc-100 ring-1 ring-black/10">
            {/* conteúdo futuro */}
          </div>
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
}: Props) {
  const list = useMemo(() => items ?? [], [items]);
  if (!list.length) return null;

  const [fav, setFav] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);

  return (
    <section className={className}>
      <SponsoredSideModal open={open} onClose={() => setOpen(false)} />

      {/* Cabeçalho */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <div className="leading-tight">
          <h2 className="text-base font-semibold text-neutral-900 leading-tight">
            {title}
          </h2>
          <div className="text-sm font-medium text-neutral-600 leading-tight">
            {categoryLabel}
          </div>
        </div>

        <Link
          href={viewAllHref}
          className="relative -top-[3px] text-sm font-semibold text-emerald-700 transition-colors duration-200 hover:text-emerald-800 active:opacity-80"
        >
          Ver todas ({categoryCount})
        </Link>
      </div>

      {/* Carrossel */}
      <div className="relative">
        <div className="no-scrollbar flex gap-3 px-4 overflow-x-auto scroll-smooth overscroll-x-contain touch-pan-x">
          {list.map((item) => {
            const rating = item.rating ?? 4.9;
            const reviews = item.reviews ?? 812;
            const isFav = !!fav[item.id];
            const savings = item.savingsText ?? 'Economia de R$50 a R$190';

            return (
              <div
                key={item.id}
                className="relative min-w-[144px] max-w-[144px] flex-shrink-0"
              >
                <Link
                  href={item.href}
                  className="block active:opacity-90"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
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

                    {/* ⭐ TEXTO NA FOTO (estrela amarela + texto 1px menor) */}
                    <div className="absolute left-2 top-2 rounded-md bg-black/25 px-2 py-1 backdrop-blur-[4px] ring-1 ring-white/15 pointer-events-none">
                      <div className="leading-none">
                        <span className="text-[12px] font-semibold text-amber-400">★</span>{' '}
                        <span className="text-[11px] font-semibold text-white">
                          {rating.toFixed(1)} de {reviews}
                        </span>
                      </div>
                    </div>
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(true);
                      }}
                    >
                      Ver mais
                    </button>
                  </div>
                </Link>

                {/* ❤️ Coração */}
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
                  <HeartIcon filled={isFav} />
                </button>
              </div>
            );
          })}

          {/* Último card: ver todos */}
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

            <div className="mt-2">
              <div className="text-sm font-semibold text-emerald-700">
                Ver todas ({categoryCount})
              </div>
              <div className="mt-1 text-[12px] text-neutral-500">Abrir lista completa</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
