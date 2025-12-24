// Caminho: app/_components/HomeBanner.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BANNERS, type BannerItem } from '@/_data/banners';

type Props = { className?: string };

const DURATION_MS = 6500;
const SWIPE_THRESHOLD = 45;
const DEADZONE_PX = 10; // ✅ evita cancelar tap por micro-movimento
const SLIDE_MS = 420; // swipe
const FADE_MS = 280; // setas + autoplay

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function DoubleChevronOpen({
  dir,
  className,
}: {
  dir: 'left' | 'right';
  className?: string;
}) {
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

function HeartIcon({
  className,
  active = false,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7-4.6-9.2-8.7C1.3 9.3 3.1 6.6 6.2 6.1c1.8-.3 3.4.4 4.5 1.7 1.1-1.3 2.7-2 4.5-1.7 3.1.5 4.9 3.2 3.4 6.2C19 16.4 12 21 12 21z"
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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M8 7.5v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 7.5v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function alignClasses(align?: BannerItem['align']) {
  if (align === 'center') return 'items-center text-center';
  if (align === 'right') return 'items-end text-right';
  return 'items-start text-left';
}

function withWebp(url: string) {
  if (!url) return url;
  if (url.toLowerCase().endsWith('.webp')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}fm=webp`;
}

export default function HomeBanner({ className }: Props) {
  const items = useMemo(() => BANNERS.slice(0, 3), []);
  const count = items.length;

  const [active, setActive] = useState(0);

  // swipe/slide
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const slideTimerRef = useRef<number | null>(null);

  // fade (setas + autoplay)
  const [isFading, setIsFading] = useState(false);
  const [fadeTo, setFadeTo] = useState<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  // progress/autoplay
  const [progress, setProgress] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // swipe refs
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const hasMovedRef = useRef(false); // ✅ só vira swipe após deadzone

  // container width
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<number>(1);

  // favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [heartPop, setHeartPop] = useState(false);

  const current = items[active];
  const prevIndex = (active - 1 + count) % count;
  const nextIndex = (active + 1) % count;
  const prevItem = items[prevIndex];
  const nextItem = items[nextIndex];

  const autoplayPaused = userPaused || isDragging || isSlideAnimating || isFading;

  // medir largura
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

  // preload (prev/current/next + fade target)
  useEffect(() => {
    const urls = [
      withWebp(prevItem?.imageUrl),
      withWebp(current?.imageUrl),
      withWebp(nextItem?.imageUrl),
      fadeTo != null ? withWebp(items[fadeTo]?.imageUrl) : '',
    ].filter(Boolean);

    urls.forEach((u) => {
      const img = new Image();
      img.decoding = 'async' as any;
      img.src = u!;
    });
  }, [prevItem?.imageUrl, current?.imageUrl, nextItem?.imageUrl, fadeTo, items]);

  // favoritos localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('plugdesconto:favorites');
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('plugdesconto:favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const isFav = !!favorites[current?.id ?? ''];

  function toggleFav() {
    const id = current?.id;
    if (!id) return;

    const willBeFav = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

    if (willBeFav) {
      setHeartPop(false);
      requestAnimationFrame(() => setHeartPop(true));
      window.setTimeout(() => setHeartPop(false), 380);
    }
  }

  // autoplay
  useEffect(() => {
    if (count <= 1) return;

    function tick(now: number) {
      if (autoplayPaused) {
        lastRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = lastRef.current || now;
      const delta = now - last;
      lastRef.current = now;

      setProgress((p) => {
        const inc = (delta / DURATION_MS) * 100;
        const np = p + inc;

        if (np >= 100) {
          setTimeout(() => goNextFade(), 0);
          return 100;
        }
        return np;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayPaused, active, count]);

  function finishSlideTransition(dir: 'next' | 'prev') {
    const newActive =
      dir === 'next' ? (active + 1) % count : (active - 1 + count) % count;

    setSnapping(true);
    setActive(newActive);

    setDragX(0);
    setIsSlideAnimating(false);
    setIsDragging(false);
    setProgress(0);
    lastRef.current = performance.now();

    requestAnimationFrame(() => setSnapping(false));
  }

  function commitSwipe(dir: 'next' | 'prev') {
    if (isSlideAnimating || isFading) return;
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);

    setProgress(100);
    setIsDragging(false);
    setIsSlideAnimating(true);

    const w = widthRef.current || 1;
    setDragX(dir === 'next' ? -w : w);

    slideTimerRef.current = window.setTimeout(() => {
      finishSlideTransition(dir);
    }, SLIDE_MS);
  }

  function startFadeTo(targetIndex: number) {
    if (isFading || isSlideAnimating) return;
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);

    const safe = ((targetIndex % count) + count) % count;
    if (safe === active) return;

    // reseta swipe
    setIsDragging(false);
    draggingRef.current = false;
    hasMovedRef.current = false;
    startXRef.current = null;
    startYRef.current = null;
    setDragX(0);

    setProgress(100);
    setFadeTo(safe);
    setIsFading(true);

    fadeTimerRef.current = window.setTimeout(() => {
      setActive(safe);
      setFadeTo(null);
      setIsFading(false);

      setProgress(0);
      lastRef.current = performance.now();
    }, FADE_MS);
  }

  function goNextFade() {
    startFadeTo((active + 1) % count);
  }

  function goPrevFade() {
    startFadeTo((active - 1 + count) % count);
  }

  async function onShare() {
    try {
      const url =
        typeof window !== 'undefined'
          ? current?.href
            ? new URL(current.href, window.location.origin).toString()
            : window.location.href
          : '';

      if (navigator.share) {
        await navigator.share({
          title: current?.title ?? 'Plug Desconto',
          text: current?.subtitle ?? '',
          url,
        });
        return;
      }

      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
      }
    } catch {}
  }

  function shouldIgnoreGesture(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return !!el.closest(
      '[data-banner-control], button, a, input, textarea, select, [role="button"]'
    );
  }

  // ✅ Swipe handlers (com deadzone)
  function onPointerDown(e: React.PointerEvent) {
    if (shouldIgnoreGesture(e.target)) return;
    if (isSlideAnimating || isFading) return;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    draggingRef.current = true;
    hasMovedRef.current = false; // ✅ ainda não virou swipe

    setDragX(0);

    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // ✅ deadzone: não faz nada (não cancela tap)
    if (!hasMovedRef.current) {
      if (Math.abs(dx) < DEADZONE_PX && Math.abs(dy) < DEADZONE_PX) return;

      // se começou mais vertical, libera scroll e cancela swipe
      if (Math.abs(dy) > Math.abs(dx)) {
        draggingRef.current = false;
        setIsDragging(false);
        setDragX(0);
        return;
      }

      // agora sim virou swipe
      hasMovedRef.current = true;
      setIsDragging(true);
    }

    // só aqui impede gesto do navegador
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

    // ✅ se nem virou swipe (só foi tap), não mexe em nada
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

  if (!current) return null;

  const progressForActive = isSlideAnimating || isFading ? 100 : clamp(progress, 0, 100);

  const slideTransitionClass =
    !isDragging && !snapping ? `transition-transform duration-[${SLIDE_MS}ms]` : '';

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  function SlideContent({ item }: { item: BannerItem }) {
    const contentAlign = alignClasses(item.align);
    const centerLiftClass = item.align === 'center' ? '-translate-y-[15px]' : '';

    const titleClass = [
      'text-[25px] font-extrabold leading-[1.05] text-white',
      item.align === 'left' || item.align === 'right'
        ? 'max-w-[220px] whitespace-normal'
        : '',
      item.align === 'center' ? 'whitespace-nowrap' : '',
    ].join(' ');

    return (
      <div className="absolute inset-0 z-[35] px-14 pb-4 pt-6 -translate-y-[0px]">
        <div className={[`flex h-full w-full flex-col justify-end gap-1 ${contentAlign}`, centerLiftClass].join(' ')}>
          <div
            className="text-[11px] font-semibold tracking-wide"
            style={{ color: '#7CFFB2', textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
          >
            {item.tag}
          </div>

          <div className={titleClass} style={{ textShadow: '0 2px 18px rgba(0,0,0,0.65)' }}>
            {item.title}
          </div>

          <div
            className="text-[16px] font-medium text-white/90"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
          >
            {item.subtitle}
          </div>

          <div
            className="text-[15px] font-semibold -mt-[8px]"
            style={{ color: '#7CCBFF', textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
          >
            {item.highlight}
          </div>

          {item.href ? (
            <div className="mt-2">
              <Link
                href={item.href}
                className="inline-flex text-[15px] font-semibold text-white -translate-y-[10px]"
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
              >
                Ver ofertas →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const fadeItem = fadeTo != null ? items[fadeTo] : null;

  const prevForSlide = prevItem;
  const nextForSlide = nextItem;

  return (
    <section className={className}>
      <div className="relative w-full">
        <div
          ref={containerRef}
          className="relative h-[250px] w-full overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          {/* IMAGENS + TEXTO */}
          {isFading && fadeItem ? (
            <>
              {/* BASE: só imagem */}
              <div className="absolute inset-0">
                <picture>
                  <source srcSet={withWebp(current.imageUrl)} type="image/webp" />
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
              </div>

              {/* TOP: imagem + texto */}
              <div
                className={[
                  'absolute inset-0',
                  'transition-opacity',
                  `duration-[${FADE_MS}ms]`,
                  'opacity-100',
                ].join(' ')}
                style={{ opacity: 1 }}
              >
                <picture>
                  <source srcSet={withWebp(fadeItem.imageUrl)} type="image/webp" />
                  <img
                    src={fadeItem.imageUrl}
                    alt={fadeItem.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>

                <div className="absolute inset-0" style={{ animation: `fadeIn ${FADE_MS}ms ease-out both` }}>
                  <SlideContent item={fadeItem} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* PREV */}
              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${(-widthRef.current + dragX)}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(prevForSlide.imageUrl)} type="image/webp" />
                  <img
                    src={prevForSlide.imageUrl}
                    alt={prevForSlide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
                <SlideContent item={prevForSlide} />
              </div>

              {/* CURRENT */}
              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${dragX}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(current.imageUrl)} type="image/webp" />
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
                <SlideContent item={current} />
              </div>

              {/* NEXT */}
              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${(widthRef.current + dragX)}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(nextForSlide.imageUrl)} type="image/webp" />
                  <img
                    src={nextForSlide.imageUrl}
                    alt={nextForSlide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
                <SlideContent item={nextForSlide} />
              </div>
            </>
          )}

          {/* overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-black/10" />

          {/* progress */}
          <div className="absolute left-0 right-0 top-0 z-[60] px-3 pt-2">
            <div className="flex gap-1.5">
              {items.map((_, i) => {
                const filled = i < active ? 100 : i === active ? progressForActive : 0;
                return (
                  <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                    <div className="h-full bg-white" style={{ width: `${filled}%` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* controls */}
          <div
            data-banner-control
            className="absolute right-2 top-6 z-[70] flex items-center gap-3 text-white"
            onPointerDown={stop}
            onPointerUp={stop}
            onClick={stop}
          >
            <button
              type="button"
              aria-label={userPaused ? 'Ativar banner' : 'Pausar banner'}
              onClick={() => setUserPaused((v) => !v)}
              className="p2"
              style={{ touchAction: 'manipulation' }}
            >
              {userPaused ? <PlayIcon className="h-10 w-10 text-white" /> : <PauseIcon className="h-10 w-10 text-white" />}
            </button>

            <button
              type="button"
              aria-label="Compartilhar"
              onClick={onShare}
              className="p2 -ml-2"
              style={{ touchAction: 'manipulation' }}
            >
              <PlaneIcon className="h-7 w-7 text-white rotate-[25deg]" />
            </button>

            <button
              type="button"
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={toggleFav}
              className="p-2"
              style={{ touchAction: 'manipulation' }}
            >
              <HeartIcon
                className={['h-8 w-8', isFav ? 'text-red-500' : 'text-white', heartPop ? 'heart-pop' : ''].join(' ')}
                active={isFav}
              />
            </button>
          </div>

          {/* arrows (fade) */}
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={goPrevFade}
            className="absolute left-2 top-1/2 z-[70] -translate-y-1/2 text-white"
            data-banner-control
            onPointerDown={stop}
            onPointerUp={stop}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="arrow-float block p-2">
              <DoubleChevronOpen dir="left" className="h-10 w-10 scale-110" />
            </span>
          </button>

          <button
            type="button"
            aria-label="Próximo banner"
            onClick={goNextFade}
            className="absolute right-2 top-1/2 z-[70] -translate-y-1/2 text-white"
            data-banner-control
            onPointerDown={stop}
            onPointerUp={stop}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="arrow-float block p-2">
              <DoubleChevronOpen dir="right" className="h-10 w-10 scale-110" />
            </span>
          </button>
        </div>

        <style jsx global>{`
          @keyframes floatArrow {
            0% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0); }
          }
          .arrow-float { animation: floatArrow 1.8s ease-in-out infinite; }

          @keyframes heartPop {
            0% { transform: scale(1); }
            30% { transform: scale(1.25); }
            60% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .heart-pop { animation: heartPop 320ms ease-out; }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </section>
  );
}
