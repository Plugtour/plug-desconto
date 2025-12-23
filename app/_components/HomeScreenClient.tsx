'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* =========================
   TIPOS
========================= */

type OfferLike = any;

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star';

/* =========================
   SCROLL SUAVE (resposta imediata ao clique)
========================= */

function smoothScrollTo(el: HTMLElement, targetLeft: number, duration = 900) {
  const start = el.scrollLeft;
  const change = targetLeft - start;

  // mexe já no primeiro frame (reduz sensação de delay)
  el.scrollLeft = start + change * 0.03;

  const startTime = performance.now();

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now: number) {
    const elapsed = now - startTime;
    const p = Math.min(1, elapsed / duration);
    el.scrollLeft = start + change * easeOutCubic(p);
    if (p < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* =========================
   SETAS (duplas, abertas, sem fundo)
========================= */

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

/* =========================
   ÍCONES (SVG sem fundo, cor no próprio ícone)
========================= */

function Icon({
  iconKey,
  className,
}: {
  iconKey: IconKey;
  className?: string;
}) {
  const common = 'h-5 w-5';
  const cls = className ? `${common} ${className}` : common;

  switch (iconKey) {
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z"
            stroke="#22C55E"
            strokeWidth="2"
          />
        </svg>
      );
    case 'ticket':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M6.5 8.2h11c.7 0 1.3.6 1.3 1.3v1a2 2 0 0 0 0 4v1c0 .7-.6 1.3-1.3 1.3h-11c-.7 0-1.3-.6-1.3-1.3v-1a2 2 0 0 0 0-4v-1c0-.7.6-1.3 1.3-1.3z"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 9.5v7" stroke="#F59E0B" strokeWidth="2" />
        </svg>
      );
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M12 3l1.8 5 5 1.7-5 1.8-1.8 5-1.7-5-5-1.8 5-1.7L12 3z"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M18.2 13.6l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'fork':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M7 3v7M10 3v7M8.5 10v11"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 3c2 2.4 2 4.8 0 7v11"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'bed':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M5 11.2V9.2c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"
            stroke="#A855F7"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M5 12h14v6.8M5 18.8v-2.2M19 18.8v-2.2"
            stroke="#A855F7"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M8 12v-1.6M16 12v-1.6" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'bag':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M7.5 9h9l-.7 10H8.2L7.5 9z"
            stroke="#F97316"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 9c0-2 1.2-3.2 2.8-3.2S14.8 7 14.8 9"
            stroke="#F97316"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'car':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M6.5 11l1.6-3.5c.2-.5.7-.8 1.2-.8h5.4c.5 0 1 .3 1.2.8L18.5 11"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M6 11h12v6H6v-6z" stroke="#06B6D4" strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M8 17.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM16 17.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"
            stroke="#06B6D4"
            strokeWidth="2"
          />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none">
          <path
            d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
            stroke="#EAB308"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */

export default function HomeScreenClient({
  regionLabel = 'Serra Gaúcha',
  offers = [],
}: {
  regionLabel?: string;
  offers: OfferLike[];
}) {
  const categories: CategoryItem[] = useMemo(
    () => [
      { id: 'passeios', title: 'Passeios', count: 23, iconKey: 'pin' },
      { id: 'ingressos', title: 'Ingressos', count: 31, iconKey: 'ticket' },
      { id: 'servicos', title: 'Serviços', count: 12, iconKey: 'spark' },
      { id: 'gastronomia', title: 'Gastronomia', count: 8, iconKey: 'fork' },

      { id: 'hospedagem', title: 'Hospedagem', count: 5, iconKey: 'bed' },
      { id: 'compras', title: 'Compras', count: 10, iconKey: 'bag' },
      { id: 'transfers', title: 'Transfers', count: 14, iconKey: 'car' },
      { id: 'atracoes', title: 'Atrações', count: 9, iconKey: 'star' },

      { id: 'passeios2', title: 'Passeios', count: 11, iconKey: 'pin' },
      { id: 'ingressos2', title: 'Ingressos', count: 7, iconKey: 'ticket' },
      { id: 'servicos2', title: 'Serviços', count: 6, iconKey: 'spark' },
      { id: 'gastronomia2', title: 'Gastronomia', count: 4, iconKey: 'fork' },

      { id: 'hospedagem2', title: 'Hospedagem', count: 3, iconKey: 'bed' },
      { id: 'compras2', title: 'Compras', count: 8, iconKey: 'bag' },
      { id: 'transfers2', title: 'Transfers', count: 5, iconKey: 'car' },
      { id: 'atracoes2', title: 'Atrações', count: 6, iconKey: 'star' },
    ],
    []
  );

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);

  // estado real: pode rolar?
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // estado visual (para permitir animação de saída antes de desmontar)
  const [renderLeft, setRenderLeft] = useState(false);
  const [renderRight, setRenderRight] = useState(false);
  const [leftAnim, setLeftAnim] = useState<'enter' | 'exit'>('enter');
  const [rightAnim, setRightAnim] = useState<'enter' | 'exit'>('enter');

  const pagesCount = Math.max(1, Math.ceil(categories.length / 8));

  function computeNavState() {
    const el = scrollerRef.current;
    if (!el) return;

    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);

    if (!overflow) {
      setCanLeft(false);
      setCanRight(false);
      setPage(0);
      return;
    }

    const w = el.clientWidth || 1;
    const p = Math.round(el.scrollLeft / w);
    setPage(Math.max(0, Math.min(pagesCount - 1, p)));

    // tolerância um pouco maior para evitar “falso positivo” no início
    const tol = 10;

    const leftOk = el.scrollLeft > tol;
    const rightOk = el.scrollLeft + el.clientWidth < el.scrollWidth - tol;

    setCanLeft(leftOk);
    setCanRight(rightOk);
  }

  // garante que inicia no começo e calcula (evita bug de carregar no meio)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    computeNavState();
    requestAnimationFrame(() => computeNavState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => computeNavState();
    el.addEventListener('scroll', onScroll, { passive: true });

    computeNavState();

    const ro = new ResizeObserver(() => computeNavState());
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesCount]);

  // controla render/animação (ESQUERDA)
  useEffect(() => {
    if (!hasOverflow) {
      setRenderLeft(false);
      return;
    }

    if (canLeft) {
      setRenderLeft(true);
      setLeftAnim('enter');
      return;
    }

    // se estava renderizando, faz saída e desmonta depois
    if (renderLeft) {
      setLeftAnim('exit');
      const t = window.setTimeout(() => setRenderLeft(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [canLeft, hasOverflow, renderLeft]);

  // controla render/animação (DIREITA)
  useEffect(() => {
    if (!hasOverflow) {
      setRenderRight(false);
      return;
    }

    if (canRight) {
      setRenderRight(true);
      setRightAnim('enter');
      return;
    }

    if (renderRight) {
      setRightAnim('exit');
      const t = window.setTimeout(() => setRenderRight(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [canRight, hasOverflow, renderRight]);

  function go(dir: 'left' | 'right') {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const target = dir === 'left' ? el.scrollLeft - w : el.scrollLeft + w;
    smoothScrollTo(el, Math.max(0, target), 900);
  }

  return (
    <div className="mx-auto w-full max-w-md bg-zinc-100">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-center">
          <button className="text-2xl font-extrabold text-zinc-800">
            {regionLabel}
            <span className="ml-2 text-zinc-500">⌄</span>
          </button>
        </div>

        <div className="mt-3 border-t border-zinc-300" />
      </div>

      <section className="relative px-4 pt-4">
        {/* Esfumaçado/blur (fade) nas laterais + inferior */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-zinc-100 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-zinc-100 to-transparent" />
          <div className="absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-zinc-100 to-transparent blur-[2px]" />
        </div>

        {/* ESQUERDA: só aparece depois que começar a rolar */}
        {renderLeft && (
          <button
            type="button"
            onClick={() => go('left')}
            aria-label="Voltar"
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2"
          >
            <span
              className={[
                'block text-zinc-400 hover:text-zinc-600',
                leftAnim === 'enter' ? 'arrow-enter-left' : 'arrow-exit-left',
              ].join(' ')}
            >
              <DoubleChevronOpen dir="left" className="h-12 w-12" />
            </span>
          </button>
        )}

        {/* DIREITA: aparece no início (se tiver rolagem) e some no final */}
        {renderRight && (
          <button
            type="button"
            onClick={() => go('right')}
            aria-label="Avançar"
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2"
          >
            <span
              className={[
                'block text-zinc-400 hover:text-zinc-600',
                rightAnim === 'enter' ? 'arrow-enter-right' : 'arrow-exit-right',
              ].join(' ')}
            >
              <DoubleChevronOpen dir="right" className="h-12 w-12" />
            </span>
          </button>
        )}

        {/* Scroller */}
        <div
          ref={scrollerRef}
          className="no-scrollbar relative z-[2] grid auto-cols-[100%] grid-flow-col overflow-x-auto scroll-smooth snap-x snap-mandatory px-1"
        >
          {Array.from({ length: pagesCount }).map((_, pageIndex) => (
            <div key={pageIndex} className="snap-start grid grid-cols-4 gap-3 py-2 px-1">
              {categories.slice(pageIndex * 8, pageIndex * 8 + 8).map((cat, i) => {
                const isActive = pageIndex === 0 && i === 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={[
                      'rounded-xl bg-white',
                      'py-1',
                      'flex flex-col items-center',
                      'gap-0',
                      'border border-neutral-200/60',
                      isActive ? 'ring-1 ring-amber-200 bg-amber-50/40' : '',
                    ].join(' ')}
                  >
                    <Icon iconKey={cat.iconKey} />
                    <span className="w-full px-2 text-center text-[11px] font-semibold leading-[1.15] text-neutral-800 line-clamp-2">
                      {cat.title}
                    </span>
                    <span className="text-[11px] text-neutral-500">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Indicador */}
        <div className="mt-4 flex justify-center">
          <div className="h-2 w-10 rounded-full bg-zinc-300/80">
            <div
              className="h-2 rounded-full bg-zinc-700 transition-all duration-200"
              style={{
                width: `${100 / pagesCount}%`,
                transform: `translateX(${page * 100}%)`,
              }}
            />
          </div>
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          /* ENTER: seta aparece vindo da lateral */
          @keyframes arrowEnterLeft {
            from {
              transform: translateX(-18px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 0.9;
            }
          }
          @keyframes arrowEnterRight {
            from {
              transform: translateX(18px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 0.9;
            }
          }

          /* EXIT: seta desaparece saindo pela lateral */
          @keyframes arrowExitLeft {
            from {
              transform: translateX(0);
              opacity: 0.9;
            }
            to {
              transform: translateX(-18px);
              opacity: 0;
            }
          }
          @keyframes arrowExitRight {
            from {
              transform: translateX(0);
              opacity: 0.9;
            }
            to {
              transform: translateX(18px);
              opacity: 0;
            }
          }

          .arrow-enter-left {
            animation: arrowEnterLeft 220ms ease-out both;
          }
          .arrow-enter-right {
            animation: arrowEnterRight 220ms ease-out both;
          }

          .arrow-exit-left {
            animation: arrowExitLeft 220ms ease-in both;
          }
          .arrow-exit-right {
            animation: arrowExitRight 220ms ease-in both;
          }
        `}</style>
      </section>
    </div>
  );
}
