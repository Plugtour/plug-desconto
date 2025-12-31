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
        'bg-zinc-100/95 backdrop-blur-[2px]',
        className ?? '',
      ].join(' ')}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: `calc(${heightPx}px + env(safe-area-inset-bottom))`,
      }}
      aria-label="Menu inferior"
    >
      <div className="mx-auto w-full max-w-md h-full">
        <div className="grid h-full grid-cols-4 px-2">
          {items.map((it) => {
            const isActive =
              pathname === it.href || (it.href !== '/' && pathname?.startsWith(it.href));

            return (
              <Link
                key={it.id}
                href={it.href}
                className={[
                  'relative flex items-center justify-center',
                  'touch-manipulation select-none',
                  'active:scale-[0.99]',
                ].join(' ')}
              >
                {/* Conteúdo */}
                <div
                  className={[
                    'flex flex-col items-center justify-center gap-1',
                    'transition-colors duration-150',
                    isActive ? 'text-emerald-700' : 'text-zinc-500',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center justify-center">
                    <IconForKey icon={it.icon} className="h-6 w-6" />
                  </span>

                  <span className="text-[11px] font-semibold leading-none">
                    {it.label}
                  </span>
                </div>

                {/* Linha decorativa inferior (ativo) */}
                {isActive && (
                  <span
                    className={[
                      'pointer-events-none',
                      'absolute bottom-[6px]',
                      'h-[2px] w-6 rounded-full',
                      'bg-emerald-600',
                    ].join(' ')}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
