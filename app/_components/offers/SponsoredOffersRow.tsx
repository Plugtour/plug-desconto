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
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
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
    // ⭐ estrelas literalmente encostadas
    <div className="flex items-center gap-0">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill =
          r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return <Star key={i} fillPct={fill} />;
      })}
    </div>
  );
}

/* =========================
   META (Linha 2)
========================= */

function buildMeta(item: any) {
  const parts: string[] = [];
  if (item?.city) parts.push(item.city);
  if (item?.category) parts.push(item.category);
  if (item?.kind) parts.push(item.kind);
  return parts.join(' | ');
}

/* =========================
   CORAÇÃO (novo, correto)
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
    >
      <path d="M12 21c-.35 0-7.1-4.3-9.4-8.4C.7 9.5 2.4 6.6 5.6 6.3c1.8-.2 3.5.7 4.4 2.1 0 0 .9-1.3 1.3-1.6.8-.6 2.2-1 3.5-.8 3.2.3 4.9 3.2 3 6.3C19 16.7 12.4 21 12 21z" />
    </svg>
  );
}

export default function SponsoredOffersRow({
  items,
  className,
  title = 'Patrocinados',
}: Props) {
  const shown = useMemo(() => items.slice(0, 5), [items]);
  const [favIds, setFavIds] = useState<Record<string, boolean>>({});

  function toggleFav(id: string) {
    setFavIds((p) => ({ ...p, [id]: !p[id] }));
  }

  if (!shown.length) return null;

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <div className="mb-2 px-4 text-[14px] font-semibold text-zinc-900">
        {title}
      </div>

      <div className="px-3">
        {shown.map((item, idx) => {
          const isFav = !!favIds[item.id];

          const rating = 4.8;
          const reviews = 275;

          return (
            <div key={item.id} className="relative">
              <Link href={item.href} className="block py-3">
                <div className="flex gap-3">
                  {/* FOTO */}
                  <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-zinc-200" />

                  <div className="min-w-0 flex-1">
                    {/* 🔴 LINHA 1 — TÍTULO FICTÍCIO EXTENSO */}
                    <div className="pr-14 text-[11px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                      Churrascaria Fogo de Chão Gramado com Rodízio Premium Completo,
                      Buffet Internacional e Sobremesas Ilimitadas Inclusas
                    </div>

                    {/* LINHA 2 — descida em relação à linha 1 */}
                    <div className="mt-[2px] text-[11px] text-zinc-500 line-clamp-1">
                      Gramado | Gastronomia | Italiana
                    </div>

                    {/* LINHA 3 — próxima da linha 2 */}
                    <div className="-mt-[1px] text-[11px] font-medium text-zinc-900">
                      Economia de R$80 a R$120
                    </div>

                    {/* ESTRELAS + NOTAS */}
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
