// app/_components/offers/SponsoredOffersList.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';
import SideDrawer from './SideDrawer';

type FilterCategory = {
  id: string;
  title: string;
};

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
  initialCount?: number; // default 5
  step?: number; // default 5
  categories?: FilterCategory[];
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
   TAGS — Cidade | Categoria | Tipo
========================= */
function buildTags(item: SponsoredOffer) {
  if (Array.isArray((item as any).tags) && (item as any).tags.length === 3) {
    return (item as any).tags.join(' | ');
  }
  return '';
}

/* =========================
   CORAÇÃO (vasado → preenchido)
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
   PLACEHOLDER (SVG centralizado)
========================= */
function TempImagePlaceholder() {
  return (
    <div className="relative h-full w-full bg-zinc-200">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-zinc-400"
        fill="none"
      >
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 11.5l2.2 2.2L14.2 9.7 20 15.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 9.2a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* =========================
   CHIP (ativo em verde)
   FIX: evitar "pulo" por foco/scroll
========================= */
function FilterChip({
  isActive,
  children,
  onClick,
}: {
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      onClick={onClick}
      className={[
        'shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold',
        'border transition-colors',
        isActive
          ? 'border-emerald-700 bg-emerald-700 text-white'
          : 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/* =========================
   LOADING (leve)
========================= */
function LoadingRow({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
        <span className="inline-flex h-4 w-4 items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-500" />
        </span>
        {text}
      </div>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
type FilterKey = 'melhores' | 'descontos' | { kind: 'cat'; id: string };

function isCatFilter(v: FilterKey): v is { kind: 'cat'; id: string } {
  return typeof v === 'object' && v !== null && (v as any).kind === 'cat';
}

export default function SponsoredOffersList({
  items,
  className,
  title,
  initialCount = 5,
  step = 5,
  categories = [],
}: Props) {
  const [favIds, setFavIds] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);

  const [active, setActive] = useState<FilterKey>('melhores');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  function openModal() {
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }
  function toggleFav(id: string) {
    setFavIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const uniqueCats = useMemo(() => {
    const seen = new Set<string>();
    const out: FilterCategory[] = [];
    for (const c of categories) {
      const key = c.title.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const list = Array.isArray(items) ? [...items] : [];

    if (isCatFilter(active)) {
      const wantedTitle =
        uniqueCats.find((c) => c.id === active.id)?.title?.toLowerCase() ?? '';
      if (!wantedTitle) return list;

      return list.filter((it: any) => {
        const cat = String(it?.tags?.[1] ?? it?.category ?? it?.categoryLabel ?? '').toLowerCase();
        return cat.includes(wantedTitle);
      });
    }

    if (active === 'descontos') {
      const parsePct = (v: any) => {
        const m = String(v ?? '').match(/(\d+([.,]\d+)?)/);
        if (!m) return 0;
        const n = Number(String(m[1]).replace(',', '.'));
        return Number.isFinite(n) ? n : 0;
      };

      list.sort((a: any, b: any) => {
        const ap = parsePct(a?.priceText ?? a?.savingsText);
        const bp = parsePct(b?.priceText ?? b?.savingsText);
        return bp - ap;
      });
      return list;
    }

    list.sort((a: any, b: any) => {
      const ar = Number(a?.rating ?? 0);
      const br = Number(b?.rating ?? 0);
      if (br !== ar) return br - ar;

      const av = Number(a?.reviews ?? 0);
      const bv = Number(b?.reviews ?? 0);
      return bv - av;
    });
    return list;
  }, [active, items, uniqueCats]);

  const total = filteredItems.length;

  const [visibleCount, setVisibleCount] = useState(() => Math.min(initialCount, total));

  useEffect(() => {
    setVisibleCount(Math.min(initialCount, total));
  }, [active, initialCount, total]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);
  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (visibleCount >= total) return;
        if (lockRef.current) return;

        lockRef.current = true;

        setIsLoadingMore(true);
        if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);

        loadingTimerRef.current = window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + step, total));
          setIsLoadingMore(false);
          lockRef.current = false;
        }, 120);
      },
      { root: null, rootMargin: '220px 0px 220px 0px', threshold: 0.01 }
    );

    io.observe(el);

    return () => {
      io.disconnect();
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
      lockRef.current = false;
    };
  }, [step, total, visibleCount]);

  const showTitle = !!title && title.trim().length > 0;

  // mantém altura quando tem pouco/0 cards
  const needsStickySpacer = total <= 6;

  // sua altura (mantive como você testou)
  const spacerHeight = `90svh`;

  // refs do sticky e do topo da lista
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const listTopRef = useRef<HTMLDivElement | null>(null);

  // ✅ “trava” curtinha pra evitar o browser mexer no scroll depois do clique (mobile)
  const lockUntilRef = useRef(0);
  const lockYRef = useRef<number | null>(null);

  const startScrollLock = (y: number, ms: number) => {
    lockYRef.current = y;
    lockUntilRef.current = Date.now() + ms;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = lockYRef.current;
      if (y == null) return;
      if (Date.now() > lockUntilRef.current) {
        lockYRef.current = null;
        return;
      }
      const diff = Math.abs(window.scrollY - y);
      if (diff > 1) {
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const snapStickyToTop = () => {
    const sticky = stickyRef.current;
    if (!sticky) return;

    const topStr = window.getComputedStyle(sticky).top || '0';
    const desiredTop = Number.isFinite(Number.parseFloat(topStr)) ? Number.parseFloat(topStr) : 0;

    const rect = sticky.getBoundingClientRect();

    // ✅ ajuste fino do “pulinho” (~20px no mobile)
    const EXTRA_FIX_PX = 20;

    const targetY = Math.max(0, window.scrollY + rect.top - desiredTop - EXTRA_FIX_PX);

    window.scrollTo({ top: targetY, behavior: 'auto' });

    // ✅ segura um pouco mais no mobile
    startScrollLock(targetY, 260);

    requestAnimationFrame(() => window.scrollTo({ top: targetY, behavior: 'auto' }));
    window.setTimeout(() => window.scrollTo({ top: targetY, behavior: 'auto' }), 30);
    window.setTimeout(() => window.scrollTo({ top: targetY, behavior: 'auto' }), 90);
  };

  const snapListTop = () => {
    const el = listTopRef.current;
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  // ✅ troca filtro + volta para o topo da lista + corrige o “pulinho”
  const setActiveAndSnap = (next: FilterKey) => {
    setActive(next);

    const after = () => {
      snapListTop();
      snapStickyToTop();
    };

    requestAnimationFrame(after);
    requestAnimationFrame(() => requestAnimationFrame(after));
    window.setTimeout(after, 30);
    window.setTimeout(after, 90);
  };

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <SideDrawer open={modalOpen} onClose={closeModal} />

      {showTitle ? (
        <div className="mb-1 px-4 text-[12px] font-medium text-zinc-500">{title}</div>
      ) : null}

      {/* ✅ FILTRO FIXO ABAIXO DO QUICKSEARCH */}
      <div
        ref={stickyRef}
        className="sticky z-[60] bg-zinc-100"
        style={{ top: 'calc(67px + env(safe-area-inset-top))' }}
      >
        <div className="px-3 pt-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4 pt-1">
            <FilterChip
              isActive={active === 'descontos'}
              onClick={() => setActiveAndSnap('descontos')}
            >
              Maiores descontos
            </FilterChip>

            {uniqueCats.map((c) => {
              const isActiveNow = isCatFilter(active) && active.id === c.id;
              return (
                <FilterChip
                  key={c.id}
                  isActive={isActiveNow}
                  onClick={() => setActiveAndSnap({ kind: 'cat', id: c.id })}
                >
                  {c.title}
                </FilterChip>
              );
            })}

            <FilterChip
              isActive={active === 'melhores'}
              onClick={() => setActiveAndSnap('melhores')}
            >
              melhores avaliados
            </FilterChip>
          </div>
        </div>

        <div className="h-[1px] bg-zinc-200" />

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

          /* ✅ evita o browser “ancorar” o scroll quando a lista muda de tamanho */
          .no-anchor {
            overflow-anchor: none;
          }
        `}</style>
      </div>

      {/* ✅ âncora do topo da lista (usa scroll-margin-top com safe-area) */}
      <div
        ref={listTopRef}
        className="no-anchor"
        style={{ scrollMarginTop: 'calc(67px + env(safe-area-inset-top))' }}
      />

      {/* LISTA */}
      <div className="px-3 no-anchor">
        {total === 0 ? (
          <>
            <div className="px-1 py-4 text-[12px] font-medium text-zinc-500">
              Nenhum item encontrado para este filtro.
            </div>

            {needsStickySpacer ? <div aria-hidden style={{ height: spacerHeight }} /> : null}
          </>
        ) : (
          <>
            {visibleItems.map((item, idx) => {
              const isFav = !!favIds[(item as any).id];
              const tagsLine = buildTags(item);
              const rating = (item as any).rating ?? 4.8;
              const reviews = (item as any).reviews ?? 0;
              const priceText = (item as any).priceText ?? (item as any).savingsText ?? null;
              const imageUrl = (item as any).imageUrl ?? null;

              const handleCardClick = () => openModal();

              return (
                <div key={(item as any).id} className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleCardClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleCardClick();
                    }}
                    className="block py-3 cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-zinc-200">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={(item as any).title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <TempImagePlaceholder />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="pr-14 text-[11px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                          {(item as any).title}
                        </div>

                        <div className="mt-[4px]">
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{tagsLine}</div>

                          {priceText ? (
                            <div className="-mt-[2px] text-[11px] font-medium text-zinc-900">
                              Economia de {priceText}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-1.5 flex items-end justify-between">
                          <div>
                            <StarsRow rating={Number(rating)} />
                            <div className="-mt-0.5 text-[11px] text-zinc-500">
                              <span className="font-semibold text-zinc-700">
                                {Number(rating).toFixed(1)}
                              </span>{' '}
                              de <span className="font-semibold text-zinc-700">{reviews}</span>{' '}
                              avaliações
                            </div>
                          </div>

                          <span
                            className="text-[14px] font-semibold text-green-600"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleCardClick();
                              }
                            }}
                          >
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
                        toggleFav((item as any).id);
                      }}
                      className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center"
                    >
                      <HeartIcon
                        filled={isFav}
                        className={[
                          'h-9 w-9 transition',
                          isFav ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-400',
                        ].join(' ')}
                      />
                    </button>
                  </div>

                  {idx < visibleItems.length - 1 ? (
                    <div className="mx-2 border-b border-dotted border-zinc-300" />
                  ) : null}
                </div>
              );
            })}

            {isLoadingMore ? <LoadingRow /> : null}

            {visibleCount < total ? (
              <div ref={sentinelRef} className="py-4">
                <div className="mx-2 h-[1px] bg-transparent" />
              </div>
            ) : (
              <div className="py-2" />
            )}

            {needsStickySpacer ? <div aria-hidden style={{ height: spacerHeight }} /> : null}
          </>
        )}
      </div>
    </section>
  );
}
