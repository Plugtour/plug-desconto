// app/_components/product/ProductTabDetalhes.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ProductModalData } from './ProductDetailContent';

import {
  AccordionItem,
  CalendarBlock,
  ChevronYellow,
  SectionTitle,
  TimeCard,
} from './tabs/ProductDetailUI';

// ✅ placeholder longo pra testar “Ver mais”
const DETAILS_PREVIEW =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const DETAILS_MORE =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const SLIDE_DURATION_MS = 6500;
const SLIDE_STEP_MS = 50;

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

  const media = data.media ?? [];
  const canSlide = media.length > 1;
  const active = media[idx];

  useEffect(() => {
    setIdx(0);
    setTick(0);
    setDetailsExpanded(false);
    setOpenAcc(null);
  }, [data.id]);

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

  const funcionamentoTimeCards = useMemo(() => buildHalfHourTimeCards(11, 0, 23, 0), []);

  // ✅ EXCETOS: se não vier do backend, usa placeholder
  const exceptionsClean = useMemo(() => {
    const base = (data.exceptions ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
    if (base.length > 0) return base;

    return ['Natal', 'Ano Novo', 'Páscoa', '24/12, 25/12, 31/12 e 01/01'];
  }, [data.exceptions]);

  const hasExceptions = exceptionsClean.length > 0;

  return (
    <>
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

          <div className="mt-[25px] flex items-center gap-2">
            <SectionTitle>Horários:</SectionTitle>
            <span className="text-[16px]">⚠️</span>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {funcionamentoTimeCards.map((t) => (
              <TimeCard key={t.time} time={t.time} offLabel={t.offLabel} enabled={t.enabled} />
            ))}
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

          {/* ✅ Obs (menos espaço embaixo) */}
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
    </>
  );
}
