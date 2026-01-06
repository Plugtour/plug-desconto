// app/_components/media/TimedMediaCarousel.tsx
'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

type MediaItem = { src: string; alt?: string };

type Props = {
  media: MediaItem[];
  className?: string;

  /** duração total por item (ms) */
  durationMs?: number;

  /** threshold de swipe (px) */
  swipeThresholdPx?: number;

  /** deadzone inicial (px) */
  deadzonePx?: number;

  /** duração da animação de slide (ms) */
  slideMs?: number;

  /** duração do fade (ms) */
  fadeMs?: number;

  /** mostra barra de progresso no topo */
  showProgress?: boolean;

  /** mostra dots na base */
  showDots?: boolean;

  /** mostra botão "próximo" (apenas seta direita) */
  showNextButton?: boolean;

  /** NOVO: mostra setas esquerda + direita (igual Home) */
  showArrows?: boolean;

  /** onde posicionar o botão próximo */
  nextButtonPosition?: 'right-center' | 'bottom-right';

  /** wrapper para manter proporção (ex: "aspect-[16/9]") */
  aspectClassName?: string;

  /** classe extra no <img> */
  imageClassName?: string;

  /** habilita pausa por toque (toggle) no botão */
  showPauseButton?: boolean;

  /** inicia pausado */
  defaultPaused?: boolean;

  /** NOVO: overlays iguais ao Home (gradiente + darken leve) */
  homeOverlay?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function withWebp(url: string) {
  if (!url) return url;
  if (url.toLowerCase().endsWith('.webp')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}fm=webp`;
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

export default function TimedMediaCarousel({
  media,
  className,

  durationMs = 6500,
  swipeThresholdPx = 45,
  deadzonePx = 10,
  slideMs = 420,
  fadeMs = 280,

  showProgress = true,
  showDots = true,
  showNextButton = true,
  showArrows = false,
  nextButtonPosition = 'right-center',

  aspectClassName = 'aspect-[16/9]',
  imageClassName = 'object-cover',

  showPauseButton = false,
  defaultPaused = false,

  homeOverlay = false,
}: Props) {
  const items = useMemo(() => (Array.isArray(media) ? media.filter(Boolean) : []), [media]);
  const count = items.length;

  const [active, setActive] = useState(0);

  // ✅ se a lista mudar e o active ficar fora do range, corrige sem quebrar autoplay
  useEffect(() => {
    if (count <= 0) return;
    if (active > count - 1) setActive(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // swipe/slide
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const slideTimerRef = useRef<number | null>(null);

  // fade
  const [isFading, setIsFading] = useState(false);
  const [fadeTo, setFadeTo] = useState<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  // pausa
  const [userPaused, setUserPaused] = useState(!!defaultPaused);

  // swipe refs
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  // container width
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<number>(1);

  // autoplay
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingRef = useRef<number>(durationMs);

  // barra
  const [barKey, setBarKey] = useState(0);
  const [barArmed, setBarArmed] = useState(false);

  const current = items[active];
  const prevIndex = (active - 1 + count) % Math.max(1, count);
  const nextIndex = (active + 1) % Math.max(1, count);
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

  // preload
  useEffect(() => {
    if (count <= 0) return;

    const urls = [
      withWebp(prevItem?.src),
      withWebp(current?.src),
      withWebp(nextItem?.src),
      fadeTo != null ? withWebp(items[fadeTo]?.src) : '',
    ].filter(Boolean);

    urls.forEach((u) => {
      const img = new Image();
      img.decoding = 'async' as any;
      img.src = u!;
    });
  }, [count, prevItem?.src, current?.src, nextItem?.src, fadeTo, items]);

  function clearAutoplayTimer() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function pauseAutoplayClock() {
    clearAutoplayTimer();
    const now = performance.now();
    const elapsed = Math.max(0, now - startedAtRef.current);
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    startedAtRef.current = now;
  }

  function resumeAutoplayClock() {
    clearAutoplayTimer();
    startedAtRef.current = performance.now();
    timeoutRef.current = window.setTimeout(() => {
      goNextFade();
    }, Math.max(0, remainingRef.current));
  }

  // reset barra
  useLayoutEffect(() => {
    if (count <= 1) return;

    clearAutoplayTimer();
    remainingRef.current = durationMs;
    startedAtRef.current = performance.now();

    setBarArmed(false);
    setBarKey((k) => k + 1);

    requestAnimationFrame(() => setBarArmed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count, durationMs]);

  // pause/retomar
  useEffect(() => {
    if (count <= 1) return;

    if (autoplayPaused) {
      pauseAutoplayClock();
      return;
    }

    resumeAutoplayClock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayPaused, count]);

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
    if (isSlideAnimating || isFading) return;
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);

    pauseAutoplayClock();
    remainingRef.current = 0;

    setIsDragging(false);
    setIsSlideAnimating(true);

    const w = widthRef.current || 1;
    setDragX(dir === 'next' ? -w : w);

    slideTimerRef.current = window.setTimeout(() => {
      finishSlideTransition(dir);
    }, slideMs);
  }

  function startFadeTo(targetIndex: number) {
    if (isFading || isSlideAnimating) return;
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    if (count <= 0) return;

    const safe = ((targetIndex % count) + count) % count;
    if (safe === active) return;

    setIsDragging(false);
    draggingRef.current = false;
    hasMovedRef.current = false;
    startXRef.current = null;
    startYRef.current = null;
    setDragX(0);

    pauseAutoplayClock();
    remainingRef.current = 0;

    setFadeTo(safe);
    setIsFading(true);

    fadeTimerRef.current = window.setTimeout(() => {
      setActive(safe);
      setFadeTo(null);
      setIsFading(false);
    }, fadeMs);
  }

  function goNextFade() {
    if (count <= 1) return;
    startFadeTo((active + 1) % count);
  }

  function goPrevFade() {
    if (count <= 1) return;
    startFadeTo((active - 1 + count) % count);
  }

  function goTo(index: number) {
    if (count <= 1) return;
    startFadeTo(index);
  }

  function shouldIgnoreGesture(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return !!el.closest('[data-carousel-control], button, a, input, textarea, select, [role="button"]');
  }

  function onPointerDown(e: React.PointerEvent) {
    if (shouldIgnoreGesture(e.target)) return;
    if (isSlideAnimating || isFading) return;
    if (count <= 1) return;

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
      if (Math.abs(dx) < deadzonePx && Math.abs(dy) < deadzonePx) return;

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

    const commit = Math.abs(dx) >= swipeThresholdPx;
    if (!commit) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    if (dx < 0) commitSwipe('next');
    else commitSwipe('prev');
  }

  // cleanup timers
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    };
  }, []);

  if (!current) return null;

  const slideTransitionClass = !isDragging && !snapping ? `transition-transform duration-[${slideMs}ms]` : '';
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const fadeItem = fadeTo != null ? items[fadeTo] : null;
  const elapsedMs = clamp(durationMs - remainingRef.current, 0, durationMs);

  const nextBtnClass =
    nextButtonPosition === 'bottom-right'
      ? 'absolute bottom-2 right-2 z-[70]'
      : 'absolute right-2 top-1/2 z-[70] -translate-y-1/2';

  return (
    <div className={className}>
      <div className={['relative w-full overflow-hidden', aspectClassName].join(' ')}>
        <div
          ref={containerRef}
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          {isFading && fadeItem ? (
            <>
              <div className="absolute inset-0">
                <picture>
                  <source srcSet={withWebp(current.src)} type="image/webp" />
                  <img
                    src={current.src}
                    alt={current.alt ?? ''}
                    className={['absolute inset-0 h-full w-full', imageClassName].join(' ')}
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
              </div>

              <div
                className={['absolute inset-0', 'transition-opacity', `duration-[${fadeMs}ms]`, 'opacity-100'].join(' ')}
                style={{ opacity: 1 }}
              >
                <picture>
                  <source srcSet={withWebp(fadeItem.src)} type="image/webp" />
                  <img
                    src={fadeItem.src}
                    alt={fadeItem.alt ?? ''}
                    className={['absolute inset-0 h-full w-full', imageClassName].join(' ')}
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
                <div className="absolute inset-0" style={{ animation: `fadeIn ${fadeMs}ms ease-out both` }} />
              </div>
            </>
          ) : (
            <>
              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${(-widthRef.current + dragX)}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(prevItem?.src ?? '')} type="image/webp" />
                  <img
                    src={prevItem?.src ?? ''}
                    alt={prevItem?.alt ?? ''}
                    className={['absolute inset-0 h-full w-full', imageClassName].join(' ')}
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
              </div>

              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${dragX}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(current.src)} type="image/webp" />
                  <img
                    src={current.src}
                    alt={current.alt ?? ''}
                    className={['absolute inset-0 h-full w-full', imageClassName].join(' ')}
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
              </div>

              <div
                className={['absolute inset-0 will-change-transform', slideTransitionClass].join(' ')}
                style={{
                  transform: `translate3d(${widthRef.current + dragX}px, 0, 0)`,
                  transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <picture>
                  <source srcSet={withWebp(nextItem?.src ?? '')} type="image/webp" />
                  <img
                    src={nextItem?.src ?? ''}
                    alt={nextItem?.alt ?? ''}
                    className={['absolute inset-0 h-full w-full', imageClassName].join(' ')}
                    loading="lazy"
                    draggable={false}
                    decoding="async"
                  />
                </picture>
              </div>
            </>
          )}

          {/* overlays */}
          {homeOverlay ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
              <div className="absolute inset-0 bg-black/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-black/10" />
          )}

          {/* progress */}
          {showProgress && count > 1 ? (
            <div className="absolute left-0 right-0 top-0 z-[60] px-3 pt-2">
              <div className="flex gap-1.5">
                {items.map((_, i) => {
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
                              ? { width: '100%', transformOrigin: 'left', transform: 'scaleX(0)', animationName: 'none' }
                              : {
                                  width: '100%',
                                  transformOrigin: 'left',
                                  transform: 'scaleX(0)',
                                  animationName: 'storyFill',
                                  animationDuration: `${durationMs}ms`,
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
          ) : null}

          {/* pause */}
          {showPauseButton && count > 1 ? (
            <div
              data-carousel-control
              className="absolute right-2 top-2 z-[70] text-white"
              onPointerDown={stop}
              onPointerUp={stop}
              onClick={stop}
            >
              <button
                type="button"
                aria-label={userPaused ? 'Ativar' : 'Pausar'}
                onClick={() => setUserPaused((v) => !v)}
                className="p-2"
                style={{ touchAction: 'manipulation' }}
              >
                {userPaused ? <PlayIcon className="h-9 w-9 text-white" /> : <PauseIcon className="h-9 w-9 text-white" />}
              </button>
            </div>
          ) : null}

          {/* arrows (igual Home) */}
          {showArrows && count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                onClick={goPrevFade}
                className="absolute left-2 top-1/2 z-[70] -translate-y-1/2 text-white"
                data-carousel-control
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
                aria-label="Próxima imagem"
                onClick={goNextFade}
                className="absolute right-2 top-1/2 z-[70] -translate-y-1/2 text-white"
                data-carousel-control
                onPointerDown={stop}
                onPointerUp={stop}
                style={{ touchAction: 'manipulation' }}
              >
                <span className="arrow-float block p-2">
                  <DoubleChevronOpen dir="right" className="h-10 w-10 scale-110" />
                </span>
              </button>
            </>
          ) : null}

          {/* next button (legado) */}
          {!showArrows && showNextButton && count > 1 ? (
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={goNextFade}
              className={[nextBtnClass, 'text-white'].join(' ')}
              data-carousel-control
              onPointerDown={stop}
              onPointerUp={stop}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="arrow-float block p-2">
                <DoubleChevronOpen dir="right" className="h-10 w-10 scale-110" />
              </span>
            </button>
          ) : null}

          {/* dots */}
          {showDots && count > 1 ? (
            <div
              data-carousel-control
              className="absolute bottom-2 left-1/2 z-[70] -translate-x-1/2"
              onPointerDown={stop}
              onPointerUp={stop}
              onClick={stop}
            >
              <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-[1px]">
                {items.map((_, i) => {
                  const isOn = i === active;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ir para imagem ${i + 1}`}
                      onClick={() => goTo(i)}
                      className={[
                        'h-2.5 w-2.5 rounded-full transition-transform',
                        isOn ? 'bg-white scale-110' : 'bg-white/55',
                      ].join(' ')}
                      style={{ touchAction: 'manipulation' }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <style jsx global>{`
          @keyframes floatArrow {
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
          .arrow-float {
            animation: floatArrow 1.8s ease-in-out infinite;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes storyFill {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
