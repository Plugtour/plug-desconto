'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
  viewAllHref?: string;
};

/* =========================
   ESTRELAS (preenchimento proporcional)
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
    <div className="flex items-center gap-[1px]">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return <Star key={i} fillPct={fill} />;
      })}
    </div>
  );
}

/* =========================
   META (Linha 2)
========================= */

function buildMeta(item: any) {
  const metaText = (item?.metaText ?? '').toString().trim();
  if (metaText) return metaText;

  const parts: string[] = [];
  const city = (item?.city ?? item?.cidade ?? '').toString().trim();
  const category = (item?.category ?? item?.categoria ?? '').toString().trim();
  const kind = (item?.kind ?? item?.tipo ?? '').toString().trim();

  if (city) parts.push(city);
  if (category) parts.push(category);
  if (kind) parts.push(kind);

  if (parts.length) return parts.join(' | ');

  const subtitle = (item?.subtitle ?? '').toString().trim();
  if (subtitle) return subtitle;

  return '';
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
  const strokeWidth = filled ? 0 : 2.2;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
    >
      <path
        d="M12 21s-7.2-4.6-9.5-8.9C.6 9.1 2.3 6.2 5.6 5.8c1.9-.2 3.7.7 4.7 2.2 1-1.5 2.8-2.4 4.7-2.2 3.3.4 5 3.3 3.1 6.3C19.2 16.4 12 21 12 21z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SponsoredOffersRow({
  items,
  className,
  title = 'Patrocinados',
  viewAllHref,
}: Props) {
  const shown = useMemo(() => items.slice(0, 5), [items]);
  const [favIds, setFavIds] = useState<Record<string, boolean>>({});

  function toggleFav(id: string) {
    setFavIds((p) => ({ ...p, [id]: !p[id] }));
  }

  if (!shown.length) return null;

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="text-[14px] font-semibold text-zinc-900">{title}</h2>

        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-[13px] font-semibold text-zinc-900 underline underline-offset-4"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      <div className="px-3">
        {shown.map((item, idx) => {
          const anyItem: any = item;
          const isFav = !!favIds[item.id];

          const meta = buildMeta(anyItem);
          const range =
            (anyItem?.economyText ?? item.priceText ?? '').toString().trim();
          const economyLine = range ? `Economia de ${range}` : '';

          const rating = Number(anyItem?.rating ?? 4.8);
          const reviews = Number(anyItem?.reviews ?? 275);

          return (
            <div key={item.id} className="relative">
              <Link href={item.href} className="block py-3 active:scale-[0.995]">
                <div className="flex gap-3">
                  {/* FOTO */}
                  <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-zinc-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* TÍTULO */}
                    <div className="pr-14 text-[13px] font-semibold leading-snug text-zinc-900 line-clamp-2">
                      {item.title}
                    </div>

                    {/* LINHA 2 */}
                    <div className="mt-0 text-[11px] text-zinc-500 line-clamp-1">
                      {meta || ' '}
                    </div>

                    {/* LINHA 3 */}
                    {economyLine ? (
                      <div className="-mt-0.5 text-[12px] font-semibold text-zinc-900">
                        {economyLine}
                      </div>
                    ) : null}

                    {/* AVALIAÇÃO + VER MAIS */}
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

                      {/* VER MAIS (mantido) */}
                      <span className="text-[14px] font-semibold text-green-600">
                        Ver mais
                      </span>
                    </div>
                  </div>
                </div>

                {/* CORAÇÃO */}
                <button
                  type="button"
                  aria-label="Favoritar"
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
