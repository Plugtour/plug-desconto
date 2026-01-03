// app/_components/offers/SponsoredOffersRow.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import type { SponsoredOffer } from '../../../_data/sponsoredOffers';
import OfferEconomyLine from './OfferEconomyLine';

// ✅ Modal 2 (por enquanto idêntico ao Modal 1)
import MenuCarouselModalRight from '../modals/MenuCarouselModalRight';

// ✅ store global de favoritos
import { getFavorites, onFavoritesChange, toggleFavorite } from '../favorites/favoritesStore';

/* =========================
   HELPERS
========================= */
function safeHref(v: any) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : '/';
}

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
  if (Array.isArray((item as any).tags) && (item as any).tags.length === 3) {
    return (item as any).tags.join(' | ');
  }
  return '';
}

/* =========================
   CORAÇÃO (vasado → preenchido)
========================= */
function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
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
      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
    </svg>
  );
}

/* =========================
   SETA DUPLA (mesma do menu)
========================= */
function DoubleChevronOpen({ dir, className }: { dir: 'up' | 'down'; className?: string }) {
  const rotate = dir === 'down' ? 'rotate(90 14 14)' : 'rotate(-90 14 14)';

  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true" fill="none">
      <g transform={rotate} stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 7.5 14.5 14 9 20.5" />
        <path d="M15 7.5 20.5 14 15 20.5" />
      </g>
    </svg>
  );
}

function buildFavMapFromStore(): Record<string, boolean> {
  const list = getFavorites?.() ?? [];
  const map: Record<string, boolean> = {};
  for (const it of list as any[]) {
    const id = String((it as any)?.id ?? '');
    if (id) map[id] = true;
  }
  return map;
}

