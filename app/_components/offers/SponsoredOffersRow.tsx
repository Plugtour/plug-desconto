'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
};

/* =========================
   ESTRELAS (preenchimento proporcional, coladas)
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
        const fill =
          r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
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
   TAGS (LINHA 2)
   Sempre: Cidade | Categoria | Tipo
========================= */

function buildTags(item: SponsoredOffer) {
  if (Array.isArray(item.tags) && item.tags.length === 3) {
    return item.tags.join(' | ');
  }
  return '';
}

/* =========================
   CORAÇÃO (simétrico, gordinho)
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
      <path d="M12 21c-.35 0-7.1-4.3-9.4-8.4C.7 9.5 2.4 6.6 5.6 6.3c1.8-.2 3.5.7 4.4 2.1 1-1.4 2.7-2.3 4.4-2.1 3.2.3 4.9 3.2 3 6.3C19 16.7 12.4 21 12 21z" />
    </svg>
  );
}

export default function SponsoredOffersRow({
  items,
  className,
  title = 'Patrocinado',
}: Props) {
  const shown = useMemo(() => items.slice(0, 5), [items]);
  const [favIds, setFavIds] = useState<Record<string, boolean>>({});

  function toggleFav(id: string) {
    setFavIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!shown.length) return null;

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <div className="mb-1 px-4 text-[12px] font-medium text-zinc-500">
        {title}
      </div>

      <div className="px-3">
        {shown.map((item, idx) => {
          const isFav = !!favIds[item.id];
          const tagsLine = buildTags(item);
          const rating = item.rating ?? 4.8;
          const reviews = item.reviews ?? 0;

          return (
            <div key={item.id} className="relative">
              <Link href={item.href} className="block py-3">
                <div className="flex gap-3">
                  <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-zinc-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="pr-14 text-[11px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                      {item.title}
                    </div>

                    <div className="mt-[4px]">
                      <div className="text-[11px] text-zinc-500 line-clamp-1">
                        {tagsLine}
                      </div>

                      {item.priceText ? (
                        <div className="-mt-[2px] text-[11px] font-medium text-zinc-900">
                          Economia de {item.priceText}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex items-end justify-between">
                      <div>
                        <StarsRow rating={rating} />
                        <div className="-mt-0.5 text-[11px] text-zinc-500">
                          <span className="font-semibold text-zinc-700">
                            {rating.toFixed(1)}
                          </span>{' '}
                          de{' '}
                          <span className="font-semibold text-zinc-700">
                            {reviews}
                          </span>{' '}
                          avaliações
                        </div>
                      </div>

                      <span className="text-[14px] font-semibold text-green-600">
                        Ver mais
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFav(item.id);
                  }}
                  className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center"
                >
                  <HeartIcon
                    filled={isFav}
                    className={[
                      'h-9 w-9 transition',
                      isFav
                        ? 'text-red-500'
                        : 'text-zinc-300 hover:text-zinc-400',
                    ].join(' ')}
                  />
                </button>
              </Link>

              {idx < shown.length - 1 ? (
                <div className="mx-2 border-b border-dotted border-zinc-300" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
