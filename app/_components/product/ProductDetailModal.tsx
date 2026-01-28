// ProductDetailModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ModalOverlay from '@/app/_components/modals/ModalOverlay';
import useLockBodyScroll from '@/app/_components/modals/useLockBodyScroll';

import {
  TabButton,
  SectionTitle,
  ChevronYellow,
  CalendarBlock,
  TimeCard,
  AccordionItem,
} from './tabs/ProductDetailUI';

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
  // trava SEMPRE a tela atrás enquanto open=true
  useLockBodyScroll(open);

  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<TabKey>('detalhes');
  const [idx, setIdx] = useState(0);

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

  const TOP_OFFSET = 'calc(env(safe-area-inset-top) + 16px)';

  return (
    <ModalOverlay open={open} onClose={onClose}>
      {/* wrapper FIXO */}
      <div
        className="fixed inset-x-0 bottom-0 z-[220]"
        style={{ top: TOP_OFFSET }}
        onClick={onClose}
        aria-hidden={!open}
      >
        {/* MODAL */}
        <div
          className={[
            'mx-auto w-full max-w-[430px]',
            'rounded-t-[22px] bg-zinc-100',
            'shadow-[0_-18px_40px_rgba(0,0,0,.20)]',
            'overflow-hidden',
            'transform transition-transform duration-300 ease-out',
            entered ? 'translate-y-0' : 'translate-y-[110%]',
            'h-full',
            'flex flex-col',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="relative shrink-0 px-4 pt-4 pb-3">
            <div className="pr-10 text-[22px] font-extrabold tracking-[-.2px] text-zinc-700">{title}</div>

            <div className="mt-2 border-b border-dotted border-black/30" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center"
              aria-label="Fechar"
            >
              <span className="text-[30px] leading-none text-red-600">×</span>
            </button>

            <div className="mt-[14px] flex gap-2">
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

          {/* BODY: único lugar que rola */}
          <div
            className={['relative flex-1 overflow-y-auto px-4 pb-24 pt-3', 'overscroll-contain', 'touch-pan-y'].join(
              ' '
            )}
            style={{ WebkitOverflowScrolling: 'touch' as any }}
          >
            {tab !== 'detalhes' ? (
              <div className="rounded-[12px] border border-black/10 bg-white p-3 text-[13px] text-zinc-600">
                Em construção.
              </div>
            ) : (
              <>
                {/* SLIDER */}
                <div className="relative -mx-4 overflow-hidden bg-zinc-200">
                  <div className="aspect-[16/9] w-full">
                    {active?.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={active.src} alt={active.alt ?? ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>

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

                {/* SUBTÍTULO */}
                <div className="mt-[14px]">
                  <div
                    className="text-[16px] font-extrabold leading-snug text-zinc-500"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as any,
                      overflow: 'hidden',
                    }}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </div>
                </div>

                <div className="mt-3 mb-3 border-b border-dotted border-black/30" />

                <SectionTitle>Detalhes:</SectionTitle>

                <div className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua.
                </div>

                <div className="mt-2 text-[13px] leading-relaxed text-zinc-600">{product?.detailsHtml ?? '—'}</div>

                {/* CALENDÁRIO */}
                {product?.calendar ? (
                  <div className="mt-4">
                    <CalendarBlock cal={product.calendar as any} />
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

                {/* ACCORDIONS (agora padronizado com AccordionItem) */}
                <div className="mt-4 space-y-2 pb-2">
                  <AccordionItem title="Quanto posso economizar:" open={false} onToggle={() => {}}>
                    Em construção.
                  </AccordionItem>
                  <AccordionItem title="Regras:" open={false} onToggle={() => {}}>
                    Em construção.
                  </AccordionItem>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
