'use client';

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';
import SideDrawer from './SideDrawer';
import OfferEconomyLine from './OfferEconomyLine';

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
   ✅ ICONES SVG DO FILTRO
========================= */
function FilterIcon({
  kind,
  isActive,
}: {
  kind: 'todos' | 'melhores' | 'descontos' | 'novo' | 'aberto' | 'perto' | 'delivery';
  isActive: boolean;
}) {
  const cls = 'h-[19.8px] w-[19.8px]';
  const c = isActive
    ? 'currentColor'
    : kind === 'todos'
      ? '#0F172A'
      : kind === 'melhores'
        ? '#FACC15'
        : kind === 'descontos'
          ? '#059669'
          : kind === 'novo'
            ? '#3B82F6'
            : kind === 'aberto'
              ? '#2563EB'
              : kind === 'perto'
                ? '#EF4444'
                : '#8B5CF6';

  switch (kind) {
    case 'todos':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M6.5 7.5h11M6.5 12h11M6.5 16.5h11" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'melhores':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
            fill={c}
          />
          <path
            d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
            stroke={isActive ? 'currentColor' : '#CA8A04'}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'descontos':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M6 3h7l5 5v13H6V3Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          <path d="M15.5 9 8.5 16" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="10" r="1.35" fill={c} />
          <circle cx="15" cy="15" r="1.35" fill={c} />
        </svg>
      );
    case 'novo':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M12 3v18" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <path d="M3 12h18" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="2" />
        </svg>
      );
    case 'aberto':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
          <path d="M12 7v5l3 2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'perto':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10Z"
            stroke={c}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z" stroke={c} strokeWidth="2" />
        </svg>
      );
    case 'delivery':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M3 6h13v9H3z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 10h3l2 3v2h-5z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          <path d="M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill={c} />
          <path d="M17 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill={c} />
        </svg>
      );
    default:
      return null;
  }
}

/* =========================
   CHIP (ativo em verde)
========================= */
function FilterChip({
  isActive,
  children,
  onClick,
  iconKind,
}: {
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
  iconKind: 'todos' | 'melhores' | 'descontos' | 'novo' | 'aberto' | 'perto' | 'delivery';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'shrink-0 rounded-full',
        'px-4 py-2',
        'min-h-[44px]',
        'inline-flex items-center gap-2',
        'border transition-colors',
        'touch-manipulation select-none',
        isActive
          ? 'border-emerald-700 bg-emerald-700 text-white'
          : 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
      ].join(' ')}
    >
      <span className="inline-flex items-center justify-center">
        <FilterIcon kind={iconKind} isActive={isActive} />
      </span>
      <span className="whitespace-nowrap text-[13px] font-semibold">{children}</span>
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

