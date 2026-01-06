// app/_components/product/tabs/ProductDetailUI.tsx
'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ProductModalData } from '../ProductDetailContent';

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative h-10 flex-1 rounded-md text-[13px] font-semibold',
        'bg-zinc-600 text-white',
        active ? '' : 'opacity-80',
        'shadow-sm',
      ].join(' ')}
    >
      <span className="relative z-[1]">{children}</span>
      {active ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-yellow-400" /> : null}
    </button>
  );
}

export function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['text-[15px] font-extrabold text-zinc-700', className].join(' ')}>{children}</div>;
}

export function ChevronYellow({ dir }: { dir: 'left' | 'right' }) {
  const flip = dir === 'left' ? 'scale(-1,1)' : undefined;
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" style={{ transform: flip }}>
      <path
        d="M8.5 5.5 16 12l-7.5 6.5"
        fill="none"
        stroke="#facc15"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.11 17.56c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.41.12-.54.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26 0 1.33.97 2.61 1.11 2.79.13.18 1.91 2.92 4.62 4.09.65.28 1.16.44 1.56.56.65.21 1.24.18 1.7.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.16.16-1.28-.06-.12-.25-.2-.52-.34z"
      />
      <path
        fill="currentColor"
        d="M16.02 5.33c-5.89 0-10.69 4.8-10.69 10.69 0 1.88.49 3.71 1.43 5.33L5.2 26.67l5.47-1.44a10.64 10.64 0 0 0 5.35 1.46c5.89 0 10.69-4.8 10.69-10.69 0-5.89-4.8-10.67-10.69-10.67zm0 19.54c-1.7 0-3.36-.46-4.8-1.33l-.35-.2-3.24.86.87-3.16-.22-.33a8.84 8.84 0 0 1-1.43-4.78c0-4.88 3.97-8.85 8.85-8.85 4.88 0 8.85 3.97 8.85 8.85 0 4.88-3.97 8.94-8.85 8.94z"
      />
    </svg>
  );
}

export function StarsRow({ rating, sizeClass = 'h-[19px] w-[19px]' }: { rating: number; sizeClass?: string }) {
  const r = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return (
          <span key={i} className={i === 0 ? '' : '-ml-[3px]'}>
            <Star fillPct={fill} className={sizeClass} />
          </span>
        );
      })}
    </div>
  );
}

