'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BannerMobile from '@/components/BannerMobile';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTextAlign(align?: BannerItem['align']) {
  if (align === 'center') return 'items-center text-center';
  if (align === 'right') return 'items-end text-right';
  return 'items-start text-left';
}

export default function BannerMobile({
  className,
  heightClassName = 'h-[170px]',
}: {
  className?: string;
  heightClassName?: string;
}) {
  const items = useMemo(() => BANNERS, []);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const target = children[index];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const idx = clamp(Math.round(el.scrollLeft / w), 0, items.length - 1);
      setActive(idx);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll as any);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section className={className}>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {items.map((b) => {
            const contentAlign = getTextAlign(b.align);
            const textTone = b.tone === 'light' ? 'text-slate-900' : 'text-white';
            const subtitleTone = b.tone === 'light' ? 'text-slate-700' : 'text-white/85';
            const overlay = b.tone === 'light' ? 'bg-white/65' : 'bg-black/35';

            const card = (
              <div className={`relative w-full shrink-0 snap-start ${heightClassName} rounded-2xl overflow-hidden`}>
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />

                <div className={`absolute inset-0 ${overlay}`} />

                <div className="relative h-full w-full p-4">
                  <div className={`flex h-full w-full flex-col justify-end gap-1 ${contentAlign}`}>
                    <div className={`text-lg font-semibold leading-tight ${textTone}`}>
                      {b.title}
                    </div>

                    {b.subtitle ? (
                      <div className={`text-sm leading-snug ${subtitleTone}`}>
                        {b.subtitle}
                      </div>
                    ) : null}

                    {b.href ? (
                      <div className={`mt-2 text-xs font-medium ${textTone}`}>
                        Ver ofertas →
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );

            return (
              <div key={b.id} className="w-full shrink-0">
                {b.href ? (
                  <Link href={b.href} className="block">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>

        {items.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? 'w-6 bg-slate-900/80' : 'w-2 bg-slate-900/25'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
