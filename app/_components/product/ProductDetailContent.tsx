// app/_components/product/ProductDetailContent.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Media = { src: string; alt?: string };

export type ProductModalData = {
  id: string;
  title: string;
  headline?: string | null;

  vendorName?: string | null;
  vendorAbout?: string | null;

  media?: Media[];
  addressText?: string | null;

  rating?: number | null;
  reviews?: number | null;

  savingsText?: string | null;
  priceText?: string | null;

  times?: Array<{ time: string; offLabel: string; enabled?: boolean }>;
  exceptions?: string[];

  calendar?: {
    days: Array<{ key: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sáb' | 'dom'; label: string }>;
    dayRow: boolean[];
    nightRow: boolean[];
  };
};

type Props = {
  data: ProductModalData;

  tabDefault?: 'detalhes' | 'avaliacoes' | 'endereco';

  isFavorite: boolean;
  onToggleFavorite: () => void;

  onClose: () => void;

  whatsappHref?: string | null;

  economySlot?: React.ReactNode;
};

const SLIDE_DURATION_MS = 6500;
const SLIDE_STEP_MS = 50;

// balão: delay + animação suave
const BUBBLE_DELAY_MS = 10_000;
const BUBBLE_ANIM_MS = 520;

// número provisório (balão)
const WHATSAPP_TMP_NUMBER = '9999999999';
const WHATSAPP_TMP_LINK = `https://wa.me/${WHATSAPP_TMP_NUMBER}`;

// ✅ posição do botão do WhatsApp (precisa bater com o bottom-[19px])
const WA_BTN_BOTTOM_PX = 19;
const WA_BTN_SIZE_PX = 64;

// ✅ alvo do balão: canto inferior direito na “ponta da seta” (perto do topo/esquerda do botão)
const BUBBLE_BOTTOM_PX = WA_BTN_BOTTOM_PX + WA_BTN_SIZE_PX - 6; // sobe o balão
const BUBBLE_SHIFT_LEFT_PX = 46; // traz o canto inferior direito pra cima do botão

export default function ProductDetailContent({
  data,
  tabDefault = 'detalhes',
  isFavorite,
  onToggleFavorite,
  onClose,
  whatsappHref = '#',
  economySlot,
}: Props) {
  const [tab, setTab] = useState<'detalhes' | 'avaliacoes' | 'endereco'>(tabDefault);
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);

  const bodyRef = useRef<HTMLDivElement | null>(null);

  // balão
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleEntered, setBubbleEntered] = useState(false);

  const media = data.media ?? [];
  const canSlide = media.length > 1;
  const active = media[idx];

  useEffect(() => {
    setTab(tabDefault);
    setIdx(0);
    setTick(0);

    // reinicia balão
    setBubbleEntered(false);
    setBubbleOpen(false);

    const t = window.setTimeout(() => {
      setBubbleOpen(true);
      requestAnimationFrame(() => setBubbleEntered(true));
    }, BUBBLE_DELAY_MS);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const vendorName = (data.vendorName ?? '').trim() || data.title;

  const aboutText = useMemo(() => {
    const v = (data.vendorAbout ?? '').trim();
    if (v) return v;
    const fallback = (data.headline ?? '').trim();
    return fallback || '—';
  }, [data.vendorAbout, data.headline]);

  const progressPct = useMemo(() => {
    if (!canSlide) return 100;
    const pct = (tick / SLIDE_DURATION_MS) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [tick, canSlide]);

  function prev() {
    if (!media.length) return;
    setTick(0);
    setIdx((i) => (i - 1 + media.length) % media.length);
  }

  function next() {
    if (!media.length) return;
    setTick(0);
    setIdx((i) => (i + 1) % media.length);
  }

  // rolar sobre o HEADER deve rolar o BODY
  function forwardWheelToBody(e: React.WheelEvent) {
    const el = bodyRef.current;
    if (!el) return;

    const canScroll = el.scrollHeight > el.clientHeight + 1;
    if (!canScroll) return;

    e.preventDefault();
    e.stopPropagation();

    el.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
  }

  function closeBubbleOnly() {
    setBubbleEntered(false);
    window.setTimeout(() => setBubbleOpen(false), BUBBLE_ANIM_MS);
  }

  return (
    <div className="relative">
      {/* HEADER */}
      <div className="px-3 pt-3 pb-2" onWheelCapture={forwardWheelToBody}>
        <div className="text-[22px] font-extrabold tracking-[-.2px] leading-[22px] text-zinc-800">
          {data.title}
        </div>

        <div className="mt-[10px] flex gap-2">
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

      {/* BODY */}
      <div ref={bodyRef} className="relative max-h-[78vh] overflow-y-auto px-3 pb-24 pt-2">
        {/* Banner */}
        <div className="-mx-3">
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
                <div className="flex items-start justify-between gap-2">
                  <div className="leading-tight">
                    Fale com o estabelecimento <span className="font-semibold">{vendorName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeBubbleOnly();
                    }}
                    aria-label="Fechar balão"
                    className="grid h-10 w-10 place-items-center text-red-600"
                  >
                    <span className="text-[32px] leading-none">×</span>
                  </button>
                </div>

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
          <div className="line-clamp-3 text-[16px] font-extrabold leading-snug text-zinc-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </div>
        </div>

        <div className="my-[14px] border-b border-dotted border-black/25" />

        {/* Conteúdo */}
        {tab === 'detalhes' ? (
          <>
            <SectionTitle>Detalhes:</SectionTitle>

            <div className="mt-2 text-[13px] leading-relaxed text-zinc-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>

            <div className="mt-2 text-[13px] leading-relaxed text-zinc-600">{aboutText}</div>

            {economySlot ? <div className="mt-3">{economySlot}</div> : null}

            {data.calendar ? (
              <div className="mt-4">
                <CalendarBlock cal={data.calendar} />
              </div>
            ) : null}

            {data.times?.length ? (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <SectionTitle>Horários:</SectionTitle>
                  <span className="text-[16px]">⚠️</span>
                </div>

                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {data.times.map((t, i) => (
                    <TimeCard key={i} {...t} />
                  ))}
                </div>
              </>
            ) : null}

            {data.exceptions?.length ? (
              <>
                <SectionTitle className="mt-4">Excetos:</SectionTitle>
                <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                  {data.exceptions.map((x, i) => (
                    <div key={i}>{x}</div>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-4 space-y-2 pb-2">
              <AccordionBar title="Quanto posso economizar:" />
              <AccordionBar title="Regras:" />
            </div>
          </>
        ) : null}

        {tab === 'avaliacoes' ? (
          <div className="pt-2">
            <SectionTitle>Avaliações</SectionTitle>

            <div className="mt-2">
              <StarsRow rating={Number.isFinite(Number(data.rating ?? 0)) ? Number(data.rating ?? 0) : 0} />
              <div className="-mt-0.5 text-[12px] text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  {Number.isFinite(Number(data.rating ?? 0)) ? Number(data.rating ?? 0).toFixed(1) : '0.0'}
                </span>{' '}
                de <span className="font-semibold text-zinc-700">{Number(data.reviews ?? 0) || 0}</span> avaliações
              </div>
            </div>

            <div className="mt-3 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-600">
              Aqui entra a lista de avaliações (título, nome, texto curto).
            </div>
          </div>
        ) : null}

        {tab === 'endereco' ? (
          <div className="pt-2">
            <SectionTitle>Endereço</SectionTitle>
            <div className="mt-2 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-700">
              {data.addressText ?? '—'}
            </div>
          </div>
        ) : null}

        {/* ✅ Balão WhatsApp (reposicionado) + ✅ X FORA do balão */}
        {bubbleOpen ? (
          <div
            className="pointer-events-none fixed left-1/2 z-[65] w-[430px] max-w-full -translate-x-1/2 px-3"
            style={{ bottom: BUBBLE_BOTTOM_PX }}
          >
            {/* wrapper relativo pra posicionar o X fora */}
            <div
              className={[
                'pointer-events-auto ml-auto relative',
                'w-[172px]', // 25% menor
                'transition-[opacity,transform] ease-out',
                `duration-[${BUBBLE_ANIM_MS}ms]`,
                bubbleEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]',
              ].join(' ')}
              // ✅ desloca o balão para esquerda sem depender de class dinâmica
              style={{ marginRight: BUBBLE_SHIFT_LEFT_PX }}
            >
              {/* balão clicável */}
              <a
                href={WHATSAPP_TMP_LINK}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-[10px] border border-black/10 bg-white p-2 text-[11px] text-zinc-700 shadow"
                aria-label="Abrir WhatsApp"
                onClick={() => {
                  closeBubbleOnly();
                }}
              >
                <div className="leading-tight">
                  Fale com o estabelecimento <span className="font-semibold">{vendorName}</span>
                </div>
              </a>

              {/* ✅ X fora do balão, do lado direito (como no print) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeBubbleOnly();
                }}
                aria-label="Fechar balão"
                className={[
                  'absolute',
                  // joga pra fora do balão
                  '-right-[44px]',
                  'top-[6px]',
                  // área de toque
                  'grid h-10 w-10 place-items-center',
                  'rounded-full bg-white text-red-600 shadow-md',
                  'active:scale-95',
                ].join(' ')}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
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
        ) : null}

        {/* ✅ Botão WhatsApp */}
        <a
          href={whatsappHref || '#'}
          className="fixed bottom-[19px] left-1/2 z-[70] w-[430px] max-w-full -translate-x-1/2 px-3"
          aria-label="WhatsApp"
          onClick={(e) => {
            if (!whatsappHref || whatsappHref === '#') e.preventDefault();
          }}
        >
          <div className="ml-auto relative grid h-[64px] w-[64px] place-items-center rounded-full bg-green-500 shadow-lg">
            <WhatsAppIcon className="h-14 w-14 text-white" />

            {/* ✅ (1) surge junto com o balão */}
            {bubbleOpen ? (
              <span
                className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-[12px] font-extrabold text-white ring-2 ring-white"
                aria-label="Nova mensagem"
              >
                1
              </span>
            ) : null}
          </div>
        </a>

        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-[12px] bg-white py-3 text-[13px] font-semibold text-zinc-900 ring-1 ring-black/10 hover:bg-black/5"
        >
          Utilizar
        </button>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

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
        'relative h-10 flex-1 rounded-md text-[13px] font-semibold',
        'bg-zinc-600 text-white',
        active ? '' : 'opacity-80',
        'shadow-sm',
      ].join(' ')}
    >
      <span className="relative z-[1]">{children}</span>
      {active ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-yellow-400" /> : null}
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
  return <div className={['text-[15px] font-extrabold text-zinc-700', className].join(' ')}>{children}</div>;
}

function ChevronYellow({ dir }: { dir: 'left' | 'right' }) {
  const flip = dir === 'left' ? 'scale(-1,1)' : undefined;
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" style={{ transform: flip }}>
      <path
        d="M8.5 5.5 16 12l-7.5 6.5"
        fill="none"
        stroke="#facc15"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.11 17.56c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.41.12-.54.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26 0 1.33.97 2.61 1.11 2.79.13.18 1.91 2.92 4.62 4.09.65.28 1.16.44 1.56.56.65.21 1.24.18 1.7.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.16.16-1.28-.06-.12-.25-.2-.52-.34z"
      />
      <path
        fill="currentColor"
        d="M16.02 5.33c-5.89 0-10.69 4.8-10.69 10.69 0 1.88.49 3.71 1.43 5.33L5.2 26.67l5.47-1.44a10.64 10.64 0 0 0 5.35 1.46c5.89 0 10.69-4.8 10.69-10.69 0-5.89-4.8-10.67-10.69-10.67zm0 19.54c-1.7 0-3.36-.46-4.8-1.33l-.35-.2-3.24.86.87-3.16-.22-.33a8.84 8.84 0 0 1-1.43-4.78c0-4.88 3.97-8.85 8.85-8.85 4.88 0 8.85 3.97 8.85 8.85 0 4.88-3.97 8.94-8.85 8.94z"
      />
    </svg>
  );
}

function StarsRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
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

function CalendarBlock({ cal }: { cal: NonNullable<ProductModalData['calendar']> }) {
  const days =
    cal.days?.length === 7
      ? cal.days
      : [
          { key: 'seg', label: 'seg' },
          { key: 'ter', label: 'ter' },
          { key: 'qua', label: 'qua' },
          { key: 'qui', label: 'qui' },
          { key: 'sex', label: 'sex' },
          { key: 'sáb', label: 'sáb' },
          { key: 'dom', label: 'dom' },
        ];

  return (
    <div className="rounded-[10px] border border-black/10 bg-zinc-100 p-2">
      <div className="grid grid-cols-8 gap-1 text-center text-[12px] font-semibold text-zinc-700">
        <div />

        {days.map((d) => (
          <div key={d.key} className="rounded bg-zinc-500/70 py-1 text-white">
            {d.label}
          </div>
        ))}

        <div className="rounded bg-zinc-500/70 py-1 text-white">Dia</div>
        {(cal.dayRow ?? []).slice(0, 7).map((ok, i) => (
          <Cell key={`d-${i}`} ok={ok} />
        ))}

        <div className="rounded bg-zinc-500/70 py-1 text-white">Noite</div>
        {(cal.nightRow ?? []).slice(0, 7).map((ok, i) => (
          <Cell key={`n-${i}`} ok={ok} />
        ))}
      </div>
    </div>
  );
}

function Cell({ ok }: { ok: boolean }) {
  return (
    <div className="grid place-items-center rounded bg-zinc-200 py-1">
      <span className={ok ? 'text-emerald-600' : 'text-red-500'}>{ok ? '✓' : '✕'}</span>
    </div>
  );
}

function TimeCard({ time, offLabel, enabled = true }: { time: string; offLabel: string; enabled?: boolean }) {
  return (
    <div
      className={[
        'min-w-[86px] rounded-[6px] border border-black/15 bg-zinc-100 p-2 text-center',
        enabled ? '' : 'opacity-45',
      ].join(' ')}
    >
      <div className="text-[11px] font-semibold text-zinc-700">{time}</div>
      <div className="mt-0.5 text-[11px] font-extrabold text-red-500">{offLabel || '-'}</div>

      <button
        type="button"
        className="mt-1 w-full rounded-[6px] bg-zinc-200 py-1 text-[11px] font-semibold text-zinc-800"
      >
        Utilizar
      </button>
    </div>
  );
}

function AccordionBar({ title }: { title: string }) {
  return (
    <div className="rounded-[4px] bg-zinc-600 px-3 py-2">
      <div className="text-[13px] font-extrabold text-white">{title}</div>
    </div>
  );
}