export function Star({ fillPct, className }: { fillPct: number; className?: string }) {
  const id = React.useId();
  const pct = Math.max(0, Math.min(100, fillPct));

  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-[19px] w-[19px]'} aria-hidden="true">
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

export function CalendarBlock({
  cal,
  noOuterBorder = false,
}: {
  cal: NonNullable<ProductModalData['calendar']>;
  noOuterBorder?: boolean;
}) {
  const days =
    cal.days?.length === 7
      ? cal.days
      : [
          { key: 'seg', label: 'seg' },
          { key: 'ter', label: 'ter' },
          { key: 'qua', label: 'qua' },
          { key: 'qui', label: 'qui' },
          { key: 'sex', label: 'sex' },
          { key: 'sáb', label: 'sáb' },
          { key: 'dom', label: 'dom' },
        ];

  const todayKey = (() => {
    const map = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;
    return map[new Date().getDay()];
  })();

  const activeBg = '#17BA60';
  const softGreen = 'rgba(23, 186, 96, 0.18)';

  // refs para posicionar a seta entre "Noite" (coluna do dia) e "Hoje" (card final)
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const todayNightCellRef = useRef<HTMLDivElement | null>(null);
  const todayHojeCellRef = useRef<HTMLDivElement | null>(null);

  const [arrowPos, setArrowPos] = useState<{ left: number; top: number } | null>(null);

  const computeArrow = () => {
    const wrap = wrapRef.current;
    const night = todayNightCellRef.current;
    const hoje = todayHojeCellRef.current;
    if (!wrap || !night || !hoje) return;

    const wr = wrap.getBoundingClientRect();
    const nr = night.getBoundingClientRect();
    const hr = hoje.getBoundingClientRect();

    // centro da coluna (X)
    const centerX = nr.left + nr.width / 2;

    // meio do “vão” entre Noite (embaixo) e Hoje (em cima)
    const gapMidY = (nr.bottom + hr.top) / 2;

    setArrowPos({
      left: centerX - wr.left,
      top: gapMidY - wr.top,
    });
  };

  useLayoutEffect(() => {
    computeArrow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, cal.nightRow]);

  useEffect(() => {
    const onResize = () => computeArrow();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => computeArrow());
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={noOuterBorder ? 'bg-transparent p-0' : 'rounded-[10px] border border-black/10 bg-zinc-100 p-2'}>
      <div ref={wrapRef} className="relative">
        {/* ✅ seta apontando pra CIMA, entre Noite e Hoje (mesma cor do card "Hoje") */}
        {arrowPos ? (
          <div
            className="pointer-events-none absolute z-[20]"
            style={{
              left: arrowPos.left,
              top: arrowPos.top,
              transform: 'translate(-50%,-50%)',
            }}
            aria-hidden="true"
          >
            <div
              className="h-0 w-0"
              style={{
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: `11px solid ${activeBg}`,
                filter: 'drop-shadow(0 0px 0 rgba(0,0,0,0.12))',
              }}
            />
          </div>
        ) : null}

        <div className="grid grid-cols-8 gap-1 text-center text-[12px] font-semibold text-zinc-700">
          <div />

          {/* Header (dias) */}
          {days.map((d) => {
            const isToday = d.key === todayKey;
            return (
              <div
                key={d.key}
                className={['rounded py-1 text-white', isToday ? '' : 'bg-zinc-500/70'].join(' ')}
                style={isToday ? { backgroundColor: activeBg } : undefined}
                aria-current={isToday ? 'date' : undefined}
              >
                {d.label}
              </div>
            );
          })}

          <div className="rounded bg-zinc-500/70 py-1 text-white">Dia</div>
          {(cal.dayRow ?? []).slice(0, 7).map((ok, i) => {
            const isTodayCol = days[i]?.key === todayKey;
            return <Cell key={`d-${i}`} ok={ok} highlight={isTodayCol} highlightBg={softGreen} />;
          })}

          <div className="rounded bg-zinc-500/70 py-1 text-white">Noite</div>
          {(cal.nightRow ?? []).slice(0, 7).map((ok, i) => {
            const isTodayCol = days[i]?.key === todayKey;
            return (
              <Cell
                key={`n-${i}`}
                ok={ok}
                highlight={isTodayCol}
                highlightBg={softGreen}
                elRef={
                  isTodayCol
                    ? (n) => {
                        todayNightCellRef.current = n;
                      }
                    : null
                }
              />
            );
          })}

          {/* "Hoje" no fim da coluna */}
          <div />
          {days.map((d) => {
            const isToday = d.key === todayKey;
            return (
              <div
                key={`h-${d.key}`}
                ref={
                  isToday
                    ? (n) => {
                        todayHojeCellRef.current = n;
                      }
                    : null
                }
                className={['rounded py-1', isToday ? 'text-white' : 'bg-transparent'].join(' ')}
                style={isToday ? { backgroundColor: activeBg } : undefined}
              >
                <span
                  className={[
                    'block text-[11px] font-extrabold leading-none',
                    isToday ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  Hoje
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Cell({
  ok,
  highlight = false,
  highlightBg = 'rgba(23, 186, 96, 0.18)',
  elRef,
}: {
  ok: boolean;
  highlight?: boolean;
  highlightBg?: string;
  elRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={elRef}
      className="grid place-items-center rounded py-1"
      style={{ backgroundColor: highlight ? highlightBg : '#e4e4e7' }}
    >
      <span className={ok ? 'text-emerald-600' : 'text-red-500'}>{ok ? '✓' : '✕'}</span>
    </div>
  );
}

/**
 * TimeCard
 */
export function TimeCard({
  time,
  offLabel,
  enabled = true,
  active = false,
}: {
  time: string;
  offLabel: string;
  enabled?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={[
        'min-w-[86px] rounded-[6px] border border-black/15 p-2 text-center',
        active ? 'bg-[#007A55]/30' : 'bg-zinc-100',
        enabled ? '' : 'opacity-45',
      ].join(' ')}
      aria-current={active ? 'true' : undefined}
    >
      <div className="text-[11px] font-semibold text-zinc-700">{time}</div>
      <div className="mt-0.5 text-[11px] font-extrabold text-red-500">{offLabel || '-'}</div>

      <button
        type="button"
        className={[
          'mt-1 w-full rounded-[6px] py-1 text-[11px] font-semibold',
          active ? 'bg-[#17BA60] text-white' : 'bg-zinc-200 text-zinc-800',
        ].join(' ')}
      >
        Utilizar
      </button>
    </div>
  );
}

export function AccordionItem({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => setH(el.scrollHeight || 0);
    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-full',
          'rounded-[6px]',
          'bg-zinc-600',
          'px-3 py-2',
          'text-left',
          'text-[13px] font-extrabold text-white',
          'flex items-center justify-between',
          'active:scale-[0.99]',
        ].join(' ')}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="ml-3 grid h-6 w-6 place-items-center rounded bg-white/10">
          {open ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>

      <div
        className={[
          'overflow-hidden',
          'transition-[max-height,opacity,transform] duration-[520ms] ease-out',
          open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible',
        ].join(' ')}
        style={{ maxHeight: open ? h : 0 }}
        aria-hidden={!open}
      >
        <div ref={innerRef} className="pt-2">
          <div className="rounded-[6px] border border-black/10 bg-white p-3 text-[13px] leading-[16px] text-zinc-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
