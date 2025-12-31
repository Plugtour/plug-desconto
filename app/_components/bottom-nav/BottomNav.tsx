// app/_components/bottom-nav/BottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { BottomNavItem } from './types';
import { IconForKey } from './icons';

type Props = {
  items: BottomNavItem[];
  className?: string;

  /**
   * altura do rodapé (px) para você reaproveitar em padding-bottom do conteúdo,
   * se quiser (ex: 74).
   */
  heightPx?: number;
};

export default function BottomNav({ items, className, heightPx = 74 }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={[
        'fixed left-0 right-0 bottom-0 z-[140]',
        'border-t border-black/10',
        'bg-zinc-100',
        className ?? '',
      ].join(' ')}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: `calc(${heightPx}px + env(safe-area-inset-bottom))`,
      }}
      aria-label="Menu inferior"
    >
      <div className="mx-auto w-full max-w-md h-full">
        <div className="grid h-full grid-cols-5 px-2">
          {items.map((it) => {
            const isActive =
              pathname === it.href ||
              (it.href !== '/' && pathname?.startsWith(it.href));

            return (
              <Link
                key={it.id}
                href={it.href}
                className={[
                  'relative flex flex-col items-center justify-center gap-1',
                  'touch-manipulation select-none',
                  'active:scale-[0.99]',
                  // 🔹 micro-interação de fundo + texto
                  'transition-[background-color,color] duration-200 ease-out',
                  isActive
                    ? 'bg-zinc-200 text-emerald-700'
                    : 'bg-transparent text-zinc-500',
                ].join(' ')}
              >
                <span className="inline-flex items-center justify-center">
                  <IconForKey icon={it.icon} className="h-6 w-6" />
                </span>

                <span className="text-[11px] font-semibold leading-none">
                  {it.label}
                </span>

                {/* Underline animado */}
                <span
                  className={[
                    'pointer-events-none absolute bottom-[6px]',
                    'h-[2px] w-6 rounded-full bg-emerald-600',
                    'transition-all duration-200 ease-out',
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-1',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
