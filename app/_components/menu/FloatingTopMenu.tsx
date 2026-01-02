'use client';

import React, { useEffect, useRef, useState } from 'react';

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star';

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

type Props = {
  categories: CategoryItem[];
  visible: boolean;

  /**
   * ✅ NOVO: abre o modal ao clicar em uma categoria
   * e envia o nome (ex: "Passeios")
   */
  onOpenModal?: (categoryName: string) => void;

  /**
   * ✅ opcional: captura a categoria clicada
   */
  onCategoryClick?: (cat: CategoryItem) => void;
};

/* =========================
   SETAS (duplas abertas) — IGUAL MenuCarousel
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
   ÍCONES — IGUAL MenuCarousel
========================= */
function Icon({ iconKey, className }: { iconKey: IconKey; className?: string }) {
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
          <path d="M7 3v7M10 3v7M8.5 10v11" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 3c2 2.4 2 4.8 0 7v11" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
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
          <path d="M7.5 9h9l-.7 10H8.2L7.5 9z" stroke="#F97316" strokeWidth="2" strokeLinejoin="round" />
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

export default function FloatingTopMenu({
  categories,
  visible,
  onOpenModal,
  onCategoryClick,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const [renderLeft, setRenderLeft] = useState(false);
  const [renderRight, setRenderRight] = useState(false);
  const [leftAnim, setLeftAnim] = useState<'enter' | 'exit'>('enter');
  const [rightAnim, setRightAnim] = useState<'enter' | 'exit'>('enter');

  const canShow = !!visible;

  function computeNavState() {
    const el = scrollerRef.current;
    if (!el) return;

    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);

    if (!overflow) {
      setCanLeft(false);
      setCanRight(false);
      return;
    }

    const tol = 6;
    const leftOk = el.scrollLeft > tol;
    const rightOk = el.scrollLeft + el.clientWidth < el.scrollWidth - tol;

    setCanLeft(leftOk);
    setCanRight(rightOk);
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    computeNavState();
    requestAnimationFrame(() => computeNavState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

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
  }, [categories.length]);

  useEffect(() => {
    if (!hasOverflow || !canShow) {
      setRenderLeft(false);
      return;
    }
    if (canLeft) {
      setRenderLeft(true);
      setLeftAnim('enter');
      return;
    }
    if (renderLeft) {
      setLeftAnim('exit');
      const t = window.setTimeout(() => setRenderLeft(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [canLeft, hasOverflow, renderLeft, canShow]);

  useEffect(() => {
    if (!hasOverflow || !canShow) {
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
  }, [canRight, hasOverflow, renderRight, canShow]);

  function go(dir: 'left' | 'right') {
    const el = scrollerRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    el.scrollBy({ left: dir === 'right' ? w : -w, behavior: 'smooth' });

    requestAnimationFrame(() => computeNavState());
    window.setTimeout(() => computeNavState(), 180);
    window.setTimeout(() => computeNavState(), 360);
  }

  function handleCategoryClick(cat: CategoryItem) {
    onCategoryClick?.(cat);
    onOpenModal?.(cat.title);
  }

  return (
    <div
      className={[
        'fixed left-0 right-0 z-[140]',
        'transition-[transform,opacity] duration-450',
        'bg-zinc-200/95 backdrop-blur-[2px]',
        canShow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{
        top: 'var(--app-header-h, 55px)',
        transform: canShow ? 'translateY(0px)' : 'translateY(-100%)',
        transitionTimingFunction: canShow
          ? 'cubic-bezier(0.16, 1, 0.3, 1)'
          : 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <section className="relative px-4 pt-0">
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-zinc-200 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-zinc-200 to-transparent" />
          <div className="absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-zinc-200 to-transparent blur-[2px]" />
        </div>

        <div className="relative z-[2]">
          {renderLeft && (
            <button
              type="button"
              onClick={() => go('left')}
              aria-label="Voltar"
              className="pointer-events-auto absolute left-1 top-1/2 z-[50] -translate-y-1/2"
            >
              <span
                className={[
                  'block text-zinc-400 hover:text-zinc-600',
                  leftAnim === 'enter' ? 'arrow-enter-left' : 'arrow-exit-left',
                ].join(' ')}
              >
                <DoubleChevronOpen dir="left" className="h-10 w-10 scale-125" />
              </span>
            </button>
          )}

          {renderRight && (
            <button
              type="button"
              onClick={() => go('right')}
              aria-label="Avançar"
              className="pointer-events-auto absolute right-1 top-1/2 z-[50] -translate-y-1/2"
            >
              <span
                className={[
                  'block text-zinc-400 hover:text-zinc-600',
                  rightAnim === 'enter' ? 'arrow-enter-right' : 'arrow-exit-right',
                ].join(' ')}
              >
                <DoubleChevronOpen dir="right" className="h-10 w-10 scale-125" />
              </span>
            </button>
          )}

          <div className="overflow-hidden">
            <div
              ref={scrollerRef}
              className={[
                'no-scrollbar',
                'flex gap-3',
                'overflow-x-auto',
                'px-1 py-2',
                'touch-manipulation',
                'overscroll-x-contain',
                'scroll-smooth',
              ].join(' ')}
              style={{ touchAction: 'pan-x pan-y' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="shrink-0 rounded-lg bg-white py-1 flex flex-col items-center gap-0 border border-neutral-200/60 w-[72px] active:scale-[0.99] touch-manipulation"
                >
                  <Icon iconKey={cat.iconKey} />
                  <span className="w-full px-2 text-center text-[11px] font-semibold leading-[1.15] text-neutral-800 line-clamp-2">
                    {cat.title}
                  </span>
                  <span className="text-[11px] text-neutral-500">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

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
