// app/_components/product/ProductTabDetalhes.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import type { ProductModalData } from './ProductDetailContent';

import { AccordionItem, CalendarBlock, ChevronYellow, SectionTitle, TimeCard } from './tabs/ProductDetailUI';

// ✅ placeholder longo pra testar “Ver mais”
const DETAILS_PREVIEW =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const DETAILS_MORE =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const SLIDE_DURATION_MS = 6500;
const SLIDE_STEP_MS = 50;

// ✅ balão de alerta (mesmo “jeito” do WhatsApp)
const ALERT_BUBBLE_ANIM_MS = 520;

// ✅ delay inteligente (igual WhatsApp)
const ALERT_BUBBLE_DELAY_MS = 10_000; // 10s (ajuste aqui)

// ✅ anti-“briga” com o usuário: se ele mexeu no carrossel, não recentraliza
const USER_SCROLL_GUARD_MS = 1200;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function buildHalfHourTimeCards(
  startHH = 11,
  startMM = 0,
  endHH = 23,
  endMM = 0
): Array<{ time: string; offLabel: string; enabled: boolean }> {
  const out: Array<{ time: string; offLabel: string; enabled: boolean }> = [];
  let h = startHH;
  let m = startMM;

  const endTotal = endHH * 60 + endMM;

  const pattern = [
    { offLabel: '50% off', enabled: true },
    { offLabel: '-', enabled: true },
    { offLabel: '20% off', enabled: true },
    { offLabel: '25% off', enabled: true },
    { offLabel: '50% off', enabled: true },
    { offLabel: '-', enabled: true },
  ];

  let i = 0;
  while (h * 60 + m <= endTotal) {
    const p = pattern[i % pattern.length];
    out.push({
      time: `${pad2(h)}:${pad2(m)}`,
      offLabel: p.offLabel,
      enabled: p.enabled,
    });

    m += 30;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
    i += 1;
  }

  return out;
}

function toMinutes(hhmm: string) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mm)) return NaN;
  return h * 60 + mm;
}

type AccordionKey = 'valores' | 'economia' | 'duvidas' | 'regras';

