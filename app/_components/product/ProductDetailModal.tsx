'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ModalOverlay from '@/app/_components/modals/ModalOverlay';
import useLockBodyScroll from '@/app/_components/modals/useLockBodyScroll';

type ProductMedia = { src: string; alt?: string };

export type ProductDetail = {
  id: string;
  title: string; // Restaurante Quintanilha
  subtitle?: string;
  media: ProductMedia[];
  headline: string; // "Na compra de um Buffet, ganhe..."
  detailsHtml?: string;
  isFavorite?: boolean;

  calendar?: {
    days: Array<{ key: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sáb' | 'dom'; label: string }>;
    dayRow: boolean[]; // 7
    nightRow: boolean[]; // 7
  };

  times?: Array<{
    time: string; // "11:00"
    offLabel: string; // "50% off"
    enabled?: boolean;
  }>;

  exceptions?: string[];
  address?: { title?: string; text: string };
  rating?: { score: number; count: number };
};

type Props = {
  open: boolean;
  onClose: () => void;
  product: ProductDetail | null;
};

type TabKey = 'detalhes' | 'avaliacoes' | 'endereco';

export default function ProductDetailModal({ open, onClose, product }: Props) {
  useLockBodyScroll(open);

  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<TabKey>('detalhes');
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const t = window.setTimeout(() => setEntered(true), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!product) return;
    setTab('detalhes');
    setIdx(0);
    setFav(!!product.isFavorite);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const media = product?.media ?? [];
  const active = media[idx];

  function prev() {
    if (!media.length) return;
    setIdx((i) => (i - 1 + media.length) % media.length);
  }
  function next() {
    if (!media.length) return;
    setIdx((i) => (i + 1) % media.length);
  }

  const title = product?.title ?? 'Carregando...';

  if (!open) return null;

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        className={[
          'mx-auto w-full max-w-[430px]',
          'rounded-t-[22px] bg-zinc-100',
          'shadow-[0_-18px_40px_rgba(0,0,0,.20)]',
          'overflow-hidden',
          'transform transition-transform duration-300 ease-out',
          entered ? 'translate-y-0' : 'translate-y-[110%]',
        ].join(' ')}
      >
        {/* HEADER */}
        <div className="relative px-4 pt-4 pb-3">
          <div className="pr-10 text-[22px] font-extrabold tracking-[-.2px] text-zinc-700">
            {title}
          </div>

          {/* linha pontilhada como no mock */}
          <div className="mt-2 border-b border-dotted border-black/30" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center"
            aria-label="Fechar"
          >
            <span className="text-[30px] leading-none text-red-600">×</span>
          </button>

          {/* ABAS */}
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

        {/* BODY SCROLL */}
        <div className="relative max-h-[78vh] overflow-y-auto px-4 pb-24 pt-3">
          {/* SLIDER */}
          <div className="relative overflow-hidden rounded-[12px] bg-zinc-200">
            <div className="aspect-[16/9] w-full">
              {active?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.src} alt={active.alt ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>

            {/* setas amarelas (sem bolinha) */}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center"
                  aria-label="Anterior"
                >
                  <ChevronYellow dir="left" />
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center"
                  aria-label="Próximo"
                >
                  <ChevronYellow dir="right" />
                </button>

                {/* bolinhas */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIdx(i)}
                      className={['h-2 w-2 rounded-full', i === idx ? 'bg-white' : 'bg-white/55'].join(' ')}
                      aria-label={`Imagem ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* HEADLINE + FAVORITO */}
          <div className="mt-3 flex items-start gap-3">
            <div className="flex-1 text-[15px] font-semibold leading-snug text-zinc-600">
              {product?.headline ?? '—'}
            </div>

            <button
              type="button"
              onClick={() => setFav((v) => !v)}
              className="mt-0.5 grid h-9 w-9 place-items-center"
              aria-label="Favoritar"
            >
              <HeartIcon filled={fav} />
            </button>
          </div>

          <div className="my-3 border-b border-dotted border-black/30" />

          {/* CONTEÚDO POR ABA */}
          {tab === 'detalhes' && (
            <>
              <SectionTitle>Detalhes:</SectionTitle>

              <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                {product?.detailsHtml ?? '—'}
              </div>

              {/* CALENDÁRIO */}
              {product?.calendar ? (
                <div className="mt-4">
                  <CalendarBlock cal={product.calendar} />
                </div>
              ) : null}

              {/* HORÁRIOS */}
              {product?.times?.length ? (
                <>
                  <div className="mt-4 flex items-center gap-2">
                    <SectionTitle>Horários:</SectionTitle>
                    <span className="text-[16px]">⚠️</span>
                  </div>

                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    {product.times.map((t, i) => (
                      <TimeCard key={i} {...t} />
                    ))}
                  </div>
                </>
              ) : null}

              {/* EXCEÇÕES */}
              {product?.exceptions?.length ? (
                <>
                  <SectionTitle className="mt-4">Excetos:</SectionTitle>
                  <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                    {product.exceptions.map((x, i) => (
                      <div key={i}>{x}</div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* ACCORDIONS (barras cinza escuro) */}
              <div className="mt-4 space-y-2 pb-2">
                <AccordionBar title="Quanto posso economizar:" />
                <AccordionBar title="Regras:" />
              </div>
            </>
          )}

          {tab === 'avaliacoes' && (
            <div className="pt-2">
              <SectionTitle>Avaliações</SectionTitle>
              <div className="mt-1 text-[13px] text-zinc-600">
                {product?.rating
                  ? `Nota ${product.rating.score.toFixed(1)} • ${product.rating.count} avaliações`
                  : 'Sem avaliações ainda.'}
              </div>
              <div className="mt-3 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-600">
                Aqui entra a lista de avaliações (título, nome, texto curto).
              </div>
            </div>
          )}

          {tab === 'endereco' && (
            <div className="pt-2">
              <SectionTitle>Endereço</SectionTitle>
              <div className="mt-2 rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-700">
                {product?.address?.text ?? '—'}
              </div>
            </div>
          )}

          {/* balão “Fale com...” */}
          <div className="pointer-events-none fixed bottom-[122px] left-1/2 z-[60] w-[430px] max-w-full -translate-x-1/2 px-4">
            <div className="pointer-events-auto ml-auto w-[170px] rounded-[10px] border border-black/10 bg-white p-2 text-[11px] text-zinc-700 shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold leading-tight">Fale com</div>
                  <div className="leading-tight">{title}</div>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600" type="button" aria-label="Fechar">
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* botão WhatsApp (mock: bolha verde grande) */}
          <a
            href="#"
            className="fixed bottom-[74px] left-1/2 z-[70] w-[430px] max-w-full -translate-x-1/2 px-4"
            aria-label="WhatsApp"
          >
            <div className="ml-auto grid h-[64px] w-[64px] place-items-center rounded-full bg-green-500 shadow-lg">
              <span className="text-[28px] text-white">🟢</span>
            </div>
          </a>
        </div>
      </div>
    </ModalOverlay>
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
        'relative h-10 flex-1 rounded-[0px] text-[13px] font-semibold',
        'bg-zinc-600 text-white',
        'shadow-sm',
      ].join(' ')}
    >
      <span className="relative z-[1]">{children}</span>

      {/* linha amarela na aba ativa */}
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-10-9.3C.3 8.1 2.3 5 5.7 5c1.8 0 3.2.9 4.3 2.3C11.1 5.9 12.5 5 14.3 5c3.4 0 5.4 3.1 3.7 6.7C19.5 16.4 12 21 12 21z"
        fill={filled ? '#fb7185' : 'none'}
        stroke={filled ? '#fb7185' : '#fb7185'}
        strokeOpacity={filled ? 1 : 0.55}
        strokeWidth="1.8"
      />
    </svg>
  );
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

function CalendarBlock({ cal }: { cal: NonNullable<ProductDetail['calendar']> }) {
  const days = cal.days?.length === 7 ? cal.days : [
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
