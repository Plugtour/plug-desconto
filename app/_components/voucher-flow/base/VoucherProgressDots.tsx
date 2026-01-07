// app/_components/voucher-flow/base/VoucherProgressDots.tsx
'use client';

import React from 'react';

type Props = {
  /** step atual (1 a n) */
  current: number;

  /** total de steps */
  total: number;

  /** centraliza ou alinha */
  align?: 'center' | 'left' | 'right';
};

export default function VoucherProgressDots({
  current,
  total,
  align = 'center',
}: Props) {
  if (total <= 1) return null;

  // normaliza current para evitar valores fora do range
  const safeCurrent = Math.max(1, Math.min(current, total));

  const alignClass =
    align === 'left'
      ? 'justify-start'
      : align === 'right'
      ? 'justify-end'
      : 'justify-center';

  return (
    <div
      className={`flex ${alignClass} gap-2 px-4 py-2`}
      aria-hidden="true"
    >
      {Array.from({ length: total }).map((_, i) => {
        const index = i + 1;
        const active = index === safeCurrent;
        const passed = index < safeCurrent;

        return (
          <span
            key={index}
            aria-current={active ? 'step' : undefined}
            className={[
              'h-2 w-2 rounded-full transition-all',
              active
                ? 'bg-emerald-600'
                : passed
                ? 'bg-emerald-300'
                : 'bg-black/20',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
