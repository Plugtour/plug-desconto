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
const WA_BTN_BOTTOM_PX = 60;
const WA_BTN_SIZE_PX = 64;

// ✅ agora o balão “volta” e fica até a metade do redondo verde
const BUBBLE_BOTTOM_PX = WA_BTN_BOTTOM_PX + Math.round(WA_BTN_SIZE_PX / 2) + 25; // metade do botão
const BUBBLE_SHIFT_LEFT_PX = 23; // mantém o canto inferior direito “na seta”

// ✅ placeholder longo pra testar “Ver mais”
const DETAILS_PREVIEW =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const DETAILS_MORE =
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' +
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

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

  // Padrão ilustrativo parecido com o print (alguns com % off, outros com "-")
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

  // ✅ “Ver mais” do Detalhes (abre/fecha deslizando)
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const detailsMoreInnerRef = useRef<HTMLDivElement | null>(null);
  const [detailsMoreH, setDetailsMoreH] = useState(0);

  // ✅ âncora: “Detalhes:” precisa ficar travado ao expandir/recolher
  const detailsAnchorRef = useRef<HTMLDivElement | null>(null);

  // ✅ sanfona (uma por vez, igual print)
  const [openAcc, setOpenAcc] = useState<AccordionKey | null>(null);

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

    // reinicia “Ver mais”
    setDetailsExpanded(false);

    // reinicia sanfona
    setOpenAcc(null);

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

  function closeBubbleOnly() {
    setBubbleEntered(false);
    window.setTimeout(() => setBubbleOpen(false), BUBBLE_ANIM_MS);
  }

  const ratingNum = Number.isFinite(Number(data.rating ?? 0)) ? Number(data.rating ?? 0) : 0;
  const reviewsNum = Number(data.reviews ?? 0) || 0;

  // mede altura do bloco “mais” (pra animar max-height)
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
    const scroller = bodyRef.current;
    const anchor = detailsAnchorRef.current;
    const prevTop = anchor?.getBoundingClientRect().top ?? null;

    setDetailsExpanded((v) => !v);

    // mantém “Detalhes:” travado na altura visual
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!scroller || !anchor || prevTop == null) return;
        const nextTop = anchor.getBoundingClientRect().top;
        const delta = nextTop - prevTop;
        if (Math.abs(delta) > 0.5) {
          scroller.scrollBy({ top: delta, left: 0, behavior: 'auto' });
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

  // ✅ carrossel igual ao print (hora + % off + botão)
  const funcionamentoTimeCards = useMemo(() => buildHalfHourTimeCards(11, 0, 23, 0), []);

  // ✅ EXCETOS: se não vier do backend, usa placeholder (Natal, Ano Novo, Páscoa)
  const exceptionsClean = useMemo(() => {
    const base = (data.exceptions ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
    if (base.length > 0) return base;

    return ['Natal', 'Ano Novo', 'Páscoa', '24/12, 25/12, 31/12 e 01/01'];
  }, [data.exceptions]);

  const hasExceptions = exceptionsClean.length > 0;

  return (
    <div className="relative">
      {/* BODY (tudo rola junto) */}
      <div ref={bodyRef} className="relative max-h-[78vh] overflow-y-auto px-3 pb-[30px] pt-3">
        {/* Título + estrelas/avaliações */}
        <div>
          <div className="text-[22px] font-bold tracking-[-.2px] leading-[22px] text-zinc-600">{data.title}</div>

          <div className="mt-2">
            <StarsRow rating={ratingNum} sizeClass="h-[19px] w-[19px]" />
            <div className="mt-0.5 text-[12px] text-zinc-500">
              <span className="font-semibold text-zinc-700">{ratingNum.toFixed(1)}</span> de{' '}
              <span className="font-semibold text-zinc-700">{reviewsNum}</span> avaliações
            </div>
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

        {/* ✅ IMPORTANTE:
            Banner + Subtítulo + Divisor só aparecem no tab "detalhes"
        */}
        {tab === 'detalhes' ? (
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div className="my-[14px] border-b border-dotted border-black/25" />
          </>
        ) : null}

        {/* Conteúdo */}
        {tab === 'detalhes' ? (
          <>
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </AccordionItem>

                  <AccordionItem
                    title="Quanto posso economizar:"
                    open={openAcc === 'economia'}
                    onToggle={() => setOpenAcc((v) => (v === 'economia' ? null : 'economia'))}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </AccordionItem>

                  <AccordionItem
                    title="Dúvidas frequentes:"
                    open={openAcc === 'duvidas'}
                    onToggle={() => setOpenAcc((v) => (v === 'duvidas' ? null : 'duvidas'))}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </AccordionItem>

                  <AccordionItem
                    title="Regras:"
                    open={openAcc === 'regras'}
                    onToggle={() => setOpenAcc((v) => (v === 'regras' ? null : 'regras'))}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
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
        ) : null}

        {/* ✅ Agora as outras abas NÃO apagam o Detalhes.
            Apenas mostram "Em construção", e o banner não aparece (porque ficou acima no if do Detalhes).
        */}
        {tab === 'avaliacoes' ? (
          <div className="pt-4">
            <SectionTitle>Avaliações</SectionTitle>
            <div className="mt-2 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-600">
              Em construção. Esta área será disponibilizada em breve.
            </div>
          </div>
        ) : null}

        {tab === 'endereco' ? (
          <div className="pt-4">
            <SectionTitle>Endereço</SectionTitle>
            <div className="mt-2 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-600">
              Em construção. Esta área será disponibilizada em breve.
            </div>
          </div>
        ) : null}
      </div>

      {/* ✅ CTA fixo: colado nas laterais e no fundo do modal, sem arredondamento */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-[430px] max-w-full -translate-x-1/2">
        <button
          type="button"
          className={[
            'pointer-events-auto w-full',
            'rounded-none', // 3) sem arredondamento
            'bg-zinc-800',
            'py-4',
            'text-center',
            'font-extrabold',
            'text-yellow-400',
            'shadow-lg',
            'active:scale-[0.995]',
          ].join(' ')}
          onClick={() => {
            // placeholder
          }}
          aria-label="Adquirir assinatura Plug Descontos"
        >
          {/* 4) texto “Adquira aqui a sua assinatura” em branco */}
          <span className="block text-[18px] leading-[20px] text-white">Adquira aqui a sua assinatura</span>
          <span className="mt-1 block text-[20px] leading-[22px] text-yellow-400">Plug Descontos</span>
        </button>
      </div>

      {/* ✅ Balão WhatsApp + X (largura -30px) */}
      {bubbleOpen ? (
        <div
          className="pointer-events-none fixed left-1/2 z-[65] w-[430px] max-w-full -translate-x-1/2 px-3"
          style={{ bottom: BUBBLE_BOTTOM_PX }}
        >
          <div
            className={[
              'pointer-events-auto ml-auto relative',
              'w-[142px]',
              'transition-[opacity,transform] ease-out',
              `duration-[${BUBBLE_ANIM_MS}ms]`,
              bubbleEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]',
            ].join(' ')}
            style={{ marginRight: BUBBLE_SHIFT_LEFT_PX }}
          >
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
                <div>Fale com o estabelecimento:</div>
                <div>
                  <span className="font-semibold">{(data.vendorName ?? '').trim() || data.title}</span>
                </div>
              </div>
            </a>

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
                '-top-[30px]',
                '-right-[8px]',
                'grid h-10 w-10 place-items-center',
                'text-red-600',
                'active:scale-95',
              ].join(' ')}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {/* Botão WhatsApp */}
      <a
        href={whatsappHref || '#'}
        className="fixed bottom-[65px] left-1/2 z-[70] w-[430px] max-w-full -translate-x-1/2 px-3"
        aria-label="WhatsApp"
        onClick={(e) => {
          if (!whatsappHref || whatsappHref === '#') e.preventDefault();
        }}
      >
        <div className="ml-auto relative grid h-[64px] w-[64px] place-items-center rounded-full bg-green-500 shadow-lg">
          <WhatsAppIcon className="h-14 w-14 text-white" />

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

function StarsRow({ rating, sizeClass = 'h-[19px] w-[19px]' }: { rating: number; sizeClass?: string }) {
  const r = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = r <= i ? 0 : r >= i + 1 ? 100 : Math.round((r - i) * 100);
        return (
          <span key={i} className={i === 0 ? '' : '-ml-[3px]'}>
            <Star fillPct={fill} className={sizeClass} />
          </span>
        );
      })}
    </div>
  );
}

