'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
};

/* =========================
   SETA DUPLA (mesma do menu)
========================= */
function DoubleChevronOpen({
  dir,
  className,
}: {
  dir: 'up' | 'down';
  className?: string;
}) {
  const rotate = dir === 'down' ? 'rotate(90 14 14)' : 'rotate(-90 14 14)';

  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="none">
      <g
        transform={rotate}
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 7.5 14.5 14 9 20.5" />
        <path d="M15 7.5 20.5 14 15 20.5" />
      </g>
    </svg>
  );
}

/* =========================
   ESTRELAS (coladas, preenchimento proporcional)
========================= */
function Star({ fillPct, size = 14 }: { fillPct: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, fillPct)) * 100;

  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size} height={size} className="block" fill="none">
        <path
          d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
          stroke="currentColor"
          strokeWidth="2"
          className="text-zinc-300"
          strokeLinejoin="round"
        />
      </svg>

      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <svg viewBox="0 0 24 24" width={size} height={size} className="block">
          <path
            d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
            fill="currentColor"
            className="text-amber-400"
          />
        </svg>
      </span>
    </span>
  );
}

function StarsRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  const fills = Array.from({ length: 5 }).map((_, i) => {
    const v = r - i;
    return Math.max(0, Math.min(1, v));
  });

  return (
    <span className="inline-flex items-center leading-none">
      {fills.map((f, i) => (
        <span key={i} className="inline-flex" style={{ marginLeft: i === 0 ? 0 : -1 }}>
          <Star fillPct={f} />
        </span>
      ))}
    </span>
  );
}

/* =========================
   CORAÇÃO (path aprovado)
========================= */
function HeartIcon({ active, className }: { active: boolean; className?: string }) {
  const path =
    'M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z';

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d={path}
        fill={active ? 'currentColor' : 'none'}
        stroke={active ? 'none' : 'currentColor'}
        strokeWidth={active ? 0 : 2}
      />
    </svg>
  );
}

/* =========================
   HELPERS
========================= */
function buildTagsLine(item: SponsoredOffer) {
  const tags = item.tags;
  return `${tags[0]} | ${tags[1]} | ${tags[2]}`;
}

function buildEconomiaText(item: SponsoredOffer) {
  if (!item.priceText) return '';
  if (item.priceText.toLowerCase().includes('economia')) return item.priceText;
  return item.priceText;
}

/* =========================
   COMPONENTE
========================= */
export default function SponsoredOffersRow({
  items,
  className,
  title = 'Patrocinado',
}: Props) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const [favIds, setFavIds] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  const CARD_ROW_HEIGHT = 108;

  // 👇 5px a mais para mostrar um pouco mais do 2º card
  const COLLAPSED_HEIGHT = Math.round(CARD_ROW_HEIGHT * 1.5) + 5;

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(COLLAPSED_HEIGHT);

  function toggleFav(id: string) {
    setFavIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function animateTo(nextExpanded: boolean) {
    const el = contentRef.current;
    if (!el) {
      setExpanded(nextExpanded);
      setMaxH(nextExpanded ? 9999 : COLLAPSED_HEIGHT);
      return;
    }

    const current = maxH;
    const targetExpanded = Math.max(el.scrollHeight, COLLAPSED_HEIGHT);
    const target = nextExpanded ? targetExpanded : COLLAPSED_HEIGHT;

    setMaxH(current);
    requestAnimationFrame(() => {
      setExpanded(nextExpanded);
      setMaxH(target);
    });
  }

  function toggleExpanded() {
    animateTo(!expanded);
  }

  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    dragging.current = true;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current || startY.current == null) return;

    const dy = e.clientY - startY.current;
    startY.current = null;
    dragging.current = false;

    const THRESH = 18;
    if (dy > THRESH && !expanded) animateTo(true);
    if (dy < -THRESH && expanded) animateTo(false);
  }

  function onPointerCancel() {
    startY.current = null;
    dragging.current = false;
  }

  return (
    <section className={['w-full pb-8', className || ''].join(' ')}>
      <div className="px-4">
        <div className="text-[11px] font-normal text-zinc-500">{title}</div>
      </div>

      <div className="relative px-4 mt-2">
        <div
          className="relative overflow-hidden"
          style={{
            maxHeight: maxH,
            transition: 'max-height 320ms ease-out',
            willChange: 'max-height',
          }}
        >
          <div ref={contentRef} className="divide-y divide-zinc-300/70">
            {list.map((item, idx) => {
              const isFav = !!favIds[item.id];
              const tagsLine = buildTagsLine(item);
              const economia = buildEconomiaText(item);
              const rating = item.rating ?? 4.8;
              const reviews = item.reviews ?? 275;

              // 👇 quando FECHADO: a partir do 2º item (idx>=1) não pode interagir
              const disableWhenCollapsed = !expanded && idx >= 1;

              return (
                <div key={item.id} className="relative py-3">
                  {/* Coração */}
                  <button
                    type="button"
                    disabled={disableWhenCollapsed}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFav(item.id);
                    }}
                    aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    className={[
                      'absolute right-0 top-3 z-[2] p-1',
                      disableWhenCollapsed ? 'pointer-events-none opacity-0' : '',
                      isFav
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-zinc-300 hover:text-zinc-400',
                    ].join(' ')}
                    tabIndex={disableWhenCollapsed ? -1 : 0}
                  >
                    <HeartIcon active={isFav} className="h-7 w-7" />
                  </button>

                  {/* Card clicável */}
                  <Link
                    href={item.href}
                    className={[
                      'block pr-10',
                      disableWhenCollapsed ? 'pointer-events-none' : '',
                    ].join(' ')}
                    aria-hidden={disableWhenCollapsed}
                    tabIndex={disableWhenCollapsed ? -1 : 0}
                  >
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
                        <div className="text-[11px] font-extrabold text-zinc-900 leading-[1.15] line-clamp-2">
                          {item.title}
                        </div>

                        <div className="mt-[1px] text-[11px] text-zinc-500 leading-[1.1]">
                          {tagsLine}
                        </div>

                        {economia ? (
                          <div className="mt-[2px] text-[11px] font-semibold text-zinc-800 leading-[1.1]">
                            {economia}
                          </div>
                        ) : null}

                        <div className="mt-[6px] flex items-end justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <StarsRow rating={rating} />
                            </div>

                            <div className="mt-[2px] text-[11px] text-zinc-500 leading-[1.1]">
                              <span className="font-semibold text-zinc-700">
                                {rating.toFixed(1)}
                              </span>{' '}
                              e{' '}
                              <span className="font-semibold text-zinc-700">{reviews}</span>{' '}
                              avaliações
                            </div>
                          </div>

                          <div className="text-[14px] font-semibold text-emerald-700">
                            Ver mais
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Área encoberta: degradê + CLIQUE ABRE */}
          {!expanded && (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-zinc-100" />

              <button
                type="button"
                aria-label="Ver mais patrocinados"
                className="absolute inset-x-0 bottom-0 h-16 pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  animateTo(true);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleExpanded}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className="mt-3 w-full touch-manipulation select-none flex flex-col items-center justify-center gap-[5px]"
          style={{ touchAction: 'pan-y' }}
          aria-label={expanded ? 'Ver menos patrocinados' : 'Ver mais patrocinados'}
        >
          <div className="text-[15px] font-semibold text-emerald-700 hover:text-emerald-800">
            {expanded ? 'Ver menos' : 'Ver mais'}
          </div>

          <div className="text-zinc-400">
            <DoubleChevronOpen dir={expanded ? 'up' : 'down'} className="h-10 w-10" />
          </div>
        </button>
      </div>
    </section>
  );
}