export default function ProductTabDetalhes({
  data,
  economySlot,
}: {
  data: ProductModalData;
  economySlot?: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);

  // ✅ “Ver mais” do Detalhes (abre/fecha deslizando)
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const detailsMoreInnerRef = useRef<HTMLDivElement | null>(null);
  const [detailsMoreH, setDetailsMoreH] = useState(0);

  // ✅ âncora: “Detalhes:” precisa ficar travado ao expandir/recolher
  const detailsAnchorRef = useRef<HTMLDivElement | null>(null);

  // ✅ sanfona (uma por vez)
  const [openAcc, setOpenAcc] = useState<AccordionKey | null>(null);

  // ✅ balão de alerta do “⚠️”
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEntered, setAlertEntered] = useState(false);

  // ✅ refs para lógica “inteligente”
  const alertTimerRef = useRef<number | null>(null);
  const alertUserInteractedRef = useRef(false);
  const alertAutoShownForIdRef = useRef<string | null>(null);

  // ✅ root para achar o scroller do modal (e fechar ao scroll)
  const rootRef = useRef<HTMLDivElement | null>(null);

  // ✅ carrossel de horários (container + itens)
  const timeScrollerRef = useRef<HTMLDivElement | null>(null);
  const timeItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // ✅ “tick” do horário atual (atualiza sozinho para trocar o vigente)
  const [nowTick, setNowTick] = useState(0);

  // ✅ trava para centralizar no carregamento
  const didCenterForIdRef = useRef<string | null>(null);

  // ✅ guarda: usuário mexeu no carrossel recentemente?
  const lastUserTouchTsRef = useRef<number>(0);
  const userTouchTimerRef = useRef<number | null>(null);

  const media = data.media ?? [];
  const canSlide = media.length > 1;
  const active = media[idx];

  useEffect(() => {
    setIdx(0);
    setTick(0);
    setDetailsExpanded(false);
    setOpenAcc(null);

    // reseta alerta
    setAlertEntered(false);
    setAlertOpen(false);

    // reseta lógica do auto-open por produto
    alertUserInteractedRef.current = false;
    alertAutoShownForIdRef.current = null;

    // limpa timer antigo
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    // reseta refs dos horários
    timeItemRefs.current = [];

    // permite centralizar de novo neste produto (carregamento)
    didCenterForIdRef.current = null;

    // reseta guarda do usuário
    lastUserTouchTsRef.current = 0;
    if (userTouchTimerRef.current) {
      window.clearTimeout(userTouchTimerRef.current);
      userTouchTimerRef.current = null;
    }
  }, [data.id]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!canSlide) return;

    const id = window.setInterval(() => {
      setTick((t) => {
        const nextT = t + SLIDE_STEP_MS;
        if (nextT >= SLIDE_DURATION_MS) {
          setIdx((i) => (i + 1) % media.length);
          return 0;
        }
        return nextT;
      });
    }, SLIDE_STEP_MS);

    return () => window.clearInterval(id);
  }, [canSlide, media.length]);

  const progressPct = useMemo(() => {
    if (!canSlide) return 100;
    const pct = (tick / SLIDE_DURATION_MS) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [tick, canSlide]);

  function next() {
    if (!media.length) return;
    setTick(0);
    setIdx((i) => (i + 1) % media.length);
  }

  // mede altura do bloco “mais”
  useEffect(() => {
    const inner = detailsMoreInnerRef.current;
    if (!inner) return;

    const measure = () => setDetailsMoreH(inner.scrollHeight || 0);
    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  function toggleDetailsAnchored() {
    const anchor = detailsAnchorRef.current;
    const prevTop = anchor?.getBoundingClientRect().top ?? null;

    setDetailsExpanded((v) => !v);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!anchor || prevTop == null) return;
        const nextTop = anchor.getBoundingClientRect().top;
        const delta = nextTop - prevTop;
        if (Math.abs(delta) > 0.5) {
          window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
        }
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

  // ✅ Auto-open com delay “igual WhatsApp”
  useEffect(() => {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    if (alertUserInteractedRef.current) return;
    if (alertAutoShownForIdRef.current === data.id) return;

    alertTimerRef.current = window.setTimeout(() => {
      if (alertUserInteractedRef.current) return;
      alertAutoShownForIdRef.current = data.id;
      openAlertBubble();
    }, ALERT_BUBBLE_DELAY_MS);

    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
        alertTimerRef.current = null;
      }
    };
  }, [data.id]);

  // ✅ Fechamento automático ao SCROLL do conteúdo do modal
  useEffect(() => {
    if (!alertOpen) return;

    const root = rootRef.current;
    if (!root) return;

    const findScrollableParent = (el: HTMLElement | null) => {
      let cur: HTMLElement | null = el;
      while (cur) {
        const cs = window.getComputedStyle(cur);
        const oy = cs.overflowY;
        const canScrollY = (oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight;
        if (canScrollY) return cur;
        cur = cur.parentElement;
      }
      return null;
    };

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

  // ✅ Funcionamento (fallback ilustrativo)
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

  // ✅ Lista de horários: usa data.times se vier do backend; senão usa placeholder
  const funcionamentoTimeCards = useMemo(() => {
    const fromData = (data.times ?? [])
      .map((t) => ({
        time: String(t.time ?? '').trim(),
        offLabel: String(t.offLabel ?? '').trim() || '-',
        enabled: t.enabled !== false,
      }))
      .filter((t) => /^\d{1,2}:\d{2}$/.test(t.time));

    if (fromData.length > 0) return fromData;
    return buildHalfHourTimeCards(11, 0, 23, 0);
  }, [data.times]);

  // ✅ índice do horário vigente (ex: 16:33 -> 16:30)
  const activeTimeIndex = useMemo(() => {
    if (!funcionamentoTimeCards.length) return -1;

    const d = new Date();
    const nowMin = d.getHours() * 60 + d.getMinutes();

    const mins = funcionamentoTimeCards.map((t) => toMinutes(t.time));

    let idx = -1;
    for (let i = 0; i < mins.length; i++) {
      if (Number.isFinite(mins[i]) && mins[i] <= nowMin) idx = i;
    }

    if (idx === -1) {
      for (let i = 0; i < mins.length; i++) {
        if (Number.isFinite(mins[i]) && mins[i] > nowMin) return i;
      }
      return 0;
    }

    return idx;
  }, [funcionamentoTimeCards, nowTick, data.id]);

  // ✅ helper: centraliza um índice no carrossel
  function centerTimeIndex(index: number, behavior: ScrollBehavior) {
    const scroller = timeScrollerRef.current;
    const item = timeItemRefs.current[index];
    if (!scroller || !item) return;

    const target = item.offsetLeft + item.offsetWidth / 2 - scroller.clientWidth / 2;
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const clamped = Math.max(0, Math.min(max, target));

    scroller.scrollTo({ left: clamped, behavior });
  }

  // ✅ Centraliza NO CARREGAMENTO (já abre no meio, sem animação)
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

  // ✅ Marca “usuário está mexendo” no carrossel (pra não recentralizar)
  useEffect(() => {
    const scroller = timeScrollerRef.current;
    if (!scroller) return;

    const markUserTouch = () => {
      lastUserTouchTsRef.current = Date.now();
      if (userTouchTimerRef.current) window.clearTimeout(userTouchTimerRef.current);
      userTouchTimerRef.current = window.setTimeout(() => {
        // só “libera” depois de um tempinho parado
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

  // ✅ Recentraliza quando o horário virar, mas sem atrapalhar se o usuário mexeu
  useEffect(() => {
    if (activeTimeIndex < 0) return;

    // só faz isso depois do “center inicial”
    if (didCenterForIdRef.current !== data.id) return;

    const now = Date.now();
    const last = lastUserTouchTsRef.current || 0;

    // se o usuário mexeu recentemente, não mexe
    if (now - last < USER_SCROLL_GUARD_MS) return;

    // recenter suave (não é obrigatório, mas fica natural)
    centerTimeIndex(activeTimeIndex, 'smooth');
  }, [activeTimeIndex, data.id]);

  // ✅ EXCETOS: se não vier do backend, usa placeholder
  const exceptionsClean = useMemo(() => {
    const base = (data.exceptions ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
    if (base.length > 0) return base;
    return ['Natal', 'Ano Novo', 'Páscoa', '24/12, 25/12, 31/12 e 01/01'];
  }, [data.exceptions]);

  const hasExceptions = exceptionsClean.length > 0;

  return (
    <div ref={rootRef}>
      {/* Banner alinhado */}
      <div className="mt-3">
        <div className="relative overflow-hidden rounded-none bg-zinc-200">
          <div className="aspect-[16/9] w-full">
            {active?.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.src} alt={active.alt ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>

          {canSlide ? (
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-black/15">
              <div
                className="h-full bg-white/70"
                style={{ width: `${progressPct}%`, transition: `width ${SLIDE_STEP_MS}ms linear` }}
              />
            </div>
          ) : null}

          {canSlide ? (
            <>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center"
                aria-label="Próximo"
              >
                <ChevronYellow dir="right" />
              </button>

              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {media.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTick(0);
                      setIdx(i);
                    }}
                    className={['h-2 w-2 rounded-full', i === idx ? 'bg-white' : 'bg-white/55'].join(' ')}
                    aria-label={`Imagem ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
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

      {/* Conteúdo */}
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
            <div className="relative">
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
                            Para solicitar a conta, selecione nas abas abaixo o horário que você chegou no estabelecimento.
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
              const isActiveTime = i === activeTimeIndex;

              return (
                <div
                  key={`${t.time}-${i}`}
                  ref={(node) => {
                    timeItemRefs.current[i] = node;
                  }}
                  className="shrink-0"
                >
                  <TimeCard time={t.time} offLabel={t.offLabel} enabled={t.enabled} active={isActiveTime} />
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

          {/* ✅ Obs */}
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

      {economySlot ? <div className="mt-3">{economySlot}</div> : null}
    </div>
  );
}
