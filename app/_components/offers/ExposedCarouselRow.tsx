'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type ExposedCarouselItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  href: string;

  // ✅ economia
  savingsText?: string | null;

  // ✅ avaliação
  rating?: number | null;
  reviews?: number | null;

  // ✅ categoria do item (para exibir entre título e economia)
  categoryLabel?: string | null;
};

type Props = {
  title?: string;
  categoryLabel?: string;
  categoryCount: number;
  viewAllHref: string; // mantido por compatibilidade, mas não exibimos mais no topo
  items: ExposedCarouselItem[];
  className?: string;
  variant?: 'default' | 'tours';
};

/* =========================
   SCROLL LOCK GLOBAL (robusto)
========================= */
declare global {
  interface Window {
    __PLUG_SCROLL_LOCK_COUNT__?: number;
    __PLUG_SCROLL_LOCK_Y__?: number;
  }
}

function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const w = window as any;
    w.__PLUG_SCROLL_LOCK_COUNT__ = (w.__PLUG_SCROLL_LOCK_COUNT__ || 0) + 1;

    if (w.__PLUG_SCROLL_LOCK_COUNT__ === 1) {
      const y = window.scrollY || 0;
      w.__PLUG_SCROLL_LOCK_Y__ = y;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      w.__PLUG_SCROLL_LOCK_COUNT__ = Math.max(0, (w.__PLUG_SCROLL_LOCK_COUNT__ || 1) - 1);

      if (w.__PLUG_SCROLL_LOCK_COUNT__ === 0) {
        const y = Number(w.__PLUG_SCROLL_LOCK_Y__ || 0);

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        requestAnimationFrame(() => window.scrollTo(0, y));
        w.__PLUG_SCROLL_LOCK_Y__ = 0;
      }
    };
  }, [active]);
}

