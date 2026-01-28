// app/_components/product/ProductTabDetalhes.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import type { ProductModalData } from './ProductDetailContent';

import { AccordionItem, CalendarBlock, SectionTitle, TimeCard } from './tabs/ProductDetailUI';
import TimedMediaCarousel from '@/app/_components/media/TimedMediaCarousel';

// ✅ Voucher Flow
import VoucherFlowController from '@/app/_components/voucher-flow/VoucherFlowController';

// ✅ placeholder longo pra testar “Ver mais”
const DETAILS_PREVIEW =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const DETAILS_MORE =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const SLIDE_DURATION_MS = 6500;

// ✅ balão de alerta
const ALERT_BUBBLE_ANIM_MS = 520;

// ✅ delay inteligente
const ALERT_BUBBLE_DELAY_MS = 10_000;

// ✅ anti-“briga” com o usuário: se ele mexeu no carrossel, não recentraliza
const USER_SCROLL_GUARD_MS = 1200;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toMinutes(hhmm: string) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return NaN;
  return h * 60 + mm;
}

// ✅ regra de funcionamento: 11:30 até 23:00 (inclusive). 23:30+ fechado. Reabre 11:30.
function isOpenByBusinessHours(timeHHMM: string) {
  const min = toMinutes(timeHHMM);
  if (!Number.isFinite(min)) return false;

  const OPEN_FROM = 11 * 60 + 30; // 11:30
  const OPEN_UNTIL = 23 * 60 + 0; // 23:00

  return min >= OPEN_FROM && min <= OPEN_UNTIL;
}

function buildHalfHourTimeCards24h(): Array<{ time: string; offLabel: string; enabled: boolean }> {
  const out: Array<{ time: string; offLabel: string; enabled: boolean }> = [];

  const pattern = [
    { offLabel: '50% off', enabled: true },
    { offLabel: '-', enabled: true },
    { offLabel: '20% off', enabled: true },
    { offLabel: '25% off', enabled: true },
    { offLabel: '50% off', enabled: true },
    { offLabel: '-', enabled: true },
  ];

  let openIdx = 0;

  for (let total = 0; total <= 23 * 60 + 30; total += 30) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    const time = `${pad2(h)}:${pad2(m)}`;

    const open = isOpenByBusinessHours(time);

    if (open) {
      const p = pattern[openIdx % pattern.length];
      out.push({
        time,
        offLabel: p.offLabel,
        enabled: true,
      });
      openIdx += 1;
    } else {
      out.push({
        time,
        offLabel: '-',
        enabled: false,
      });
    }
  }

  return out;
}

type AccordionKey = 'valores' | 'economia' | 'duvidas' | 'regras';

