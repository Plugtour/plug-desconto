// app/_components/product/ProductTabEndereco.tsx
'use client';

import React from 'react';
import { SectionTitle } from './tabs/ProductDetailUI';

export default function ProductTabEndereco() {
  return (
    <div className="mt-4">
      <SectionTitle>Endereço</SectionTitle>

      <div className="mt-3 rounded-[12px] border border-black/10 bg-white p-4 text-[13px] text-zinc-600">
        <div className="text-[14px] font-extrabold text-zinc-700">Em construção</div>
        <div className="mt-1 leading-[18px] text-zinc-500">Em breve você verá mapa, rota e informações completas do local.</div>
      </div>
    </div>
  );
}
