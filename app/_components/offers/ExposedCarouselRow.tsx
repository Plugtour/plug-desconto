// app/_components/offers/ExposedCarouselRow.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SideDrawer from './SideDrawer';

// ✅ store global de favoritos
import { getFavorites, onFavoritesChange, toggleFavorite } from '../favorites/favoritesStore';

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
   HELPERS
========================= */
function safeHref(v: any) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : '/';
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

  void categoryCount; // (mantém prop disponível; hoje não usada)

  const [favIds, setFavIds] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hideViewRank, setHideViewRank] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <section className={className}>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

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
          const rating = item.rating ?? 4.8;
          const reviews = item.reviews ?? 812;
          const savings = item.savingsText ?? 'Economia de R$30 a R$90';

          const isFav = !!favIds[item.id];

          return (
            <div
              key={item.id}
              className="relative min-w-[228px] max-w-[228px] flex-shrink-0 rounded-lg overflow-hidden"
              onClick={() => setDrawerOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setDrawerOpen(true);
              }}
              role="button"
              tabIndex={0}
            >
              {/* FOTO */}
              <div className="relative h-[144px] bg-zinc-200">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
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
                    className={['h-9 w-9 transition', isFav ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-400'].join(' ')}
                  />
                </button>
              </div>

              {/* TEXTO */}
              <div className="bg-zinc-200 px-4 py-3">
                <div className="min-h-[36px] text-[13px] font-extrabold leading-[1.25] text-zinc-900 line-clamp-2">
                  {item.title}
                </div>

                <div className="mt-3">
                  <div className="text-[12px] font-normal text-zinc-600 leading-[1.2]">{categoryLabel}</div>
                  <div className="mt-[3px] text-[12px] font-medium text-zinc-900 leading-[1.2]">{savings}</div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <StarsRow rating={rating} />
                    <div className="text-[12px] text-zinc-500">
                      <span className="font-semibold text-zinc-700">{Number(rating).toFixed(1)}</span> de{' '}
                      <span className="font-semibold text-zinc-700">{reviews}</span>
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
