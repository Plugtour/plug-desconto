// app/_components/product/ProductDetailContent.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import ProductTabDetalhes from './ProductTabDetalhes';
import ProductTabAvaliacoes from './ProductTabAvaliacoes';
import ProductTabEndereco from './ProductTabEndereco';

import { StarsRow, TabButton, WhatsAppIcon } from './tabs/ProductDetailUI';

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
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // balão
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleEntered, setBubbleEntered] = useState(false);

  useEffect(() => {
    setTab(tabDefault);

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

  function closeBubbleOnly() {
    setBubbleEntered(false);
    window.setTimeout(() => setBubbleOpen(false), BUBBLE_ANIM_MS);
  }

  const ratingNum = Number.isFinite(Number(data.rating ?? 0)) ? Number(data.rating ?? 0) : 0;
  const reviewsNum = Number(data.reviews ?? 0) || 0;

  return (
    <div className="relative">
      {/* BODY (tudo rola junto) */}
      <div
        ref={bodyRef}
        className="relative max-h-[78vh] overflow-y-auto px-3 pt-3 pb-[50px]"
        style={{ scrollPaddingBottom: 50 }}
        >
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

        {/* Conteúdo (separado em arquivos) */}
        {tab === 'detalhes' ? (
          <ProductTabDetalhes data={data} economySlot={economySlot} />
        ) : tab === 'avaliacoes' ? (
          <ProductTabAvaliacoes />
        ) : (
          <ProductTabEndereco />
        )}
      </div>

      {/* ✅ CTA fixo: colado nas laterais e no fundo do modal, sem arredondamento */}
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[60] w-[430px] max-w-full -translate-x-1/2">
        <button
          type="button"
          className={[
            'pointer-events-auto w-full',
            'rounded-none',
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
          <span className="block text-[18px] leading-[20px] text-white">Adquira aqui a sua assinatura</span>
          <span className="mt-1 block text-[20px] leading-[22px] text-yellow-400">Plug Descontos</span>
        </button>
      </div>

      {/* ✅ Balão WhatsApp + X */}
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
