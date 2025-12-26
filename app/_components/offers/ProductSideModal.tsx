'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ExposedCarouselItem } from './ExposedCarouselRow';

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
      w.__PLUG_SCROLL_LOCK_COUNT__ = Math.max(
        0,
        (w.__PLUG_SCROLL_LOCK_COUNT__ || 1) - 1
      );

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
   HELPERS / ÍCONES
========================= */
const HERO_DURATION_MS = 6500;
const SLIDE_MS = 420;
const SWIPE_THRESHOLD = 45;
const DEADZONE_PX = 10;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function withWebp(url?: string | null) {
  const u = url ?? '';
  if (!u) return u;
  if (u.toLowerCase().endsWith('.webp')) return u;
  const sep = u.includes('?') ? '&' : '?';
  return `${u}${sep}fm=webp`;
}

function DoubleChevronOpen({ dir, className }: { dir: 'left' | 'right'; className?: string }) {
  const flip = dir === 'left';
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="none">
      <g
        transform={flip ? 'translate(28 0) scale(-1 1)' : undefined}
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

function HeartIcon({ className, active = false }: { className?: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z"
        fill={active ? 'currentColor' : 'none'}
        stroke={active ? 'none' : 'currentColor'}
        strokeWidth={active ? 0 : 1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M21.8 2.2 9.1 14.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21.8 2.2 14.2 21.6c-.2.6-.9.6-1.2.1l-3.7-6.6-6.6-3.7c-.5-.3-.5-1 .1-1.2L21.8 2.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================
   HERO (banner do modal)
========================= */
function ModalHeroBanner({
  item,
  categoryLabel,
  variant,
  isFav,
  onToggleFav,
  onShare,
}: {
  item: ExposedCarouselItem;
  categoryLabel: string;
  variant: 'default' | 'tours';
  isFav: boolean;
  onToggleFav: () => void;
  onShare: () => void;
}) {
  const rating = item.rating ?? 4.9;
  const reviews = item.reviews ?? 812;

  const SHADOW_STRONG = '0 3px 22px rgba(0,0,0,0.92)';
  const SHADOW_MED = '0 3px 18px rgba(0,0,0,0.88)';
  const SHADOW_SOFT = '0 2px 16px rgba(0,0,0,0.82)';

  const savings =
    item.savingsText ??
    (variant === 'tours'
      ? 'Condições especiais disponíveis'
      : 'Economia de R$50 a R$190');

  const images = useMemo(() => {
    const base = (item.gallery ?? []).filter(Boolean) as string[];
    const first = item.imageUrl ? [item.imageUrl] : [];
    const all = [...base, ...first].filter(Boolean);
    const list = all.length ? all : [''];

    const out: string[] = [];
    for (let i = 0; i < 3; i++) out.push(list[i % list.length]);
    return out;
  }, [item.gallery, item.imageUrl]);

  const count = images.length;
  const [active, setActive] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<number>(1);

  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const slideTimerRef = useRef<number | null>(null);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(HERO_DURATION_MS);

  const [barKey, setBarKey] = useState(0);
  const [barArmed, setBarArmed] = useState(false);

  const prevIndex = (active - 1 + count) % count;
  const nextIndex = (active + 1) % count;
  const prevItem = images[prevIndex];
  const current = images[active];
  const nextItem = images[nextIndex];

  const autoplayPaused = isDragging || isSlideAnimating;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      widthRef.current = Math.max(1, rect.width);
    };

    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    const urls = [prevItem, current, nextItem].filter(Boolean) as string[];
    urls.forEach((u) => {
      const img = new Image();
      img.decoding = 'async' as any;
      img.src = withWebp(u);
    });
  }, [prevItem, current, nextItem]);

  function clearAutoplayTimer() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function pauseClock() {
    clearAutoplayTimer();
    const now = performance.now();
    const elapsed = Math.max(0, now - startedAtRef.current);
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    startedAtRef.current = now;
  }

  function resumeClock() {
    clearAutoplayTimer();
    startedAtRef.current = performance.now();
    timeoutRef.current = window.setTimeout(() => {
      goNextSlide();
    }, Math.max(0, remainingRef.current));
  }

  useLayoutEffect(() => {
    if (count <= 1) return;

    clearAutoplayTimer();
    remainingRef.current = HERO_DURATION_MS;
    startedAtRef.current = performance.now();

    setBarArmed(false);
    setBarKey((k) => k + 1);
    requestAnimationFrame(() => setBarArmed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count]);

  useEffect(() => {
    if (count <= 1) return;

    if (autoplayPaused) {
      pauseClock();
      return;
    }

    resumeClock();
    return () => clearAutoplayTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayPaused, count]);

  useEffect(() => {
    return () => {
      if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
      clearAutoplayTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finishSlideTransition(dir: 'next' | 'prev') {
    const newActive = dir === 'next' ? (active + 1) % count : (active - 1 + count) % count;
    setSnapping(true);
    setActive(newActive);
    setDragX(0);
    setIsSlideAnimating(false);
    setIsDragging(false);
    requestAnimationFrame(() => setSnapping(false));
  }

  function commitSwipe(dir: 'next' | 'prev') {
    if (isSlideAnimating) return;
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);

    pauseClock();
    remainingRef.current = 0;

    setIsDragging(false);
    setIsSlideAnimating(true);

    const w = widthRef.current || 1;
    setDragX(dir === 'next' ? -w : w);

    slideTimerRef.current = window.setTimeout(() => {
      finishSlideTransition(dir);
    }, SLIDE_MS);
  }

  function goNextSlide() {
    commitSwipe('next');
  }

  function goPrevSlide() {
    commitSwipe('prev');
  }

  function shouldIgnoreGesture(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return !!el.closest('button, a, input, textarea, select, [role="button"], [data-hero-control]');
  }

  function onPointerDown(e: React.PointerEvent) {
    if (shouldIgnoreGesture(e.target)) return;
    if (isSlideAnimating) return;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    draggingRef.current = true;
    hasMovedRef.current = false;

    setDragX(0);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!hasMovedRef.current) {
      if (Math.abs(dx) < DEADZONE_PX && Math.abs(dy) < DEADZONE_PX) return;

      if (Math.abs(dy) > Math.abs(dx)) {
        draggingRef.current = false;
        setIsDragging(false);
        setDragX(0);
        return;
      }

      hasMovedRef.current = true;
      setIsDragging(true);
    }

    e.preventDefault();

    const w = widthRef.current || 1;
    setDragX(clamp(dx, -w, w));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const sx = startXRef.current;
    if (sx == null) return;

    const dx = e.clientX - sx;
    startXRef.current = null;
    startYRef.current = null;

    if (!hasMovedRef.current) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    hasMovedRef.current = false;

    const commit = Math.abs(dx) >= SWIPE_THRESHOLD;
    if (!commit) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    if (dx < 0) commitSwipe('next');
    else commitSwipe('prev');
  }

  const elapsedMs = clamp(HERO_DURATION_MS - remainingRef.current, 0, HERO_DURATION_MS);

  const slideTransitionClass =
    !isDragging && !snapping ? `transition-transform duration-[${SLIDE_MS}ms]` : '';

  return (
    <div
      ref={containerRef}
      className="relative h-[250px] w-full overflow-hidden rounded-tl-md"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* barra */}
      <div className="absolute left-0 right-0 top-0 z-[60] px-3 pt-2">
        <div className="flex gap-1.5">
          {images.map((_, i) => {
            const isActive = i === active;
            const isPast = i < active;

            return (
              <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                {isPast ? (
                  <div className="h-full w-full bg-white" />
                ) : isActive ? (
                  <div
                    key={`${active}-${barKey}`}
                    className="h-full bg-white will-change-transform"
                    style={
                      !barArmed
                        ? {
                            width: '100%',
                            transformOrigin: 'left',
                            transform: 'scaleX(0)',
                            animationName: 'none',
                          }
                        : {
                            width: '100%',
                            transformOrigin: 'left',
                            transform: 'scaleX(0)',
                            animationName: 'storyFillModal',
                            animationDuration: `${HERO_DURATION_MS}ms`,
                            animationTimingFunction: 'linear',
                            animationFillMode: 'both',
                            animationDelay: `-${elapsedMs}ms`,
                            animationPlayState: autoplayPaused ? ('paused' as const) : ('running' as const),
                          }
                    }
                  />
                ) : (
                  <div className="h-full bg-white" style={{ width: '0%' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* slides */}
      <div
        className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
        style={{
          transform: `translate3d(${(-(widthRef.current || 1) + dragX)}px,0,0)`,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      >
        {prevItem ? (
          <picture>
            <source srcSet={withWebp(prevItem)} type="image/webp" />
            <img
              src={prevItem}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              draggable={false}
              decoding="async"
            />
          </picture>
        ) : (
          <div className="absolute inset-0 h-full w-full bg-neutral-300" />
        )}
      </div>

      <div
        className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
        style={{
          transform: `translate3d(${dragX}px,0,0)`,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      >
        {current ? (
          <picture>
            <source srcSet={withWebp(current)} type="image/webp" />
            <img
              src={current}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              draggable={false}
              decoding="async"
            />
          </picture>
        ) : (
          <div className="absolute inset-0 h-full w-full bg-neutral-300" />
        )}
      </div>

      <div
        className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
        style={{
          transform: `translate3d(${((widthRef.current || 1) + dragX)}px,0,0)`,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      >
        {nextItem ? (
          <picture>
            <source srcSet={withWebp(nextItem)} type="image/webp" />
            <img
              src={nextItem}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              draggable={false}
              decoding="async"
            />
          </picture>
        ) : (
          <div className="absolute inset-0 h-full w-full bg-neutral-300" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute left-3 top-8 rounded-md bg-black/25 px-2 py-1 backdrop-blur-[4px] ring-1 ring-white/15 pointer-events-none z-[40]">
        <div className="leading-none">
          <span className="text-[12px] font-semibold text-amber-400">★</span>{' '}
          <span className="text-[11px] font-semibold text-white">
            {rating.toFixed(1)} de {reviews}
          </span>
        </div>
      </div>

      {/* compartilhar + coração */}
      <div className="absolute right-2 top-7 z-[50] flex items-center gap-2 text-white" data-hero-control>
        <button
          type="button"
          aria-label="Compartilhar"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare();
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-[4px] ring-1 ring-white/15"
          style={{ touchAction: 'manipulation' }}
        >
          <PlaneIcon className="h-6 w-6 text-white rotate-[25deg]" />
        </button>

        <button
          type="button"
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFav();
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-[4px] ring-1 ring-white/15"
          style={{ touchAction: 'manipulation' }}
        >
          <HeartIcon className={['h-7 w-7', isFav ? 'text-red-500' : 'text-white'].join(' ')} active={isFav} />
        </button>
      </div>

      {/* setas */}
      <button
        type="button"
        aria-label="Imagem anterior"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goPrevSlide();
        }}
        className="absolute left-2 top-1/2 z-[55] -translate-y-1/2 text-white"
        style={{ touchAction: 'manipulation' }}
        data-hero-control
      >
        <span className="arrow-float-modal block p-2">
          <DoubleChevronOpen dir="left" className="h-10 w-10 scale-110" />
        </span>
      </button>

      <button
        type="button"
        aria-label="Próxima imagem"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goNextSlide();
        }}
        className="absolute right-2 top-1/2 z-[55] -translate-y-1/2 text-white"
        style={{ touchAction: 'manipulation' }}
        data-hero-control
      >
        <span className="arrow-float-modal block p-2">
          <DoubleChevronOpen dir="right" className="h-10 w-10 scale-110" />
        </span>
      </button>

      {/* texto fixo */}
      <div className="absolute inset-0 z-[45] px-6 pb-4 pt-6 pointer-events-none">
        <div className="flex h-full w-full flex-col justify-end gap-1 items-start text-left">
          <div className="text-[11px] font-semibold tracking-wide" style={{ color: '#7CFFB2', textShadow: SHADOW_SOFT }}>
            {categoryLabel}
          </div>

          <div
            className="text-[22px] font-extrabold leading-[1.05] text-white max-w-[260px] whitespace-normal"
            style={{ textShadow: SHADOW_STRONG }}
          >
            {item.title}
          </div>

          <div className="text-[15px] font-semibold text-white" style={{ textShadow: SHADOW_MED }}>
            {savings}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes storyFillModal {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        @keyframes floatArrowModal {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .arrow-float-modal {
          animation: floatArrowModal 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* =========================
   CONTEÚDO (com sticky do cupom)
========================= */
function ProductModalContent({
  item,
  categoryLabel,
  variant,
  isFav,
  onToggleFav,
  onShare,
}: {
  item: ExposedCarouselItem;
  categoryLabel: string;
  variant: 'default' | 'tours';
  isFav: boolean;
  onToggleFav: () => void;
  onShare: () => void;
}) {
  const description =
    item.description ??
    'Detalhes do produto em breve. Você pode personalizar este conteúdo no arquivo de dados.';

  const highlights: string[] =
    item.highlights && item.highlights.length
      ? item.highlights
      : variant === 'tours'
      ? ['Confirmação rápida', 'Atendimento via WhatsApp', 'Opções para diferentes perfis']
      : ['Desconto exclusivo', 'Condição por tempo limitado', 'Avaliações excelentes'];

  const coupon = item.couponCode ?? `PLUG-${String(item.id).toUpperCase()}`;
  const [copied, setCopied] = useState(false);

  async function copyCoupon() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(coupon);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }
    } catch {}
  }

  return (
    <div className="h-full w-full rounded-tr-none rounded-br-none rounded-bl-none rounded-tl-md bg-zinc-100 ring-1 ring-black/10 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <ModalHeroBanner
          item={item}
          categoryLabel={categoryLabel}
          variant={variant}
          isFav={isFav}
          onToggleFav={onToggleFav}
          onShare={onShare}
        />

        {/* sticky do cupom */}
        <div className="sticky top-0 z-[90] bg-zinc-100/92 backdrop-blur-[8px] ring-1 ring-black/5">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-neutral-900 leading-tight">Cupom</div>
              <div className="text-sm font-semibold text-emerald-800 truncate">{coupon}</div>
            </div>

            <button
              type="button"
              onClick={copyCoupon}
              className="shrink-0 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 active:opacity-90"
            >
              {copied ? 'Copiado!' : 'Copiar código'}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-sm text-neutral-700 leading-relaxed">{description}</div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-neutral-900">Destaques</div>
            <div className="mt-2 space-y-1">
              {highlights.map((h: string, idx: number) => (
                <div key={idx} className="text-sm text-neutral-800">
                  — {h}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <Link
              href={item.href}
              className="block w-full rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800 active:opacity-90"
            >
              Ver oferta completa
            </Link>

            <Link
              href={item.href}
              className="block w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-800 ring-1 ring-black/10 hover:bg-zinc-50 active:opacity-90"
            >
              Reservar / Comprar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODAL LATERAL (export)
========================= */
export default function ProductSideModal({
  open,
  closing,
  onClose,
  item,
  categoryLabel,
  variant,
  isFav,
  onToggleFav,
  onShare,
}: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
  item: ExposedCarouselItem | null;
  categoryLabel: string;
  variant: 'default' | 'tours';
  isFav: boolean;
  onToggleFav: () => void;
  onShare: () => void;
}) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]" role="presentation" onMouseDown={onClose} onTouchStart={onClose}>
      <div
        className={[
          'absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px] touch-manipulation',
          closing ? 'backdrop-exit' : 'backdrop-enter',
        ].join(' ')}
      />

      <div className="absolute inset-0">
        <div
          className={[
            'absolute right-0',
            'top-[50px] bottom-0',
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

          {item ? (
            <ProductModalContent
              item={item}
              categoryLabel={categoryLabel}
              variant={variant}
              isFav={isFav}
              onToggleFav={onToggleFav}
              onShare={onShare}
            />
          ) : (
            <div className="h-full w-full rounded-tr-none rounded-br-none rounded-bl-none rounded-tl-md bg-zinc-100 ring-1 ring-black/10 p-4">
              <div className="text-sm font-semibold text-neutral-900">Nenhum item selecionado</div>
              <div className="mt-2 text-sm text-neutral-700">Selecione um card para ver os detalhes.</div>
            </div>
          )}
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
      `}</style>
    </div>
  );
}
