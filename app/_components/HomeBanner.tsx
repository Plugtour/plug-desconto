// caminho: app/_components/HomeBanner.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Pause, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { getFavorites, onFavoritesChange, toggleFavorite, isFavorite } from './favorites/favoritesStore';

type Props = { className?: string };

type BannerItem = {
  id: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  tag?: string;
  href?: string;
  imageUrl: string;
  align?: 'left' | 'center' | 'right';
  order?: number;
  status?: string;
};

const ROTATE_MS = 6500;

const BANNER_WIDTHS = [480, 960, 1280];
const sizes = '(max-width: 480px) 100vw, 448px';

function alignClasses(align?: BannerItem['align']) {
  if (align === 'center') return 'items-center text-center';
  if (align === 'right') return 'items-end text-right';
  return 'items-start text-left';
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function withWebp(url: string) {
  if (!url) return url;
  if (url.toLowerCase().endsWith('.webp')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}fm=webp`;
}

function addQuery(url: string, key: string, val: string | number) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
}

function variantUrl(url: string, width: number) {
  const u = withWebp(url);
  if (!u) return u;
  if (isRemoteUrl(u)) return addQuery(u, 'w', width);
  return u;
}

function buildSrcSet(url: string, widths: number[]) {
  const u = withWebp(url);
  if (!u) return '';
  if (!isRemoteUrl(u)) return '';
  return widths.map((w) => `${variantUrl(u, w)} ${w}w`).join(', ');
}

function SlideContent({ item }: { item: BannerItem }) {
  const contentAlign = alignClasses(item.align);

  // ✅ alinhamento correto:
  // - left: margem/padding à esquerda
  // - center: centralizado real (auto/auto)
  // - right: encosta no lado direito com respiro e mantém texto alinhado à direita
  const style: React.CSSProperties =
    item.align === 'left'
      ? {
          maxWidth: '78%',
          marginLeft: '24px',
          paddingLeft: '24px',
        }
      : item.align === 'right'
      ? {
          maxWidth: '78%',
          marginLeft: 'auto',
          marginRight: '24px',
          paddingRight: '24px',
        }
      : {
          maxWidth: '78%',
          marginLeft: 'auto',
          marginRight: 'auto',
        };

  return (
    <div className="pointer-events-none absolute inset-0 z-[30] py-6">
      <div className={`flex h-full flex-col justify-center gap-1 ${contentAlign}`} style={style}>
        {item.tag ? <div className="text-[11px] font-semibold text-[#7CFFB2]">{item.tag}</div> : null}

        <div className="text-[25px] font-extrabold text-white">{item.title}</div>

        {item.subtitle ? <div className="text-[16px] font-semibold text-white">{item.subtitle}</div> : null}

        {item.highlight ? <div className="text-[15px] font-semibold text-[#7CCBFF]">{item.highlight}</div> : null}

        {item.href ? <div className="mt-2 text-[15px] font-semibold text-white">Ver ofertas →</div> : null}
      </div>
    </div>
  );
}

function BannerImage({ item }: { item: BannerItem }) {
  const srcSet = buildSrcSet(item.imageUrl, BANNER_WIDTHS);
  const src = variantUrl(item.imageUrl, 480) || item.imageUrl;

  return (
    <picture>
      {srcSet ? <source srcSet={srcSet} sizes={sizes} type="image/webp" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={item.title} className="h-full w-full object-cover" draggable={false} decoding="async" />
    </picture>
  );
}

function SharePlaneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? 'h-[26px] w-[26px]'} fill="none">
      <path d="M21 3L10.2 13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M21 3l-6.7 19-3.2-7.1L4 11.7 21 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeBanner({ className }: Props) {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [active, setActive] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  // ✅ favoritos reais (store)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      const list = getFavorites();
      setFavoriteIds(new Set(list.map((x) => String(x.id))));
    };

    sync();
    const off = onFavoritesChange(sync);
    return () => off();
  }, []);

  useEffect(() => {
    let alive = true;

    fetch('/api/banners', { cache: 'no-store' as RequestCache })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;

        const raw: unknown[] = Array.isArray(data?.banners) ? data.banners : [];
        const list: BannerItem[] = raw
          .filter((b: any) => !!b && typeof b === 'object')
          .map((b: any) => ({
            id: String(b.id ?? '').trim(),
            title: String(b.title ?? '').trim() || 'Banner',
            subtitle: b.subtitle != null ? String(b.subtitle) : undefined,
            highlight: b.highlight != null ? String(b.highlight) : undefined,
            tag: b.tag != null ? String(b.tag) : undefined,
            href: b.href != null ? String(b.href) : undefined,
            imageUrl: String(b.imageUrl ?? '').trim(),
            align: b.align === 'left' || b.align === 'center' || b.align === 'right' ? b.align : undefined,
            order: Number.isFinite(Number(b.order)) ? Number(b.order) : 0,
            status: b.status != null ? String(b.status) : undefined,
          }))
          .filter((b) => !!b.id && !!b.imageUrl)
          .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
          .slice(0, 5);

        setItems(list);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const count = items.length;

  useEffect(() => {
    if (!count) return;
    setActive((v) => (v >= count ? 0 : v));
  }, [count]);

  useEffect(() => {
    if (!count) return;
    setProgress(0);
    baseRef.current = 0;
    startRef.current = performance.now();
  }, [active, count]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!count || count <= 1) return;
    if (!isPlaying) return;

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = baseRef.current + elapsed / ROTATE_MS;

      if (p >= 1) {
        baseRef.current = 0;
        setProgress(0);
        setActive((v) => (v + 1) % count);
        return;
      }

      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [count, isPlaying, active]);

  const current = useMemo(() => {
    if (!count) return null;
    const idx = active >= 0 && active < count ? active : 0;
    return items[idx] ?? null;
  }, [items, active, count]);

  if (!current) return null;

  const safeSetActive = (idx: number) => {
    if (!count) return;
    const next = ((idx % count) + count) % count;
    setActive(next);
  };

  const goPrev = () => safeSetActive(active - 1);
  const goNext = () => safeSetActive(active + 1);

  const handleTogglePlay = () => {
    if (!count || count <= 1) return;
    setIsPlaying((v) => {
      const next = !v;
      baseRef.current = progress;
      if (next) startRef.current = performance.now();
      return next;
    });
  };

  const likedNow = favoriteIds.has(String(current.id)) || isFavorite(String(current.id));

  const toggleLike = () => {
    toggleFavorite({
      id: String(current.id),
      title: String(current.title),
      href: String(current.href ?? '/'),
      imageUrl: current.imageUrl ?? null,
      subtitle: current.subtitle ?? null,
      city: null,
      priceText: null,
    });
  };

  const shareWhatsApp = () => {
    const href = current.href?.trim();
    const url = href
      ? href.startsWith('http')
        ? href
        : `${window.location.origin}${href.startsWith('/') ? href : `/${href}`}`
      : window.location.href;

    const text = `${current.title} - ${url}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(wa, '_blank', 'noopener,noreferrer');
  };

  const ICONS_TOP_PX = 25;

  return (
    <section className={className}>
      <style jsx>{`
        @keyframes pdFloatLeft {
          0%,
          100% {
            transform: translateY(-50%) translateX(0);
          }
          50% {
            transform: translateY(-50%) translateX(-7px);
          }
        }
        @keyframes pdFloatRight {
          0%,
          100% {
            transform: translateY(-50%) translateX(0);
          }
          50% {
            transform: translateY(-50%) translateX(7px);
          }
        }
      `}</style>

      <div className="relative w-full">
        <div className="relative h-[250px] w-full overflow-hidden">
          {items.map((it, idx) => {
            const isActiveSlide = idx === active;
            return (
              <div
                key={it.id}
                className={[
                  'absolute inset-0',
                  'transition-opacity duration-500 ease-out',
                  isActiveSlide ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                aria-hidden={!isActiveSlide}
              >
                <BannerImage item={it} />
                {isActiveSlide ? <SlideContent item={it} /> : null}
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-black/55 via-black/10 to-black/0" />

          {/* ✅ clique no banner inteiro (ABAIXO dos controles) */}
          {current.href ? <Link href={current.href} className="absolute inset-0 z-[20]" aria-label={current.title} /> : null}

          {/* ✅ CONTROLES SEMPRE ACIMA DO LINK */}
          <div className="pointer-events-none absolute inset-0 z-[95]">
            {/* barras */}
            <div className="pointer-events-auto absolute left-0 right-0 top-0 z-[70] px-3 pt-3">
              <div className="flex items-center gap-2">
                {Array.from({ length: count }).map((_, i) => {
                  const fill = i < active ? 1 : i > active ? 0 : Math.max(0, Math.min(1, progress || 0));
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        safeSetActive(i);
                      }}
                      className="h-[3px] flex-1 rounded-full bg-white/15 backdrop-blur-md"
                      aria-label={`Banner ${i + 1}`}
                      title={`Banner ${i + 1}`}
                    >
                      <div className="h-full rounded-full bg-white" style={{ width: `${fill * 100}%` }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* setas */}
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="pointer-events-auto absolute left-2 top-1/2 z-[95] inline-flex h-16 w-16 items-center justify-center text-white"
                  style={{ animation: 'pdFloatLeft 2.4s ease-in-out infinite' }}
                  aria-label="Anterior"
                  title="Anterior"
                >
                  <ChevronsLeft className="text-white" size={44} strokeWidth={3.4} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goNext();
                  }}
                  className="pointer-events-auto absolute right-2 top-1/2 z-[95] inline-flex h-16 w-16 items-center justify-center text-white"
                  style={{ animation: 'pdFloatRight 2.4s ease-in-out infinite' }}
                  aria-label="Próximo"
                  title="Próximo"
                >
                  <ChevronsRight className="text-white" size={44} strokeWidth={3.4} />
                </button>
              </>
            ) : null}

            {/* ícones */}
            <div className="pointer-events-auto absolute right-3 z-[95] flex items-center gap-3" style={{ top: `${ICONS_TOP_PX}px` }}>
              {/* ✅ CORAÇÃO: agora pinta TOTAL (fill) e usa vermelho padrão */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLike();
                }}
                className="inline-flex items-center justify-center"
                aria-label="Favoritar"
                title="Favoritar"
              >
                <Heart
                  size={22}
                  strokeWidth={2.6}
                  // ✅ força o preenchimento total quando favoritado
                  fill={likedNow ? 'currentColor' : 'none'}
                  className={likedNow ? 'text-red-500' : 'text-white'}
                />
              </button>

              {/* ✅ COMPARTILHAR: avião trocado pelo SVG enviado */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  shareWhatsApp();
                }}
                className="inline-flex items-center justify-center text-white"
                aria-label="Compartilhar no WhatsApp"
                title="Compartilhar no WhatsApp"
              >
                <SharePlaneIcon className="h-[26px] w-[26px]" />
              </button>

              {/* play/pause */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="inline-flex items-center justify-center text-white"
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="text-white" size={24} strokeWidth={3.2} /> : <Play className="text-white" size={24} strokeWidth={3.2} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 