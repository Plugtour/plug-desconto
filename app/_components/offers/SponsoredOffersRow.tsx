'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
};

/* =========================
   ESTRELAS (preenchimento proporcional, coladas)
========================= */
function Star({ fillPct }: { fillPct: number }) {
  const id = React.useId();
  const pct = Math.max(0, Math.min(100, fillPct));

  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
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

function StarsRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return (
          <span key={i} className={i === 0 ? '' : '-ml-[3px]'}>
            <Star fillPct={fill} />
          </span>
        );
      })}
    </div>
  );
}

/* =========================
   TAGS — Cidade | Categoria | Tipo
========================= */
function buildTags(item: SponsoredOffer) {
  if (Array.isArray(item.tags) && item.tags.length === 3) {
    return item.tags.join(' | ');
  }
  return '';
}

/* =========================
   CORAÇÃO (vasado → preenchido)
========================= */
function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5.81 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
    </svg>
  );
}

/* =========================
   SETA DUPLA (mesma do menu)
========================= */
function DoubleChevronOpen({
  dir,
  className,
}: {
  dir: 'up' | 'down';
  className?: string;
}) {
  const rotate = dir === 'down' ? 'rotate(90 14 14)' : 'rotate(-90 14 14)';

  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="none">
      <g
        transform={rotate}
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
   MODAL LATERAL (entra da direita)
   + TRAVA SCROLL DO SITE ATRÁS
========================= */
function SponsoredSideModal({
  open,
  closing,
  onClose,
}: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
}) {
  // ✅ trava o scroll do site atrás enquanto o modal estiver aberto
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY || 0;

    // trava
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    // destrava + volta no mesmo ponto
    return () => {
      const top = document.body.style.top;
      const y = top ? Math.abs(parseInt(top, 10)) : scrollY;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      window.scrollTo(0, y);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={[
          'absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px] touch-manipulation',
          closing ? 'backdrop-exit' : 'backdrop-enter',
        ].join(' ')}
      />

      <div className="absolute inset-0">
        <div
          className={[
            'absolute right-0',
            'top-[50px] bottom-0',
            'w-[calc(100%-12px)] max-w-md',
            'touch-manipulation',
            closing ? 'side-exit' : 'side-enter',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={onClose}
            className={[
              'absolute left-0 -top-9',
              'touch-manipulation rounded-md',
              'bg-white/80 ring-1 ring-black/10',
              'px-3 py-1.5 text-[13px] font-normal',
              'text-red-500 hover:text-red-600 hover:bg-white',
            ].join(' ')}
          >
            Fechar
          </button>

          <div className="h-full w-full rounded-tr-none rounded-br-none rounded-bl-none rounded-tl-md bg-zinc-100 ring-1 ring-black/10">
            {/* conteúdo futuro */}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes backdropEnter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes backdropExit {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .backdrop-enter {
          animation: backdropEnter 240ms ease-out both;
        }
        .backdrop-exit {
          animation: backdropExit 240ms ease-in both;
        }

        @keyframes sideEnter {
          from {
            transform: translateX(28px);
            opacity: 0.98;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes sideExit {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(28px);
            opacity: 0.98;
          }
        }
        .side-enter {
          animation: sideEnter 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        .side-exit {
          animation: sideExit 240ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function SponsoredOffersRow({
  items,
  className,
  title = 'Patrocinado',
}: Props) {
  const shown = useMemo(() => items.slice(0, 5), [items]);

  const [favIds, setFavIds] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  const CARD_ROW_HEIGHT = 108;
  const GRADIENT_TOP_OFFSET = 14;
  const COLLAPSED_HEIGHT = Math.round(CARD_ROW_HEIGHT * 1.5) + 5;

  const contentRef = useRef<HTMLDivElement | null>(null);
  const animBoxRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [boxH, setBoxH] = useState<number>(COLLAPSED_HEIGHT);
  const heightAnimRef = useRef<Animation | null>(null);

  const [animating, setAnimating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);

  function openModal() {
    setModalOpen(true);
    setModalClosing(false);
  }

  function closeModal() {
    setModalClosing(true);
    window.setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
    }, 240);
  }

  function toggleFav(id: string) {
    setFavIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function smoothRevealAfterExpand() {
    const el = wrapperRef.current;
    if (!el) return;

    const step = () => {
      const rect = el.getBoundingClientRect();
      const viewportBottom = window.innerHeight - 12;
      if (rect.bottom > viewportBottom) {
        const delta = rect.bottom - viewportBottom;
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(step));
    window.setTimeout(step, 220);
    window.setTimeout(step, 420);
  }

  function stopHeightAnim() {
    try {
      heightAnimRef.current?.cancel();
    } catch {}
    heightAnimRef.current = null;
  }

  function animateHeight(from: number, to: number, onDone?: () => void) {
    const el = animBoxRef.current;
    if (!el) {
      setBoxH(to);
      onDone?.();
      return;
    }

    stopHeightAnim();
    setBoxH(from);

    setAnimating(true);

    const anim = el.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: 520,
      easing: 'cubic-bezier(0.22, 0.95, 0.18, 1)',
      fill: 'both',
    });

    heightAnimRef.current = anim;

    const end = () => {
      heightAnimRef.current = null;
      setBoxH(to);
      setAnimating(false);
      onDone?.();
    };

    anim.onfinish = end;
    anim.oncancel = end;
  }

  function animateTo(nextExpanded: boolean) {
    const contentEl = contentRef.current;
    const boxEl = animBoxRef.current;

    if (!contentEl || !boxEl) {
      setExpanded(nextExpanded);
      setBoxH(nextExpanded ? 9999 : COLLAPSED_HEIGHT);
      if (nextExpanded) smoothRevealAfterExpand();
      return;
    }

    const current = boxEl.getBoundingClientRect().height;
    const targetExpanded = Math.max(contentEl.scrollHeight, COLLAPSED_HEIGHT);
    const target = nextExpanded ? targetExpanded : COLLAPSED_HEIGHT;

    setExpanded(nextExpanded);

    animateHeight(current, target, () => {
      if (nextExpanded) smoothRevealAfterExpand();
    });
  }

  function toggleExpanded() {
    animateTo(!expanded);
  }

  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    dragging.current = true;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging.current || startY.current == null) return;

    const dy = e.clientY - startY.current;
    startY.current = null;
    dragging.current = false;

    const THRESH = 18;
    if (dy > THRESH && !expanded) animateTo(true);
    if (dy < -THRESH && expanded) animateTo(false);
  }

  function onPointerCancel() {
    startY.current = null;
    dragging.current = false;
  }

  if (!shown.length) return null;

  return (
    <section className={['w-full', className || ''].join(' ')}>
      <SponsoredSideModal open={modalOpen} closing={modalClosing} onClose={closeModal} />

      <div className="mb-1 px-4 text-[12px] font-medium text-zinc-500">{title}</div>

      <div ref={wrapperRef} className="relative px-3">
        <div
          ref={animBoxRef}
          className="relative overflow-hidden"
          style={{
            height: boxH,
            willChange: animating ? 'height' : undefined,
            transform: animating ? 'translateZ(0)' : undefined,
            WebkitTransform: animating ? 'translateZ(0)' : undefined,
            contain: animating ? ('layout paint' as any) : undefined,
            overflowAnchor: 'none',
          }}
        >
          <div ref={contentRef} style={{ overflowAnchor: 'none' as any }}>
            {shown.map((item, idx) => {
              const isFav = !!favIds[item.id];
              const tagsLine = buildTags(item);
              const rating = item.rating ?? 4.8;
              const reviews = item.reviews ?? 0;

              const handleCardClick = () => {
                if (idx === 0) {
                  openModal();
                  return;
                }

                if (!expanded && idx >= 1) {
                  animateTo(true);
                  return;
                }

                openModal();
              };

              const disableHeart = !expanded && idx >= 1;

              return (
                <div key={item.id} className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleCardClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleCardClick();
                    }}
                    className="block py-3 cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-zinc-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="pr-14 text-[11px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                          {item.title}
                        </div>

                        <div className="mt-[4px]">
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{tagsLine}</div>

                          {item.priceText ? (
                            <div className="-mt-[2px] text-[11px] font-medium text-zinc-900">
                              Economia de {item.priceText}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-1.5 flex items-end justify-between">
                          <div>
                            <StarsRow rating={rating} />
                            <div className="-mt-0.5 text-[11px] text-zinc-500">
                              <span className="font-semibold text-zinc-700">{rating.toFixed(1)}</span>{' '}
                              de <span className="font-semibold text-zinc-700">{reviews}</span>{' '}
                              avaliações
                            </div>
                          </div>

                          <span
                            className="text-[14px] font-semibold text-green-600"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleCardClick();
                              }
                            }}
                          >
                            Ver mais
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      disabled={disableHeart}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disableHeart) return;
                        toggleFav(item.id);
                      }}
                      className={[
                        'absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center',
                        disableHeart ? 'pointer-events-none opacity-0' : '',
                      ].join(' ')}
                      tabIndex={disableHeart ? -1 : 0}
                    >
                      <HeartIcon
                        filled={isFav}
                        className={[
                          'h-9 w-9 transition',
                          isFav ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-400',
                        ].join(' ')}
                      />
                    </button>
                  </div>

                  {idx < shown.length - 1 ? (
                    <div className="mx-2 border-b border-dotted border-zinc-300" />
                  ) : null}
                </div>
              );
            })}
          </div>

          {!expanded && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[10]"
                style={{
                  top: CARD_ROW_HEIGHT + GRADIENT_TOP_OFFSET,
                  background:
                    'linear-gradient(180deg, rgba(244,244,245,0) 0%, rgba(244,244,245,0.14) 52%, rgba(244,244,245,0.55) 78%, rgba(244,244,245,1) 100%)',
                }}
              />

              <button
                type="button"
                aria-label="Ver mais patrocinados"
                className="absolute inset-x-0 bottom-0 z-[11] pointer-events-auto"
                style={{ top: CARD_ROW_HEIGHT + GRADIENT_TOP_OFFSET }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  animateTo(true);
                }}
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleExpanded}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className="mt-3 w-full touch-manipulation select-none flex flex-col items-center justify-center gap-[5px]"
          style={{ touchAction: 'pan-y' }}
          aria-label={expanded ? 'Ver menos patrocinados' : 'Ver mais patrocinados'}
        >
          <div className="text-[15px] font-semibold text-emerald-700 hover:text-emerald-800">
            {expanded ? 'Ver menos' : 'Ver mais'}
          </div>

          <div className="text-zinc-400">
            <DoubleChevronOpen dir={expanded ? 'up' : 'down'} className="h-10 w-10" />
          </div>
        </button>
      </div>
    </section>
  );
}
