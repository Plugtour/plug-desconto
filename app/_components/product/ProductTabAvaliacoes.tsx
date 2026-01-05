// app/_components/product/ProductTabAvaliacoes.tsx
'use client';

import React from 'react';
import { SectionTitle } from './tabs/ProductDetailUI';

export default function ProductTabAvaliacoes() {
  return (
    <div className="mt-4">
      <SectionTitle>Avaliações</SectionTitle>

      <div className="mt-3 rounded-[12px] border border-black/10 bg-white p-4 text-[13px] text-zinc-600">
        <div className="text-[14px] font-extrabold text-zinc-700">Em construção</div>
        <div className="mt-1 leading-[18px] text-zinc-500">
          Estamos preparando essa área para exibir avaliações completas com notas, comentários e filtros.
        </div>
      </div>
    </div>
  );
}
