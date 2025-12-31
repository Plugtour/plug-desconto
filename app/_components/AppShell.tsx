// app/_components/AppShell.tsx
'use client';

import React from 'react';
import BottomNav from './bottom-nav/BottomNav';
import { BOTTOM_NAV_ITEMS } from './bottom-nav/items';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // mesma altura do BottomNav (74) pra não esconder conteúdo atrás do rodapé
  const bottomH = 74;

  return (
    <div className="min-h-screen">
      <div style={{ paddingBottom: `calc(${bottomH}px + env(safe-area-inset-bottom))` }}>
        {children}
      </div>
      <BottomNav items={BOTTOM_NAV_ITEMS} heightPx={bottomH} />
    </div>
  );
}
