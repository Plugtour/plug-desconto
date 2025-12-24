'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BANNERS, type BannerItem } from '@/_data/banners';

type Props = { className?: string };

const DURATION_MS = 6500; // tempo de cada banner

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

export default function HomeBanner({ className }: Props) {
  const items = useMemo(() => BANNERS.slice(0, 3), []);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0..100
  const [paused, setPaused] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const current = items[active];

  // favoritos
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const isFav = !!favorites[current?.id ?? ''];

  // animação do slide (para visualizar o deslize)
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [slideKey, setSlideKey] = useState(0);

  // ===== SWIPE (touch) =====
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const SWIPE_THRESHOLD_PX = 48;
  const VERTICAL_TOLERANCE_PX = 70;

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    isSwiping.current = true;
    setPaused(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isSwiping.current) return;
    if (touchStartX.current === null || touchStartY.current === null) return;

    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    // se for muito vertical, libera scroll da página
    if (Math.abs(dy) > VERTICAL_TOLERANCE_PX && Math.abs(dy) > Math.abs(dx)) {
      isSwiping.current = false;
      return;
    }

    // horizontal claro -> evita "briga" com scroll
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!isSwiping.current) {
      setPaused(false);
      return;
    }
    isSwiping.current = false;

    const endX = e.changedTouches[0]?.clientX ?? null;
    const startX = touchStartX.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (startX === null || endX === null) {
      setPaused(false);
      return;
    }

    const dx = endX - startX;

    if (dx <= -SWIPE_THRESHOLD_PX) {
      next();
    } else if (dx >= SWIPE_THRESHOLD_PX) {
      prev();
    }

    setTimeout(() => setPaused(false), 150);
  }

  // carrega favoritos do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('plugdesconto:favorites');
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // silencioso
    }
  }, []);

  // salva favoritos no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('plugdesconto:favorites', JSON.stringify(favorites));
    } catch {
      // silencioso
    }
  }, [favorites]);

  function toggleFav() {
    const id = current?.id;
    if (!id) return;

    setFavorites((prev) => {
      const nextFav = !prev[id];

      // animação só ao ATIVAR
      if (nextFav) {
        setHeartPulseKey((k) => k + 1);
      }

      return { ...prev, [id]: nextFav };
    });
  }

  const [heartPulseKey, setHeartPulseKey] = useState(0);

  function goTo(index: number, dir: 'next' | 'prev') {
    const nextIndex = clamp(index, 0, items.length - 1);
    setSlideDir(dir);
    setSlideKey((k) => k + 1);
    setActive(nextIndex);
    setProgress(0);
    lastRef.current = performance.now();
  }

  function next() {
    goTo((active + 1) % items.length, 'next');
  }

  function prev() {
    goTo(active === 0 ? items.length - 1 : active - 1, 'prev');
  }

  // autoplay com progress estilo stories
  useEffect(() => {
    if (items.length <= 1) return;

    function tick(now: number) {
      if (paused) {
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
          setTimeout(() => next(), 0);
          return 0;
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
  }, [paused, active, items.length]);

  async function onShare() {
    try {
      const url =
        typeof window !== 'undefined'
          ? (current?.href
              ? new URL(current.href, window.location.origin).toString()
              : window.location.href)
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

  if (!items.length) return null;

  const contentAlign = alignClasses(current?.align);

  return (
    <section className={className}>
      <div className="relative w-full">
        {/* CARD FULL */}
        <div
          className="relative h-[250px] w-full overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {/* SLIDE WRAPPER (para visualizar o deslize) */}
          <div
            key={slideKey}
            className={[
              'absolute inset-0',
              slideDir === 'next' ? 'banner-slide-in-next' : 'banner-slide-in-prev',
            ].join(' ')}
          >
            {/* imagem */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-black/10" />

            {/* conteúdo */}
            <div className="absolute inset-0 z-[35] px-14 pb-4 pt-6 -translate-y-[0px]">
              <div className={`flex h-full w-full flex-col justify-end gap-1 ${contentAlign}`}>
                <div
                  className="text-[11px] font-semibold tracking-wide"
                  style={{
                    color: '#7CFFB2',
                    textShadow: '0 2px 16px rgba(0,0,0,0.55)',
                  }}
                >
                  {current.tag}
                </div>

                <div
                  className="text-[25px] font-extrabold leading-[1.05] text-white"
                  style={{ textShadow: '0 2px 18px rgba(0,0,0,0.65)' }}
                >
                  {current.title}
                </div>

                <div
                  className="text-[16px] font-medium text-white/90"
                  style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
                >
                  {current.subtitle}
                </div>

                <div
                  className="text-[15px] font-semibold -mt-[8px]"
                  style={{
                    color: '#7CCBFF',
                    textShadow: '0 2px 14px rgba(0,0,0,0.55)',
                  }}
                >
                  {current.highlight}
                </div>

                {current.href ? (
                  <div className="mt-2">
                    <Link
                      href={current.href}
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

          {/* barras de progresso */}
          <div className="absolute left-0 right-0 top-0 z-[30] px-3 pt-2">
            <div className="flex gap-1.5">
              {items.map((_, i) => {
                const filled = i < active ? 100 : i === active ? clamp(progress, 0, 100) : 0;
                return (
                  <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                    <div className="h-full bg-white" style={{ width: `${filled}%` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* controles top-right */}
          <div className="absolute right-2 top-6 z-[40] flex items-center gap-3 text-white">
            <button
              type="button"
              aria-label={paused ? 'Ativar banner' : 'Pausar banner'}
              onClick={() => setPaused((v) => !v)}
              className="p2"
            >
              {paused ? <PlayIcon className="h-10 w-10 text-white" /> : <PauseIcon className="h-10 w-10 text-white" />}
            </button>

            <button
              type="button"
              aria-label="Compartilhar"
              onClick={onShare}
              className="p2 -ml-2"
            >
              <PlaneIcon className="h-7 w-7 text-white rotate-[25deg]" />
            </button>

            <button
              type="button"
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={toggleFav}
              className="p-2"
            >
              <HeartIcon
                key={`${current.id}-${heartPulseKey}`}
                className={[
                  'h-8 w-8',
                  isFav ? 'text-red-500 heart-pop' : 'text-white',
                ].join(' ')}
                active={isFav}
              />
            </button>
          </div>

          {/* setas */}
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

          /* pulsar somente ao ATIVAR */
          @keyframes heartPop {
            0% { transform: scale(1); }
            30% { transform: scale(1.25); }
            60% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .heart-pop {
            animation: heartPop 320ms ease-out;
          }

          /* deslize visível e suave */
          @keyframes slideInNext {
            0% { transform: translateX(18px); opacity: 0.65; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInPrev {
            0% { transform: translateX(-18px); opacity: 0.65; }
            100% { transform: translateX(0); opacity: 1; }
          }
          .banner-slide-in-next {
            animation: slideInNext 420ms cubic-bezier(.22,.9,.22,1);
          }
          .banner-slide-in-prev {
            animation: slideInPrev 420ms cubic-bezier(.22,.9,.22,1);
          }
        `}</style>
      </div>
    </section>
  );
}
