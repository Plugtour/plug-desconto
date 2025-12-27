// app/_components/offers/ExposedCarouselRow.tsx
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
};

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
function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
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

/* =========================
   TROFÉU
========================= */
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 5h10v3a5 5 0 0 1-10 0V5z" />
      <path d="M7 6H5a2 2 0 0 0 2 2" />
      <path d="M17 6h2a2 2 0 0 1-2 2" />
      <path d="M10 14h4v3h-4z" />
      <path d="M9 20h6" />
    </svg>
  );
}

/* =========================
   MODAL (mesmo padrão do patrocinado — sem conteúdo)
========================= */
function CarouselDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const TOP_GAP_PX = 50;
  const SIDE_GAP_PX = 24;
  const BUTTON_ABOVE_PX = 36;

  return (
    <div
      className={[
        'fixed inset-0 z-[999]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={[
          'absolute inset-0',
          'bg-black/25 backdrop-blur-[6px]',
          'transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Botão Fechar */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={[
          'absolute z-[1001]',
          'touch-manipulation',
          'rounded-md',
          'bg-white/80',
          'ring-1 ring-black/10',
          'px-3 py-1.5',
          'text-[13px] font-normal text-red-500',
          'hover:bg-white hover:text-red-600',
          'transition-all duration-250 ease-out',
          open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full',
        ].join(' ')}
        style={{
          left: SIDE_GAP_PX,
          top: TOP_GAP_PX - BUTTON_ABOVE_PX,
        }}
      >
        Fechar
      </button>

      {/* Drawer */}
      <div
        className={[
          'absolute right-0',
          'bg-zinc-100 shadow-2xl',
          'rounded-md',
          'transition-transform duration-250 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          top: TOP_GAP_PX,
          height: `calc(100% - ${TOP_GAP_PX}px)`,
          width: `calc(100% - ${SIDE_GAP_PX}px)`,
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* sem conteúdo por enquanto */}
        <div className="h-full w-full" />
      </div>
    </div>
  );
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

  const [fav, setFav] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ ocultar "Ver Rank" do topo quando o último card (Ver Rank Completo) ficar visível (mesmo parcial)
  const [hideViewRank, setHideViewRank] = useState(false);

  // modal
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const children = scroller.children;
      if (!children.length) return;

      const lastCard = children[children.length - 1] as HTMLElement;

      const scrollerRect = scroller.getBoundingClientRect();
      const lastRect = lastCard.getBoundingClientRect();

      const partiallyVisible =
        lastRect.left < scrollerRect.right && lastRect.right > scrollerRect.left;

      setHideViewRank(partiallyVisible);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      scroller.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section className={className}>
      <CarouselDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Cabeçalho */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <div className="leading-[1.1]">
          <h2 className="text-base font-semibold text-zinc-900 leading-[1.15]">{title}</h2>
          <div className="-mt-[2px] text-sm font-medium text-zinc-600">{categoryLabel}</div>
        </div>

        {!hideViewRank ? (
          <Link href={viewAllHref} className="text-sm font-semibold text-emerald-700">
            Ver Rank
          </Link>
        ) : (
          <span className="text-sm font-semibold text-emerald-700 opacity-0 select-none">
            Ver Rank
          </span>
        )}
      </div>

      {/* Carrossel */}
      <div ref={scrollRef} className="no-scrollbar flex gap-3 px-4 overflow-x-auto scroll-smooth">
        {list.map((item, idx) => {
          const isFav = !!fav[item.id];
          const rating = item.rating ?? 4.8;
          const reviews = item.reviews ?? 275;
          const savings = item.savingsText ?? 'Economia de R$30 a R$90';

          return (
            <div
              key={item.id}
              className="relative min-w-[165px] max-w-[165px] flex-shrink-0 rounded-lg overflow-hidden"
              onClick={() => setDrawerOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(true);
              }}
            >
              {/* FOTO */}
              <div className="relative h-[105px] bg-zinc-200">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-300" />
                )}

                {/* RANK */}
                <div className="absolute left-2 top-2 z-[6] inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur px-2 py-[3px] ring-1 ring-white/15">
                  <TrophyIcon className="h-3.5 w-3.5 -mt-[1px] text-yellow-400" />
                  <span className="text-[11px] font-semibold text-white leading-none">
                    Top {idx + 1}
                  </span>
                </div>

                {/* FAVORITO */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFav((p) => ({ ...p, [item.id]: !p[item.id] }));
                  }}
                  className="absolute right-2 top-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur ring-1 ring-white/15"
                  aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <HeartIcon
                    filled={isFav}
                    className={isFav ? 'h-5 w-5 text-red-500' : 'h-5 w-5 text-white'}
                  />
                </button>
              </div>

              {/* TEXTO — fundo cinza só aqui */}
              <div className="bg-zinc-200 px-2 py-2">
                {/* ✅ altura fixa da área de título (2 linhas), mesmo quando não quebra */}
                <div className="min-h-[26px] text-[11px] font-extrabold leading-[1.15] text-zinc-900 line-clamp-2">
                  {item.title}
                </div>

                <div className="mt-[6px]">
                  <div className="text-[11px] text-zinc-500">{categoryLabel}</div>
                  <div className="-mt-[2px] text-[11px] font-medium text-zinc-900">{savings}</div>
                </div>

                <div className="mt-1 flex items-end justify-between">
                  <div>
                    <StarsRow rating={rating} />
                    <div className="text-[11px] text-zinc-500">
                      <span className="font-semibold text-zinc-700">{rating.toFixed(1)}</span> de{' '}
                      <span className="font-semibold text-zinc-700">{reviews}</span>
                    </div>
                  </div>

                  <span className="text-[13px] font-semibold text-green-600">Ver mais</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* CARD FINAL — aparece parcialmente (leve corte para a direita) */}
        <Link
          href={viewAllHref}
          className="min-w-[165px] max-w-[165px] flex-shrink-0 rounded-lg overflow-hidden translate-x-4"
        >
          <div className="bg-zinc-200 h-full grid place-items-center px-3 text-center">
            <div className="text-sm font-semibold text-zinc-900 leading-tight">
              <div>Ver Rank</div>
              <div>Completo</div>
            </div>
          </div>
        </Link>
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