function Star({ fillPct, className }: { fillPct: number; className?: string }) {
  const id = React.useId();
  const pct = Math.max(0, Math.min(100, fillPct));

  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-[19px] w-[19px]'} aria-hidden="true">
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

function CalendarBlock({
  cal,
  noOuterBorder = false,
}: {
  cal: NonNullable<ProductModalData['calendar']>;
  noOuterBorder?: boolean;
}) {
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
    <div className={noOuterBorder ? 'bg-transparent p-0' : 'rounded-[10px] border border-black/10 bg-zinc-100 p-2'}>
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

function AccordionItem({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => setH(el.scrollHeight || 0);
    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-full',
          'rounded-[6px]',
          'bg-zinc-600',
          'px-3 py-2',
          'text-left',
          'text-[13px] font-extrabold text-white',
          'flex items-center justify-between',
          'active:scale-[0.99]',
        ].join(' ')}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="ml-3 grid h-6 w-6 place-items-center rounded bg-white/10">
          {open ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>

      <div
        className={[
          'overflow-hidden',
          'transition-[max-height,opacity,transform] duration-[520ms] ease-out',
          open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible',
        ].join(' ')}
        style={{ maxHeight: open ? h : 0 }}
        aria-hidden={!open}
      >
        <div ref={innerRef} className="pt-2">
          <div className="rounded-[6px] border border-black/10 bg-white p-3 text-[13px] leading-[16px] text-zinc-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