/* =========================
   ÍCONES
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

function RatingBadge({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="absolute left-2 top-2 rounded-md bg-black/25 px-2 py-1 backdrop-blur-[4px] ring-1 ring-white/15 pointer-events-none">
      <div className="leading-none">
        <span className="text-[12px] font-semibold text-amber-400">★</span>{' '}
        <span className="text-[11px] font-semibold text-white">
          {rating.toFixed(1)} de {reviews}
        </span>
      </div>
    </div>
  );
}

/* =========================
   MODAL (placeholder)
========================= */
function SideModal({
  open,
  closing,
  onClose,
}: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
}) {
  useBodyScrollLock(open);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999]"
      role="presentation"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className={[
          'absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px] touch-manipulation',
          closing ? 'backdrop-exit' : 'backdrop-enter',
        ].join(' ')}
      />

      <div className="absolute inset-0">
        <div
          className={[
            'absolute right-0 top-[50px] bottom-0',
            'w-[calc(100%-12px)] max-w-md',
            'touch-manipulation',
            closing ? 'side-exit' : 'side-enter',
          ].join(' ')}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={[
              'absolute left-0 -top-9',
              'touch-manipulation rounded-md',
              'bg-white/80 ring-1 ring-black/10',
              'px-3 py-1.5 text-[13px] font-normal',
              'text-red-500 hover:text-red-600 hover:bg-white',
            ].join(' ')}
          >
            Fechar
          </button>

          <div className="h-full w-full rounded-tl-md bg-zinc-100 ring-1 ring-black/10" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes backdropEnter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes backdropExit {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .backdrop-enter {
          animation: backdropEnter 240ms ease-out both;
        }
        .backdrop-exit {
          animation: backdropExit 240ms ease-in both;
        }

        @keyframes sideEnter {
          from {
            transform: translateX(28px);
            opacity: 0.98;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes sideExit {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(28px);
            opacity: 0.98;
          }
        }
        .side-enter {
          animation: sideEnter 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        .side-exit {
          animation: sideExit 240ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

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
    </div>
  );
}

/* =========================
   CARD FINAL: RANK COMPLETO (1..10)
========================= */
function RankFullCard({ items }: { items: ExposedCarouselItem[] }) {
  const ranked = items.slice(0, 10);

  return (
    <div className="min-w-[144px] max-w-[144px] flex-shrink-0 rounded-xl bg-zinc-200/70 ring-1 ring-black/5 p-2">
      <div className="rounded-lg bg-white ring-1 ring-black/5 p-2">
        <div className="text-[12px] font-semibold text-neutral-900">Ranking completo</div>

        <div className="mt-2 space-y-1">
          {ranked.map((it, idx) => (
            <div key={it.id} className="flex items-start gap-2">
              <div className="w-4 shrink-0 text-[11px] font-semibold text-neutral-600">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-neutral-800 line-clamp-1">
                  {it.title}
                </div>
                <div className="text-[10px] font-medium text-neutral-600">
                  ★ {(it.rating ?? 0).toFixed(1)} • {it.reviews ?? 0}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-[10px] font-medium text-neutral-500">
          Top 10 por nota + volume.
        </div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function ExposedCarouselRow({
  title = 'Top 10 melhores avaliados',
  categoryLabel = 'Melhores avaliados',
  categoryCount,
  viewAllHref,
  items,
  className,
  variant = 'default',
}: Props) {
  const list = useMemo(() => items ?? [], [items]);
  if (!list.length) return null;

  const [fav, setFav] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);

  function openModal(e?: React.SyntheticEvent) {
    if (e) {
      e.preventDefault();
      // @ts-ignore
      e.stopPropagation?.();
    }
    setModalOpen(true);
    setModalClosing(false);
  }

  function closeModal() {
    setModalClosing(true);
    window.setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
    }, 240);
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className={className}>
      <SideModal open={modalOpen} closing={modalClosing} onClose={closeModal} />

      {/* ✅ Cabeçalho (SEM "Ver todos (10)") */}
      <div className="px-4 mb-2">
        <div className="leading-tight">
          <h2 className="text-base font-semibold text-neutral-900 leading-tight">{title}</h2>
          <div className="text-sm font-medium text-neutral-600 leading-tight">{categoryLabel}</div>
        </div>
      </div>

      {/* Carrossel */}
      <div className="relative">
        <div
          ref={scrollRef}
          className={[
            'no-scrollbar flex gap-3 px-4 overflow-x-auto',
            'scroll-smooth overscroll-x-contain',
            'touch-auto',
          ].join(' ')}
          style={{ touchAction: 'pan-x pan-y' }}
        >
          {variant === 'default' &&
            list.map((item) => {
              const rating = item.rating ?? 4.9;
              const reviews = item.reviews ?? 812;
              const isFav = !!fav[item.id];
              const savings = item.savingsText ?? 'Economia de R$50 a R$190';
              const cat = item.categoryLabel ?? 'Geral';

              return (
                <div
                  key={item.id}
                  className={[
                    // ✅ 1) fundo cinza claro apenas no card
                    'relative min-w-[144px] max-w-[144px] flex-shrink-0',
                    'rounded-xl bg-zinc-200/70 ring-1 ring-black/5',
                    // para “mostrar o card inteiro”
                    'p-2',
                  ].join(' ')}
                >
                  <Link
                    href={item.href}
                    className="block active:opacity-90"
                    onClick={(e) => openModal(e)}
                  >
                    {/* imagem colada topo/laterais do card */}
                    <div className="relative -m-2 mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-200">
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

                      <RatingBadge rating={rating} reviews={reviews} />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                        {item.title}
                      </div>

                      {/* ✅ 4) entre economia e título exibir categoria */}
                      <div className="mt-1 text-[12px] font-medium text-neutral-700">
                        {cat}
                      </div>

                      <div className="mt-1 text-[12px] font-medium text-neutral-700">
                        {savings}
                      </div>

                      <button
                        type="button"
                        className="mt-2 text-[14px] font-semibold text-green-700"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setModalOpen(true);
                          setModalClosing(false);
                        }}
                      >
                        Ver mais
                      </button>
                    </div>
                  </Link>

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

          {/* ✅ 3) último card: rank completo */}
          <RankFullCard items={list} />
        </div>
      </div>
    </section>
  );
}
