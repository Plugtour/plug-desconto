'use client';

import React, { useMemo } from 'react';
import UsedListItem from './UsedListItem';
import { USED_MOCK, type UsedItem } from '@/app/_data/usedMock';

const BOTTOM_NAV_HEIGHT_PX = 74;

function moneyBRL(cents: number) {
  return ((cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function UtilizadosScreen() {
  const items = useMemo(() => {
    return [...USED_MOCK].sort((a, b) => +new Date(b.usedAt) - +new Date(a.usedAt));
  }, []);

  const totalSavedCents = useMemo(() => items.reduce((acc, it) => acc + (it.savedCents || 0), 0), [items]);
  const totalText = useMemo(() => moneyBRL(totalSavedCents), [totalSavedCents]);

  function onRate(item: UsedItem) {
    // depois você troca por modal/step real
    alert(`Avaliar: ${item.partnerName} • ${item.benefitTitle}`);
  }

  function onView(item: UsedItem) {
    // depois você troca por modal/step real
    alert(`Detalhes: ${item.partnerName} • ${item.benefitTitle}`);
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      {/* Topo */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <h1 className="text-[18px] font-extrabold text-zinc-900">Utilizados</h1>
          <p className="mt-0.5 text-[12px] text-zinc-600">
            Seu histórico completo e quanto você já economizou.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="mx-auto max-w-md px-4 pt-4"
        style={{
          paddingBottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom) + 92px)`, // espaço pro card total + menu
        }}
      >
        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="text-[15px] font-bold text-zinc-900">Nenhum desconto utilizado ainda</div>
            <div className="mt-1 text-[13px] text-zinc-600">
              Quando você usar um benefício, ele aparece aqui.
            </div>
            <button
              type="button"
              className="mt-4 rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white"
              onClick={() => alert('Ir para descontos')}
            >
              Ver descontos disponíveis
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <UsedListItem key={it.id} item={it} onRate={onRate} onView={onView} />
            ))}
          </div>
        )}
      </div>

      {/* Total Economizado (fixo acima do BottomNav) */}
      <div
        className="fixed left-0 right-0 z-[139] border-t border-zinc-200 bg-white"
        style={{
          bottom: `calc(${BOTTOM_NAV_HEIGHT_PX}px + env(safe-area-inset-bottom))`,
        }}
      >
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold text-zinc-700">Total Economizado</div>
                <div className="text-[18px] font-extrabold text-emerald-600">{totalText}</div>
              </div>

              <button
                type="button"
                className="rounded-full bg-zinc-900 px-4 py-2 text-[12px] font-semibold text-white"
                onClick={() => alert('Relatório (futuro)')}
              >
                Ver relatório
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