type Props = {
  items: SponsoredOffer[];
  className?: string;
  title?: string;
};

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function SponsoredOffersRow({ items, className, title = 'Patrocinado' }: Props) {
  const shown = useMemo(() => items.slice(0, 5), [items]);

  const [favIds, setFavIds] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  // ✅ medidas (mantidas)
  const CARD_ROW_HEIGHT = 119; // era 108
  const GRADIENT_TOP_OFFSET = 14;
  const COLLAPSED_HEIGHT = Math.round(CARD_ROW_HEIGHT * 1.5) + 5;

  const contentRef = useRef<HTMLDivElement | null>(null);
  const animBoxRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [boxH, setBoxH] = useState<number>(COLLAPSED_HEIGHT);
  const heightAnimRef = useRef<Animation | null>(null);
  const [animating, setAnimating] = useState(false);

  // ✅ Modal 2
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SponsoredOffer | null>(null);

  // ✅ Abas + Slider (conteúdo do modal)
  const [tab, setTab] = useState<'detalhes' | 'avaliacoes' | 'endereco'>('detalhes');
  const [mediaIdx, setMediaIdx] = useState(0);

  const SCROLL_OFFSET = 90;

  useEffect(() => {
    const sync = () => setFavIds(buildFavMapFromStore());
    sync();

    const off = onFavoritesChange?.(sync);
    return () => {
      if (typeof off === 'function') off();
    };
  }, []);

  // reset do modal ao trocar item
  useEffect(() => {
    if (!modalOpen) return;
    setTab('detalhes');
    setMediaIdx(0);
  }, [modalOpen, selectedItem?.id]);

  function scrollToFirstCard(behavior: ScrollBehavior = 'auto') {
    const el = wrapperRef.current;
    if (!el) return;

    const fixedH = document.getElementById('top-fixed-stack')?.getBoundingClientRect().height ?? 0;
    const rect = el.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top - fixedH - SCROLL_OFFSET;

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior,
    });
  }

  function openModal(item: SponsoredOffer) {
    scrollToFirstCard('auto');
    setSelectedItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedItem(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToFirstCard('auto');
      });
    });
  }

  function settleAfterExpand() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToFirstCard('smooth');
      });
    });
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
      if (nextExpanded) settleAfterExpand();
      if (!nextExpanded) scrollToFirstCard('auto');
      return;
    }

    const current = boxEl.getBoundingClientRect().height;
    const targetExpanded = Math.max(contentEl.scrollHeight, COLLAPSED_HEIGHT);
    const target = nextExpanded ? targetExpanded : COLLAPSED_HEIGHT;

    setExpanded(nextExpanded);

    animateHeight(current, target, () => {
      if (nextExpanded) settleAfterExpand();
      if (!nextExpanded) scrollToFirstCard('auto');
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

  // ===== Conteúdo do modal (AGORA no padrão do print) =====
  const modalContent = useMemo(() => {
    if (!selectedItem) return <div className="px-4 pb-6" />;

    const id = String(selectedItem.id ?? '');
    const isFav = !!favIds[id];

    const tagsLine = buildTags(selectedItem);
    const rating = Number((selectedItem as any).rating ?? 4.8);
    const reviews = Number((selectedItem as any).reviews ?? 0);
    const imageUrl = (selectedItem as any).imageUrl ?? null;
    const hrefSafe = safeHref((selectedItem as any).href);

    // Slider: por enquanto usamos a imagem do item (1 foto)
    // (quando você tiver mais imagens, você pode passar um array e trocar aqui)
    const media = imageUrl ? [{ src: imageUrl, alt: (selectedItem as any).title }] : [];
    const active = media[mediaIdx];

    function prevMedia() {
      if (!media.length) return;
      setMediaIdx((i) => (i - 1 + media.length) % media.length);
    }
    function nextMedia() {
      if (!media.length) return;
      setMediaIdx((i) => (i + 1) % media.length);
    }

    // Conteúdo “Detalhes” (placeholder seguro — você ajusta depois com texto real do parceiro)
    const detailsText =
      (selectedItem as any).detailsHtml ??
      (selectedItem as any).subtitle ??
      'Informações do desconto e condições aparecerão aqui.';

    // Calendário / Horários / Excetos (placeholder seguro)
    const calendar =
      (selectedItem as any).calendar ?? {
        days: [
          { key: 'seg', label: 'seg' },
          { key: 'ter', label: 'ter' },
          { key: 'qua', label: 'qua' },
          { key: 'qui', label: 'qui' },
          { key: 'sex', label: 'sex' },
          { key: 'sáb', label: 'sáb' },
          { key: 'dom', label: 'dom' },
        ],
        dayRow: [true, true, true, true, true, true, false],
        nightRow: [true, true, true, true, true, false, false],
      };

    const times =
      (selectedItem as any).times ??
      [
        { time: '11:00', offLabel: '50% off', enabled: true },
        { time: '12:00', offLabel: '50% off', enabled: true },
        { time: '13:00', offLabel: '50% off', enabled: true },
        { time: '14:00', offLabel: '50% off', enabled: true },
      ];

    const exceptions =
      (selectedItem as any).exceptions ??
      ['Não válido em feriados.', 'Sujeito à disponibilidade do estabelecimento.'];

    const addressText =
      (selectedItem as any).address?.text ??
      (selectedItem as any).addressText ??
      'Endereço do parceiro aparecerá aqui.';

    return (
      <div className="px-4 pb-6">
        {/* HEADER (título + X + abas) */}
        <div className="pt-3 pb-2">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />

          <div className="relative">
            <div className="pr-10 text-[20px] font-extrabold tracking-[-.2px] text-zinc-800">
              {(selectedItem as any).title}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
              aria-label="Fechar"
            >
              <span className="text-[26px] leading-none text-red-600">×</span>
            </button>
          </div>

          <div className="mt-2 border-b border-dotted border-black/20" />

          <div className="mt-3 flex gap-2">
            <TabButton active={tab === 'detalhes'} onClick={() => setTab('detalhes')}>
              Detalhes
            </TabButton>
            <TabButton active={tab === 'avaliacoes'} onClick={() => setTab('avaliacoes')}>
              Avaliações
            </TabButton>
            <TabButton active={tab === 'endereco'} onClick={() => setTab('endereco')}>
              Endereço
            </TabButton>
          </div>
        </div>

        {/* BODY SCROLL (como no print) */}
        <div className="relative max-h-[78vh] overflow-y-auto pb-24 pt-3">
          {/* SLIDER */}
          <div className="relative overflow-hidden rounded-[14px] bg-zinc-100">
            <div className="aspect-[16/9] w-full">
              {active?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.src} alt={active.alt ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-zinc-200" />
              )}
            </div>

            {/* setas + bolinhas (se tiver mais de 1 imagem) */}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white"
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white"
                  aria-label="Próximo"
                >
                  ›
                </button>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMediaIdx(i)}
                      className={['h-2 w-2 rounded-full', i === mediaIdx ? 'bg-white' : 'bg-white/55'].join(' ')}
                      aria-label={`Imagem ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* HEADLINE + FAVORITO */}
          <div className="mt-3 flex items-start gap-3">
            <div className="flex-1 text-[15px] font-semibold leading-snug text-zinc-700">
              {(selectedItem as any).headline ?? tagsLine ?? '—'}
            </div>

            <button
              type="button"
              aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={() => {
                toggleFavorite?.({
                  id,
                  title: (selectedItem as any).title ?? '',
                  href: hrefSafe,
                  imageUrl: imageUrl ?? null,
                  subtitle: (selectedItem as any).subtitle ?? null,
                  city: (Array.isArray((selectedItem as any).tags) ? (selectedItem as any).tags?.[0] : null) ?? null,
                  priceText: (selectedItem as any).priceText ?? null,
                  savingsText: (selectedItem as any).savingsText ?? null,
                  rating: (selectedItem as any).rating ?? null,
                  reviews: (selectedItem as any).reviews ?? null,
                  tags: (selectedItem as any).tags ?? null,
                } as any);
              }}
              className="mt-0.5 grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
            >
              <HeartMini filled={isFav} />
            </button>
          </div>

          <div className="my-3 border-b border-dotted border-black/20" />

          {/* CONTEÚDO POR ABA */}
          {tab === 'detalhes' && (
            <>
              <SectionTitle>Detalhes:</SectionTitle>

              <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">{detailsText}</div>

              {/* Economia / preço (mantém seu componente) */}
              <div className="mt-3">
                <OfferEconomyLine
                  savingsText={(selectedItem as any).savingsText ?? null}
                  priceText={(selectedItem as any).priceText ?? null}
                />
              </div>

              {/* CALENDÁRIO */}
              {calendar ? (
                <div className="mt-4">
                  <CalendarBlock cal={calendar} />
                </div>
              ) : null}

              {/* HORÁRIOS */}
              {times?.length ? (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <SectionTitle>Horários:</SectionTitle>
                    <span className="text-[14px]">⚠️</span>
                  </div>

                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    {times.map((t: any, i: number) => (
                      <TimeCard key={i} {...t} />
                    ))}
                  </div>
                </>
              ) : null}

              {/* EXCETOS */}
              {exceptions?.length ? (
                <>
                  <SectionTitle className="mt-4">Excetos:</SectionTitle>
                  <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                    {exceptions.map((x: string, i: number) => (
                      <div key={i}>{x}</div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* ACCORDIONS (barras) */}
              <div className="mt-4 space-y-2">
                <Accordion title="Quanto posso economizar:" />
                <Accordion title="Regras:" />
              </div>

              {/* CTA (opcional no print – mantendo) */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={hrefSafe}
                  onClick={() => setModalOpen(false)}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-center text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Ir para oferta
                </Link>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md bg-white px-3 py-2 text-[13px] font-semibold text-black ring-1 ring-black/10 hover:bg-black/5"
                >
                  Fechar
                </button>
              </div>
            </>
          )}

          {tab === 'avaliacoes' && (
            <div className="pt-2">
              <SectionTitle>Avaliações</SectionTitle>

              <div className="mt-2">
                <StarsRow rating={rating} />
                <div className="-mt-0.5 text-[12px] text-zinc-500">
                  <span className="font-semibold text-zinc-700">{Number(rating).toFixed(1)}</span> de{' '}
                  <span className="font-semibold text-zinc-700">{reviews}</span> avaliações
                </div>
              </div>

              <div className="mt-3 rounded-[12px] border border-black/10 bg-zinc-50 p-3 text-[13px] text-zinc-600">
                Aqui entra a lista de avaliações (título, nome, texto curto).
              </div>
            </div>
          )}

          {tab === 'endereco' && (
            <div className="pt-2">
              <SectionTitle>Endereço</SectionTitle>
              <div className="mt-2 rounded-[12px] border border-black/10 p-3 text-[13px] text-zinc-700">
                {addressText}
              </div>
            </div>
          )}

          {/* balão “Fale com...” (mini) */}
          <div className="pointer-events-none fixed bottom-[122px] left-1/2 z-[60] w-[430px] max-w-full -translate-x-1/2 px-4">
            <div className="pointer-events-auto ml-auto w-[160px] rounded-[10px] border border-black/10 bg-white p-2 text-[11px] text-zinc-700 shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold leading-tight">Fale com</div>
                  <div className="leading-tight">{(selectedItem as any).title ?? 'Anunciante'}</div>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600" type="button" aria-label="Fechar">
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* botão WhatsApp */}
          <a
            href="#"
            className="fixed bottom-[74px] left-1/2 z-[70] w-[430px] max-w-full -translate-x-1/2 px-4"
            aria-label="WhatsApp"
          >
            <div className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-green-500 shadow-lg">
              <span className="text-[26px] text-white">🟢</span>
            </div>
          </a>
        </div>
      </div>
    );
  }, [selectedItem, favIds, tab, mediaIdx]);

  return (
    <section className={['w-full', className || ''].join(' ')}>
      {/* ✅ Modal 2 (mantido) */}
      <MenuCarouselModalRight open={modalOpen} onClose={closeModal} hideHeader>
        {modalContent}
      </MenuCarouselModalRight>

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
              const rating = (item as any).rating ?? 4.8;
              const reviews = (item as any).reviews ?? 0;

              const handleCardClick = () => {
                if (idx === 0) {
                  openModal(item);
                  return;
                }

                if (!expanded && idx >= 1) {
                  animateTo(true);
                  return;
                }

                openModal(item);
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
                    className="block py-[13px] cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="h-[106px] w-[106px] flex-none overflow-hidden rounded-md bg-zinc-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(item as any).imageUrl}
                          alt={(item as any).title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="pr-[41px] text-[12px] font-extrabold leading-snug text-zinc-900 line-clamp-2">
                          {(item as any).title}
                        </div>

                        <div className="mt-[4px]">
                          <div className="text-[12px] text-zinc-500 line-clamp-1">{tagsLine}</div>

                          <OfferEconomyLine savingsText={(item as any).savingsText ?? null} priceText={(item as any).priceText ?? null} />
                        </div>

                        <div className="mt-1.5 flex items-end justify-between">
                          <div>
                            <StarsRow rating={Number(rating)} />
                            <div className="-mt-0.5 text-[12px] text-zinc-500">
                              <span className="font-semibold text-zinc-700">{Number(rating).toFixed(1)}</span> de{' '}
                              <span className="font-semibold text-zinc-700">{reviews}</span> avaliações
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

                    {/* ✅ coração usa store (href sempre string) */}
                    <button
                      type="button"
                      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      disabled={disableHeart}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disableHeart) return;

                        toggleFavorite({
                          id: item.id,
                          title: (item as any).title ?? '',
                          href: safeHref((item as any).href),
                          imageUrl: (item as any).imageUrl ?? null,
                          subtitle: (item as any).subtitle ?? null,
                          city: (Array.isArray((item as any).tags) ? (item as any).tags?.[0] : null) ?? null,
                          priceText: (item as any).priceText ?? null,
                          savingsText: (item as any).savingsText ?? null,
                          rating: (item as any).rating ?? null,
                          reviews: (item as any).reviews ?? null,
                          tags: (item as any).tags ?? null,
                        } as any);
                      }}
                      className={[
                        'absolute -right-[4px] top-2 inline-flex h-10 w-10 items-center justify-center',
                        disableHeart ? 'pointer-events-none opacity-0' : '',
                      ].join(' ')}
                      tabIndex={disableHeart ? -1 : 0}
                    >
                      <HeartIcon
                        filled={isFav}
                        className={['h-9 w-9 transition', isFav ? 'text-red-500' : 'text-zinc-300 hover:text-zinc-400'].join(' ')}
                      />
                    </button>
                  </div>

                  {idx < shown.length - 1 ? <div className="mx-2 border-b border-dotted border-zinc-300" /> : null}
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
          <div className="text-[15px] font-semibold text-emerald-700 hover:text-emerald-800">{expanded ? 'Ver menos' : 'Ver mais'}</div>

          <div className="text-zinc-400">
            <DoubleChevronOpen dir={expanded ? 'up' : 'down'} className="h-10 w-10" />
          </div>
        </button>
      </div>
    </section>
  );
}

/* =========================
   UI helpers do Modal (abas / seções / calendário / horários)
========================= */

function TabButton({
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
        'h-9 flex-1 rounded-[10px] text-[13px] font-semibold',
        'border border-black/10',
        active ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function SectionTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={['text-[15px] font-extrabold text-zinc-800', className].join(' ')}>{children}</div>;
}

function HeartMini({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-10-9.3C.3 8.1 2.3 5 5.7 5c1.8 0 3.2.9 4.3 2.3C11.1 5.9 12.5 5 14.3 5c3.4 0 5.4 3.1 3.7 6.7C19.5 16.4 12 21 12 21z"
        fill={filled ? '#ef4444' : 'none'}
        stroke={filled ? '#ef4444' : 'rgba(0,0,0,.25)'}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CalendarBlock({
  cal,
}: {
  cal: {
    days: Array<{ key: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sáb' | 'dom'; label: string }>;
    dayRow: boolean[];
    nightRow: boolean[];
  };
}) {
  const days = cal.days?.slice(0, 7) ?? [];
  const dayRow = (cal.dayRow ?? []).slice(0, 7);
  const nightRow = (cal.nightRow ?? []).slice(0, 7);

  return (
    <div className="rounded-[12px] border border-black/10 p-2">
      <div className="grid grid-cols-8 gap-1 text-center text-[12px] font-semibold text-zinc-700">
        <div />
        {days.map((d) => (
          <div key={d.key} className="rounded bg-zinc-200 py-1">
            {d.label}
          </div>
        ))}

        <div className="rounded bg-zinc-200 py-1">Dia</div>
        {dayRow.map((ok, i) => (
          <Cell key={`d-${i}`} ok={ok} />
        ))}

        <div className="rounded bg-zinc-200 py-1">Noite</div>
        {nightRow.map((ok, i) => (
          <Cell key={`n-${i}`} ok={ok} />
        ))}
      </div>
    </div>
  );
}

function Cell({ ok }: { ok: boolean }) {
  return (
    <div className="grid place-items-center rounded bg-zinc-100 py-1">
      <span className={ok ? 'text-emerald-600' : 'text-red-500'}>{ok ? '✓' : '✕'}</span>
    </div>
  );
}

function TimeCard({
  time,
  offLabel,
  enabled = true,
}: {
  time: string;
  offLabel: string;
  enabled?: boolean;
}) {
  return (
    <div
      className={[
        'min-w-[78px] rounded-[10px] border border-black/10 bg-white p-2 text-center',
        enabled ? '' : 'opacity-45',
      ].join(' ')}
    >
      <div className="text-[11px] font-semibold text-zinc-700">{time}</div>
      <div className="text-[11px] font-extrabold text-red-500">{offLabel}</div>
      <button type="button" className="mt-1 w-full rounded-[8px] bg-zinc-100 py-1 text-[11px] font-semibold text-zinc-700">
        Utilizar
      </button>
    </div>
  );
}

function Accordion({ title }: { title: string }) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-zinc-100 px-3 py-2">
      <div className="text-[13px] font-extrabold text-zinc-700">{title}</div>
    </div>
  );
}
