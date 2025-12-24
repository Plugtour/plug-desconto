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
    <svg viewBox="0 0 24 24" className="h-4 w-4">
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
        const fill =
          r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return <Star key={i} fillPct={fill} />;
      })}
    </div>
  );
}

function buildMeta(item: any) {
  const parts: string[] = [];
  if (item?.city) parts.push(item.city);
  if (item?.category) parts.push(item.category);
  if (item?.kind) parts.push(item.kind);
  return parts.join(' | ');
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
        <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>

        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-[13px] font-semibold text-zinc-900 underline underline-offset-4"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      {/* LISTAGEM – sem fundo branco */}
      <div className="px-3">
        {shown.map((item, idx) => {
          const anyItem: any = item;
          const isFav = !!favIds[item.id];

          const meta = buildMeta(anyItem);
          const economy = item.priceText
            ? `Economia de ${item.priceText}`
            : '';

          const rating = Number(anyItem?.rating ?? 4.8);
          const reviews = Number(anyItem?.reviews ?? 275);

          return (
            <div key={item.id} className="relative">
              <Link
                href={item.href}
                className="block py-3 active:scale-[0.995]"
              >
                <div className="flex gap-3">
                  {/* FOTO – +25%, canto md */}
                  <div className="h-20 w-20 flex-none overflow-hidden rounded-md bg-zinc-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* CONTEÚDO */}
                  <div className="min-w-0 flex-1">
                    {/* TÍTULO */}
                    <div className="pr-12 text-[14px] font-semibold leading-snug text-zinc-900 line-clamp-2">
                      {item.title}
                    </div>

                    {/* META (linha 2) */}
                    {meta ? (
                      <div className="-mt-0.5 text-[12px] text-zinc-500 line-clamp-1">
                        {meta}
                      </div>
                    ) : null}

                    {/* ECONOMIA (linha 3 – mais próxima da 2) */}
                    {economy ? (
                      <div className="mt-0.5 text-[13px] font-semibold text-zinc-900">
                        {economy}
                      </div>
                    ) : null}

                    {/* AVALIAÇÃO + VER MAIS */}
                    <div className="mt-1.5 flex items-end justify-between">
                      <div>
                        {/* estrelas bem juntas */}
                        <StarsRow rating={rating} />

                        {/* nota + avaliações (ambos mesmo peso) */}
                        <div className="-mt-0.5 text-[12px] text-zinc-500">
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

                      <span className="text-[13px] font-semibold text-green-600">
                        Ver mais
                      </span>
                    </div>
                  </div>
                </div>

                {/* CORAÇÃO – maior, gordinho, canto superior direito */}
                <button
                  type="button"
                  aria-label="Favoritar"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFav(item.id);
                  }}
                  className="absolute right-2 top-2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={[
                      'h-7 w-7 transition',
                      isFav
                        ? 'text-red-500'
                        : 'text-zinc-300 hover:text-zinc-400',
                    ].join(' ')}
                    fill="currentColor"
                  >
                    <path d="M12 21s-7.2-4.6-9.5-8.9C.6 9.1 2.3 6.2 5.6 5.8c1.9-.2 3.7.7 4.7 2.2 1-1.5 2.8-2.4 4.7-2.2 3.3.4 5 3.3 3.1 6.3C19.2 16.4 12 21 12 21z" />
                  </svg>
                </button>
              </Link>

              {/* DIVISÓRIA */}
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
