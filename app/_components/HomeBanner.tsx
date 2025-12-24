'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BANNERS, type BannerItem } from '@/_data/banners';

type Props = { className?: string };

const DURATION_MS = 6500; // tempo de cada banner
const SWIPE_THRESHOLD = 45; // px para considerar swipe
const TRANSITION_MS = 420; // duração do deslize

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
  const [active, setActive] = useState(0);

  // transição suave
  const [isAnimating, setIsAnimating] = useState(false);
  const [toIndex, setToIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // progress/autoplay
  const [progress, setProgress] = useState(0); // 0..100

  // pausa do usuário (controla o ícone)
  const [userPaused, setUserPaused] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const animTimerRef = useRef<number | null>(null);

  // favoritos
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [heartPop, setHeartPop] = useState(false);

  // swipe refs
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const current = items[active];
  const nextItem = toIndex !== null ? items[toIndex] : null;

  // pausa efetiva do autoplay (usuário OU animação)
  const autoplayPaused = userPaused || isAnimating;

  // ===== favoritos localStorage =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem('plugdesconto:favorites');
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('plugdesconto:favorites', JSON.stringify(favorites));
    } catch {
      // silencioso
    }
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

  // ===== transição controlada =====
  function startTransition(targetIndex: number, dir: 'next' | 'prev') {
    if (!items.length) return;

    const safe = clamp(targetIndex, 0, items.length - 1);
    if (safe === active) return;

    if (animTimerRef.current) window.clearTimeout(animTimerRef.current);

    // ✅ IMPORTANTE: antes de trocar, "fecha" a barra atual em 100%
    setProgress(100);

    setDirection(dir);
    setToIndex(safe);
    setIsAnimating(true);

    animTimerRef.current = window.setTimeout(() => {
      setActive(safe);
      setToIndex(null);
      setIsAnimating(false);

      // ✅ agora sim, começa a próxima barra do zero
      setProgress(0);
      lastRef.current = performance.now();
    }, TRANSITION_MS);
  }

  function next() {
    const idx = (active + 1) % items.length;
    startTransition(idx, 'next');
  }

  function prev() {
    const idx = active === 0 ? items.length - 1 : active - 1;
    startTransition(idx, 'prev');
  }

  // ===== autoplay com progress estilo stories =====
  useEffect(() => {
    if (items.length <= 1) return;

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
          // ✅ garante que a barra "fecha" em 100% e só depois troca
          setTimeout(() => next(), 0);
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
  }, [autoplayPaused, active, items.length]);

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
    } catch {
      // silencioso
    }
  }

  if (!items.length || !current) return null;

  // ===== swipe handlers =====
  function shouldIgnoreGesture(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return !!el.closest('button, a, input, textarea, select, [role="button"]');
  }

  function onPointerDown(e: React.PointerEvent) {
    if (shouldIgnoreGesture(e.target)) return;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    draggingRef.current = true;

    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    e.preventDefault();
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    startXRef.current = null;
    startYRef.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0) next();
    else prev();
  }

  // slide “topo” durante a animação
  const topItem = isAnimating && nextItem ? nextItem : current;
  const topAlign = alignClasses(topItem.align);

  // ✅ barras: durante animação, mantém a barra do "active" como 100%
  const progressForActive = isAnimating ? 100 : clamp(progress, 0, 100);

  return (
    <section className={className}>
      <div className="relative w-full">
        <div
          className="relative h-[250px] w-full overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          {/* BASE */}
          <div className="absolute inset-0">
            <picture>
              <source srcSet={withWebp(current.imageUrl)} type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageUrl}
                alt={current.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </picture>
          </div>

          {/* TOP (entrando) */}
          {nextItem ? (
            <div
              className={[
                'absolute inset-0',
                'transition-transform transition-opacity',
                `duration-[${TRANSITION_MS}ms]`,
                'will-change-transform will-change-opacity',
                isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0',
                !isAnimating
                  ? direction === 'next'
                    ? 'translate-x-full'
                    : '-translate-x-full'
                  : '',
              ].join(' ')}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 0.8, 0.2, 1)' }}
            >
              <picture>
                <source srcSet={withWebp(nextItem.imageUrl)} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nextItem.imageUrl}
                  alt={nextItem.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </picture>
            </div>
          ) : null}

          {/* overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-black/10" />

          {/* progress bars */}
          <div className="absolute left-0 right-0 top-0 z-[30] px-3 pt-2">
            <div className="flex gap-1.5">
              {items.map((_, i) => {
                const filled =
                  i < active ? 100 : i === active ? progressForActive : 0;

                return (
                  <div
                    key={i}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"
                  >
                    <div className="h-full bg-white" style={{ width: `${filled}%` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* controls top-right */}
          <div className="absolute right-2 top-6 z-[40] flex items-center gap-3 text-white">
            <button
              type="button"
              aria-label={userPaused ? 'Ativar banner' : 'Pausar banner'}
              onClick={() => setUserPaused((v) => !v)}
              className="p2"
            >
              {userPaused ? (
                <PlayIcon className="h-10 w-10 text-white" />
              ) : (
                <PauseIcon className="h-10 w-10 text-white" />
              )}
            </button>

            <button type="button" aria-label="Compartilhar" onClick={onShare} className="p2 -ml-2">
              <PlaneIcon className="h-7 w-7 text-white rotate-[25deg]" />
            </button>

            <button
              type="button"
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={toggleFav}
              className="p-2"
            >
              <HeartIcon
                className={[
                  'h-8 w-8',
                  isFav ? 'text-red-500' : 'text-white',
                  heartPop ? 'heart-pop' : '',
                ].join(' ')}
                active={isFav}
              />
            </button>
          </div>

          {/* arrows */}
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={prev}
            className="absolute left-2 top-1/2 z-[45] -translate-y-1/2 text-white"
          >
            <span className="arrow-float block p-2">
              <DoubleChevronOpen dir="left" className="h-10 w-10 scale-110" />
            </span>
          </button>

          <button
            type="button"
            aria-label="Próximo banner"
            onClick={next}
            className="absolute right-2 top-1/2 z-[45] -translate-y-1/2 text-white"
          >
            <span className="arrow-float block p-2">
              <DoubleChevronOpen dir="right" className="h-10 w-10 scale-110" />
            </span>
          </button>

          {/* content */}
          <div className="absolute inset-0 z-[35] px-14 pb-4 pt-6 -translate-y-[0px]">
            <div className={`flex h-full w-full flex-col justify-end gap-1 ${topAlign}`}>
              <div
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: '#7CFFB2', textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
              >
                {topItem.tag}
              </div>

              <div
                className="text-[25px] font-extrabold leading-[1.05] text-white"
                style={{ textShadow: '0 2px 18px rgba(0,0,0,0.65)' }}
              >
                {topItem.title}
              </div>

              <div
                className="text-[16px] font-medium text-white/90"
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
              >
                {topItem.subtitle}
              </div>

              <div
                className="text-[15px] font-semibold -mt-[8px]"
                style={{ color: '#7CCBFF', textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
              >
                {topItem.highlight}
              </div>

              {topItem.href ? (
                <div className="mt-2">
                  <Link
                    href={topItem.href}
                    className="inline-flex text-[15px] font-semibold text-white -translate-y-[10px]"
                    style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
                  >
                    Ver ofertas →
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes floatArrow {
            0% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0); }
          }
          .arrow-float {
            animation: floatArrow 1.8s ease-in-out infinite;
          }

          @keyframes heartPop {
            0% { transform: scale(1); }
            30% { transform: scale(1.25); }
            60% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .heart-pop {
            animation: heartPop 320ms ease-out;
          }
        `}</style>
      </div>
    </section>
  );
}
