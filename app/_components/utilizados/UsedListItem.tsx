'use client';

import React, { useMemo } from 'react';
import type { UsedItem } from '@/app/_data/usedMock';
import { Stars } from './stars';

function moneyBRL(cents: number) {
  return ((cents || 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function dateBR(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** placeholder visual */
const PLACEHOLDER_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="106" height="106">
    <rect width="106" height="106" rx="22" fill="#e4e4e7"/>
    <circle cx="53" cy="42" r="18" fill="#d4d4d8"/>
    <rect x="24" y="70" width="58" height="12" rx="6" fill="#d4d4d8"/>
  </svg>
`);

const IMAGE_SIZE = 106;

export default function UsedListItem({
  item,
  onRate,
  onView,
}: {
  item: UsedItem;
  onRate: (item: UsedItem) => void;
  onView: (item: UsedItem) => void;
}) {
  const savedText = useMemo(() => moneyBRL(item.savedCents), [item.savedCents]);
  const usedDate = useMemo(() => dateBR(item.usedAt), [item.usedAt]);

  // ✅ linha única: "Parceiro • Benefício"
  const titleLine = `${item.partnerName} • ${item.benefitTitle}`;

  return (
    <div className="py-3">
      <div className="flex items-start gap-4">
        {/* 🖼️ Imagem fixa */}
        <div
          className="shrink-0 overflow-hidden rounded-md bg-zinc-200"
          style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.partnerLogoUrl || PLACEHOLDER_LOGO}
            alt={item.partnerName}
            className="h-full w-full object-contain p-2"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== PLACEHOLDER_LOGO) img.src = PLACEHOLDER_LOGO;
            }}
          />
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1">
          {/* ✅ topo: só título + data (libera largura pro título) */}
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-zinc-900 leading-snug">
              {/* 2 linhas no máximo pra ver mais título */}
              <span className="line-clamp-2">{titleLine}</span>
            </div>
            <div className="mt-0.5 text-[12px] text-zinc-500">{usedDate}</div>
          </div>

          {/* ✅ base: avaliação à esquerda + valor economizado à direita */}
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              {item.rating ? (
                <>
                  <Stars value={item.rating} />
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    className="mt-0.5 text-[12px] font-semibold text-zinc-700 underline underline-offset-2"
                  >
                    Ver Minhas Avaliações
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onRate(item)}
                  className="rounded-full bg-zinc-900 px-4 py-1.5 text-[12px] font-semibold text-white"
                >
                  Avaliar agora
                </button>
              )}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[11px] font-medium text-zinc-500">Valor economizado</div>
              <div className="text-[14px] font-extrabold text-emerald-600">{savedText}</div>
            </div>
          </div>
        </div>
      </div>

      {/* divisor */}
      <div className="mt-3 h-px w-full bg-zinc-200" />
    </div>
  );
}