export default function ProductTabDetalhes({ data }: { data: ProductModalData }) {
  const [voucherOpen, setVoucherOpen] = useState(false);

  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const detailsMoreInnerRef = useRef<HTMLDivElement | null>(null);
  const [detailsMoreH, setDetailsMoreH] = useState(0);

  const detailsAnchorRef = useRef<HTMLDivElement | null>(null);

  const [openAcc, setOpenAcc] = useState<AccordionKey | null>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEntered, setAlertEntered] = useState(false);

  const alertTimerRef = useRef<number | null>(null);
  const alertUserInteractedRef = useRef(false);
  const alertAutoShownForIdRef = useRef<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const timeScrollerRef = useRef<HTMLDivElement | null>(null);
  const timeItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [nowTick, setNowTick] = useState(0);

  const didCenterForIdRef = useRef<string | null>(null);

  const lastUserTouchTsRef = useRef<number>(0);
  const userTouchTimerRef = useRef<number | null>(null);

  // ✅ alvo (Horários + ⚠️) para saber se está visível
  const horariosTriggerRef = useRef<HTMLDivElement | null>(null);

  // ✅ visível + modal parado
  const [horariosInView, setHorariosInView] = useState(false);
  const [modalIdle, setModalIdle] = useState(true);

  const idleTimerRef = useRef<number | null>(null);

  const bannerMedia = useMemo(() => {
    const normalized = (data.media ?? [])
      .map((m: any) => ({
        src: String(m?.src ?? m?.url ?? m?.imageUrl ?? m?.image ?? '').trim(),
        alt: String(m?.alt ?? ''),
      }))
      .filter((m) => m.src.startsWith('/') || m.src.startsWith('http://') || m.src.startsWith('https://'));

    if (normalized.length === 0) {
      return [
        { src: '/banners/banner-1.webp', alt: 'Banner 1' },
        { src: '/banners/banner-2.webp', alt: 'Banner 2' },
        { src: '/banners/banner-3.webp', alt: 'Banner 3' },
      ];
    }

    return normalized;
  }, [data.media]);

  useEffect(() => {
    setDetailsExpanded(false);
    setOpenAcc(null);

    setAlertEntered(false);
    setAlertOpen(false);

    alertUserInteractedRef.current = false;
    alertAutoShownForIdRef.current = null;

    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    timeItemRefs.current = [];
    didCenterForIdRef.current = null;

    lastUserTouchTsRef.current = 0;
    if (userTouchTimerRef.current) {
      window.clearTimeout(userTouchTimerRef.current);
      userTouchTimerRef.current = null;
    }

    setHorariosInView(false);
    setModalIdle(true);

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, [data.id]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const inner = detailsMoreInnerRef.current;
    if (!inner) return;

    const measure = () => setDetailsMoreH(inner.scrollHeight || 0);
    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  // ✅ helper: acha o scroller do modal
  function findScrollableParent(el: HTMLElement | null) {
    let cur: HTMLElement | null = el;
    while (cur) {
      const cs = window.getComputedStyle(cur);
      const oy = cs.overflowY;
      const canScrollY = (oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight;
      if (canScrollY) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  // ✅ FIX: "Ver mais / Ver menos" ajusta scroll no scroller do MODAL (não usa window)
  function toggleDetailsAnchored() {
    const anchor = detailsAnchorRef.current;
    const prevTop = anchor?.getBoundingClientRect().top ?? null;

    setDetailsExpanded((v) => !v);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!anchor || prevTop == null) return;

        const nextTop = anchor.getBoundingClientRect().top;
        const delta = nextTop - prevTop;

        if (Math.abs(delta) <= 0.5) return;

        const scroller = findScrollableParent(rootRef.current);
        if (scroller) scroller.scrollBy({ top: delta, left: 0, behavior: 'auto' });
      });
    });
  }

  function openAlertBubble() {
    setAlertOpen(true);
    requestAnimationFrame(() => setAlertEntered(true));
  }

  function closeAlertBubble() {
    setAlertEntered(false);
    window.setTimeout(() => setAlertOpen(false), ALERT_BUBBLE_ANIM_MS);
  }

  function toggleAlertBubble() {
    alertUserInteractedRef.current = true;

    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    if (alertOpen) closeAlertBubble();
    else openAlertBubble();
  }

  // ✅ (1) Horários precisa estar visível no campo de visão
  useEffect(() => {
    const el = horariosTriggerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // threshold alto: garante que “Horários + ⚠️” esteja bem visível (perto do meio)
        setHorariosInView(!!e?.isIntersecting && (e.intersectionRatio ?? 0) >= 0.6);
      },
      { threshold: [0, 0.25, 0.6, 0.85, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [data.id]);

  // ✅ (2) Modal precisa estar parado (sem scroll por um tempinho)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = findScrollableParent(root);
    if (!scroller) return;

    const markScrolling = () => {
      setModalIdle(false);

      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        setModalIdle(true);
      }, 220); // ajuste fino se quiser
    };

    // começa como parado
    setModalIdle(true);

    scroller.addEventListener('scroll', markScrolling, { passive: true });
    scroller.addEventListener('wheel', markScrolling, { passive: true });
    scroller.addEventListener('touchmove', markScrolling, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', markScrolling as any);
      scroller.removeEventListener('wheel', markScrolling as any);
      scroller.removeEventListener('touchmove', markScrolling as any);

      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [data.id]);

  // ✅ (3) Auto-open do alerta:
  // - só arma quando Horários estiver visível
  // - só arma quando modal estiver parado
  // - não abre se o usuário já interagiu
  // - abre só 1x por produto
  useEffect(() => {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    if (alertUserInteractedRef.current) return;
    if (alertAutoShownForIdRef.current === data.id) return;

    if (!horariosInView) return;
    if (!modalIdle) return;

    alertTimerRef.current = window.setTimeout(() => {
      if (alertUserInteractedRef.current) return;
      if (alertAutoShownForIdRef.current === data.id) return;
      if (!horariosInView) return;
      if (!modalIdle) return;

      alertAutoShownForIdRef.current = data.id;
      openAlertBubble();
    }, ALERT_BUBBLE_DELAY_MS);

    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, [data.id, horariosInView, modalIdle]);

  // ✅ Fechamento automático ao SCROLL do conteúdo do modal (mantém)
  useEffect(() => {
    if (!alertOpen) return;

    const root = rootRef.current;
    if (!root) return;

    const scroller = findScrollableParent(root);
    if (!scroller) return;

    const onScroll = () => closeAlertBubble();

    scroller.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = () => closeAlertBubble();
    const onTouchMove = () => closeAlertBubble();

    scroller.addEventListener('wheel', onWheel, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', onScroll as any);
      scroller.removeEventListener('wheel', onWheel as any);
      scroller.removeEventListener('touchmove', onTouchMove as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertOpen]);

  const funcionamentoCal: NonNullable<ProductModalData['calendar']> = useMemo(() => {
    if (data.calendar) return data.calendar;
    return {
      days: [
        { key: 'seg', label: 'seg' },
        { key: 'ter', label: 'ter' },
        { key: 'qua', label: 'qua' },
        { key: 'qui', label: 'qui' },
        { key: 'sex', label: 'sex' },
        { key: 'sáb', label: 'sáb' },
        { key: 'dom', label: 'dom' },
      ],
      dayRow: [false, true, true, true, true, true, true],
      nightRow: [false, true, true, true, false, false, true],
    };
  }, [data.calendar]);

  const funcionamentoTimeCards = useMemo(() => {
    const fromDataRaw = (data.times ?? [])
      .map((t) => ({
        time: String(t.time ?? '').trim(),
        offLabel: String(t.offLabel ?? '').trim() || '-',
        enabled: t.enabled !== false,
      }))
      .filter((t) => /^\d{1,2}:\d{2}$/.test(t.time));

    const base = fromDataRaw.length > 0 ? fromDataRaw : buildHalfHourTimeCards24h();

    const normalized = base.map((t) => {
      const open = isOpenByBusinessHours(t.time);
      if (!open) return { ...t, enabled: false, offLabel: '-' };
      return { ...t, enabled: true };
    });

    return normalized;
  }, [data.times]);

  // ✅ vigente = último horário <= agora (ex: 14:20 -> 14:00; ex: 14:33 -> 14:30)
  const activeTimeIndex = useMemo(() => {
    if (!funcionamentoTimeCards.length) return -1;

    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();

    const mins = funcionamentoTimeCards.map((t) => toMinutes(t.time));

    let idx = -1;
    for (let i = 0; i < mins.length; i++) {
      if (Number.isFinite(mins[i]) && mins[i] <= nowMin) idx = i;
    }

    return idx; // -1 se ainda não chegou no primeiro horário do dia
  }, [funcionamentoTimeCards, nowTick, data.id]);

  function centerTimeIndex(index: number, behavior: ScrollBehavior) {
    const scroller = timeScrollerRef.current;
    const item = timeItemRefs.current[index];
    if (!scroller || !item) return;

    const target = item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2;
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const clamped = Math.max(0, Math.min(max, target));

    scroller.scrollTo({ left: clamped, behavior });
  }

  useLayoutEffect(() => {
    if (activeTimeIndex < 0) return;
    if (didCenterForIdRef.current === data.id) return;

    const scroller = timeScrollerRef.current;
    const item = timeItemRefs.current[activeTimeIndex];
    if (!scroller || !item) return;

    const centerNow = () => {
      centerTimeIndex(activeTimeIndex, 'auto');
      didCenterForIdRef.current = data.id;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        centerNow();
        window.setTimeout(centerNow, 0);
      });
    });
  }, [activeTimeIndex, data.id]);

  useEffect(() => {
    const scroller = timeScrollerRef.current;
    if (!scroller) return;

    const markUserTouch = () => {
      lastUserTouchTsRef.current = Date.now();
      if (userTouchTimerRef.current) window.clearTimeout(userTouchTimerRef.current);
      userTouchTimerRef.current = window.setTimeout(() => {
        lastUserTouchTsRef.current = lastUserTouchTsRef.current; // noop
      }, USER_SCROLL_GUARD_MS);
    };

    scroller.addEventListener('pointerdown', markUserTouch, { passive: true });
    scroller.addEventListener('touchstart', markUserTouch, { passive: true });
    scroller.addEventListener('wheel', markUserTouch, { passive: true });
    scroller.addEventListener('scroll', markUserTouch, { passive: true });

    return () => {
      scroller.removeEventListener('pointerdown', markUserTouch as any);
      scroller.removeEventListener('touchstart', markUserTouch as any);
      scroller.removeEventListener('wheel', markUserTouch as any);
      scroller.removeEventListener('scroll', markUserTouch as any);
      if (userTouchTimerRef.current) {
        window.clearTimeout(userTouchTimerRef.current);
        userTouchTimerRef.current = null;
      }
    };
  }, [data.id]);

  useEffect(() => {
    if (activeTimeIndex < 0) return;
    if (didCenterForIdRef.current !== data.id) return;

    const now = Date.now();
    const last = lastUserTouchTsRef.current || 0;
    if (now - last < USER_SCROLL_GUARD_MS) return;

    centerTimeIndex(activeTimeIndex, 'smooth');
  }, [activeTimeIndex, data.id]);

  const exceptionsClean = useMemo(() => {
    const base = (data.exceptions ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
    if (base.length > 0) return base;
    return ['24/12, 25/12, 31/12 e 01/01'];
  }, [data.exceptions]);

  const hasExceptions = exceptionsClean.length > 0;

  return (
    <div ref={rootRef}>
      {/* Banner */}
      <div className="mt-3">
        <div className="relative overflow-hidden rounded-none bg-zinc-200">
          <TimedMediaCarousel
            media={bannerMedia}
            className="w-full"
            durationMs={SLIDE_DURATION_MS}
            showProgress
            showDots
            showArrows
            showNextButton={false}
            showPauseButton={false}
            homeOverlay
            aspectClassName="aspect-[16/9]"
            imageClassName="object-cover"
          />
        </div>
      </div>

      {/* subtítulo */}
      <div className="mt-[15px]">
        <div className="line-clamp-3 text-[16px] font-semibold leading-[18px] text-zinc-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </div>
      </div>

      <div className="my-[14px] border-b border-dotted border-black/25" />

      <div ref={detailsAnchorRef}>
        <SectionTitle>Detalhes:</SectionTitle>
      </div>

      <div className="mt-2 text-[13px] leading-[16px] text-zinc-600">
        <div className={detailsExpanded ? '' : 'line-clamp-4'}>{DETAILS_PREVIEW}</div>

        <div
          className={[
            'overflow-hidden',
            'transition-[max-height,opacity,transform] ease-out',
            'duration-[520ms]',
            detailsExpanded ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible',
          ].join(' ')}
          style={{ maxHeight: detailsExpanded ? detailsMoreH : 0 }}
          aria-hidden={!detailsExpanded}
        >
          <div ref={detailsMoreInnerRef} className="pt-2">
            <div>{DETAILS_MORE}</div>
          </div>
        </div>

        <button
          type="button"
          className={[
            'mt-1',
            '-mx-2 px-2 py-2',
            'block w-fit text-left',
            'text-[13px]',
            'font-normal',
            'text-emerald-700',
            'active:opacity-80',
          ].join(' ')}
          onClick={toggleDetailsAnchored}
          aria-label={detailsExpanded ? 'Ver menos detalhes' : 'Ver mais detalhes'}
        >
          {detailsExpanded ? 'Ver menos' : 'Ver mais'}
        </button>

        <div className="mt-4">
          <SectionTitle>Funcionamento:</SectionTitle>

          <div className="mt-2">
            <CalendarBlock cal={funcionamentoCal} noOuterBorder />
          </div>

          {/* Horários + alerta */}
          <div className="mt-[25px] flex items-center gap-2">
            {/* ✅ ref aqui: serve de alvo para saber se está visível */}
            <div ref={horariosTriggerRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleAlertBubble();
                }}
                aria-label="Alerta de horários"
                className={[
                  'relative',
                  '-mx-2 px-2 py-2',
                  'flex items-center gap-2',
                  'rounded-md',
                  'touch-manipulation select-none',
                  'active:opacity-80',
                ].join(' ')}
              >
                <SectionTitle>Horários:</SectionTitle>

                <span className="text-[16px]" style={{ transform: 'translate(0px, 0px)' }}>
                  ⚠️
                </span>
              </button>

              {alertOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Fechar alerta"
                    className="fixed inset-0 z-[20] cursor-default"
                    onClick={closeAlertBubble}
                  />

                  <div className="absolute z-[30]" style={{ right: -128, bottom: '100%', marginBottom: -4 }}>
                    <div
                      className={[
                        'relative',
                        'w-[142px]',
                        'transition-[opacity,transform] ease-out',
                        `duration-[${ALERT_BUBBLE_ANIM_MS}ms]`,
                        alertEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={closeAlertBubble}
                        className="block w-full rounded-[10px] border border-black/10 bg-white p-2 text-left text-[11px] text-zinc-700 shadow"
                      >
                        <div className="leading-tight">
                          <div className="font-semibold">Alerta:</div>
                          <div className="mt-0.5">
                            O desconto oferecido é de acordo com o horário de sua chegada ao estabelecimento.
                            <br />
                            <br />
                            Para solicitar a conta, selecione nas abas abaixo o horário que você chegou no
                            estabelecimento.
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={closeAlertBubble}
                        aria-label="Fechar balão de alerta"
                        className={[
                          'absolute',
                          '-top-[30px]',
                          '-right-[8px]',
                          'grid h-10 w-10 place-items-center',
                          'text-red-600',
                          'active:scale-95',
                        ].join(' ')}
                      >
                        <svg viewBox="0 0 24 24" width="22" height="22">
                          <path
                            d="M6 6L18 18M18 6L6 18"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* ✅ Carrossel */}
          <div ref={timeScrollerRef} className="mt-2 flex gap-2 overflow-x-auto pb-2 px-1">
            {funcionamentoTimeCards.map((t, i) => {
              const isActive = i === activeTimeIndex;

              // ✅ regra:
              // - atrás do vigente (<= activeTimeIndex): clicável
              // - à frente (> activeTimeIndex): não clicável
              // - fechado (enabled=false): nunca clicável
              // - se activeTimeIndex=-1 (antes de começar o dia): nada clicável
              const clickable = !!t.enabled && activeTimeIndex >= 0 && i <= activeTimeIndex;

              return (
                <div
                  key={`${t.time}-${i}`}
                  ref={(node) => {
                    timeItemRefs.current[i] = node;
                  }}
                  className="shrink-0"
                >
                  <TimeCard
                    time={t.time}
                    offLabel={t.offLabel}
                    enabled={t.enabled}
                    active={isActive}
                    clickable={clickable}
                    onUse={() => {
                      if (!clickable) return;
                      setVoucherOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {hasExceptions ? (
            <div className="mt-4">
              <SectionTitle>Excetos:</SectionTitle>
              <div className="mt-1 text-[13px] leading-[16px] text-zinc-500">
                {exceptionsClean.map((x, i) => (
                  <div key={i}>{x}</div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 space-y-[5px]">
            <AccordionItem
              title="Valores:"
              open={openAcc === 'valores'}
              onToggle={() => setOpenAcc((v) => (v === 'valores' ? null : 'valores'))}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionItem>

            <AccordionItem
              title="Quanto posso economizar:"
              open={openAcc === 'economia'}
              onToggle={() => setOpenAcc((v) => (v === 'economia' ? null : 'economia'))}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionItem>

            <AccordionItem
              title="Dúvidas frequentes:"
              open={openAcc === 'duvidas'}
              onToggle={() => setOpenAcc((v) => (v === 'duvidas' ? null : 'duvidas'))}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionItem>

            <AccordionItem
              title="Regras:"
              open={openAcc === 'regras'}
              onToggle={() => setOpenAcc((v) => (v === 'regras' ? null : 'regras'))}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </AccordionItem>
          </div>

          <div className="mt-4 mb-2">
            <SectionTitle>Obs:</SectionTitle>

            <ul className="mt-1 list-disc pl-5 text-[13px] leading-[16px] text-zinc-500 space-y-1">
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing.</li>
              <li>Sed do eiusmod tempor incididunt ut labore et dolore.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation.</li>
              <li>Nisi ut aliquip ex ea commodo consequat.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate.</li>
            </ul>
          </div>
        </div>
      </div>

      <VoucherFlowController open={voucherOpen} onClose={() => setVoucherOpen(false)} restaurantName={data.title} />
    </div>
  );
}