type FilterKey = 'todos' | 'melhores' | 'descontos' | 'novo' | 'aberto' | 'perto' | 'delivery';

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

  const [active, setActive] = useState<FilterKey>('todos');
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

  useMemo(() => {
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

    if (active === 'aberto') return [];

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

    if (active === 'melhores') {
      list.sort((a: any, b: any) => {
        const ar = Number(a?.rating ?? 0);
        const br = Number(b?.rating ?? 0);
        if (br !== ar) return br - ar;

        const av = Number(a?.reviews ?? 0);
        const bv = Number(b?.reviews ?? 0);
        return bv - av;
      });
      return list;
    }

    return list;
  }, [active, items]);

  const total = filteredItems.length;

  const [visibleCount, setVisibleCount] = useState(() => Math.min(initialCount, total));

  useEffect(() => {
    setVisibleCount(Math.min(initialCount, total));
  }, [active, initialCount, total]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

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

  const needsStickySpacer = total <= 6;
  const spacerHeight = `90vh`;

  const listTopRef = useRef<HTMLDivElement | null>(null);
  const [filterIsStuck, setFilterIsStuck] = useState(false);

  const FILTER_TOP = 'calc(var(--app-header-h, 54px) + var(--sticky-stack-h, 0px))';
  const filterStickyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = filterStickyRef.current;
    if (!el) return;

    let raf: number | null = null;

    const readTopPx = () => {
      const cs = window.getComputedStyle(el);
      const topStr = cs.top || '0';
      const topPx = Number.parseFloat(topStr);
      return Number.isFinite(topPx) ? topPx : 0;
    };

    const compute = () => {
      raf = null;
      const topPx = readTopPx();
      const rect = el.getBoundingClientRect();
      const stuckNow = rect.top <= topPx + 4.0;
      setFilterIsStuck((prev) => (prev === stuckNow ? prev : stuckNow));
    };

    const onScroll = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* =========================
     ✅ FIX: preservar scroll SEM travar body
     - elimina “pisca”
     - elimina travamento / subir pro topo
  ========================= */
  const restoreScrollRef = useRef<number | null>(null);
  const restoreRafsRef = useRef<number[]>([]);

  const setActivePreserveScroll = (next: FilterKey) => {
    if (next === active) return; // ✅ evita trabalho à toa
    restoreScrollRef.current = window.scrollY || 0;
    setActive(next);
  };

  useLayoutEffect(() => {
    const y = restoreScrollRef.current;
    if (y == null) return;

    // limpa rafs antigos
    for (const id of restoreRafsRef.current) cancelAnimationFrame(id);
    restoreRafsRef.current = [];

    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'auto' });
        restoreScrollRef.current = null;
      });
      restoreRafsRef.current.push(r2);
    });
    restoreRafsRef.current.push(r1);

    return () => {
      for (const id of restoreRafsRef.current) cancelAnimationFrame(id);
      restoreRafsRef.current = [];
    };
  }, [active, total]); // ✅ roda sempre que o filtro muda (mesmo se visibleCount não mudar)

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <SideDrawer open={modalOpen} onClose={closeModal} />

      {showTitle ? (
        <div className="mb-1 px-4 text-[12px] font-medium text-zinc-500">{title}</div>
      ) : null}

      <div
        ref={filterStickyRef}
        className={[
          'sticky z-[60] transition-colors duration-200 ease-out',
          filterIsStuck ? 'bg-zinc-200/95 backdrop-blur-[2px]' : 'bg-zinc-100',
        ].join(' ')}
        style={{ top: FILTER_TOP }}
      >
        <div className="px-3 pt-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 pt-0">
            <FilterChip iconKind="todos" isActive={active === 'todos'} onClick={() => setActivePreserveScroll('todos')}>
              Todos
            </FilterChip>

            <FilterChip iconKind="melhores" isActive={active === 'melhores'} onClick={() => setActivePreserveScroll('melhores')}>
              Melhores avaliados
            </FilterChip>

            <FilterChip iconKind="descontos" isActive={active === 'descontos'} onClick={() => setActivePreserveScroll('descontos')}>
              Maiores descontos
            </FilterChip>

            <FilterChip iconKind="novo" isActive={active === 'novo'} onClick={() => setActivePreserveScroll('novo')}>
              Novo
            </FilterChip>

            <FilterChip iconKind="aberto" isActive={active === 'aberto'} onClick={() => setActivePreserveScroll('aberto')}>
              Aberto agora
            </FilterChip>

            <FilterChip iconKind="perto" isActive={active === 'perto'} onClick={() => setActivePreserveScroll('perto')}>
              Perto de mim
            </FilterChip>

            <FilterChip iconKind="delivery" isActive={active === 'delivery'} onClick={() => setActivePreserveScroll('delivery')}>
              Delivery
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
          .no-anchor {
            overflow-anchor: none;
          }
        `}</style>
      </div>

      <div ref={listTopRef} className="no-anchor" style={{ scrollMarginTop: FILTER_TOP }} />

      <div className="px-3 no-anchor" style={needsStickySpacer ? { minHeight: spacerHeight } : {}}>
        {total === 0 ? (
          <div className="px-1 py-4 text-[12px] font-medium text-zinc-500">
            Nenhum item encontrado para este filtro.
          </div>
        ) : (
          <>
            {visibleItems.map((item, idx) => {
              const isFav = !!favIds[(item as any).id];
              const tagsLine = buildTags(item);
              const rating = (item as any).rating ?? 4.8;
              const reviews = (item as any).reviews ?? 0;
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
                    className="block py-[13px] cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="h-[106px] w-[106px] flex-none overflow-hidden rounded-md bg-zinc-200">
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
                        <div className="pr-[41px] text-[12px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                          {(item as any).title}
                        </div>

                        <div className="mt-[4px]">
                          <div className="text-[12px] text-zinc-500 line-clamp-1">{tagsLine}</div>

                          <OfferEconomyLine
                            savingsText={(item as any).savingsText ?? null}
                            priceText={(item as any).priceText ?? null}
                          />
                        </div>

                        <div className="mt-1.5 flex items-end justify-between">
                          <div>
                            <StarsRow rating={Number(rating)} />
                            <div className="-mt-0.5 text-[12px] text-zinc-500">
                              <span className="font-semibold text-zinc-700">{Number(rating).toFixed(1)}</span> de{' '}
                              <span className="font-semibold text-zinc-700">{reviews}</span> avaliações
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
                      className="absolute -right-[4px] top-1 inline-flex h-10 w-10 items-center justify-center"
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
          </>
        )}
      </div>
    </section>
  );
}
