'use client';

import React, { useState } from 'react';
import FloatingHeader from './FloatingHeader';
import DestinosSheet from '../sheets/DestinosSheet';

type Props = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: Props) {
  const [favoritesCount] = useState<number>(0);
  const [notificationsCount] = useState<number>(0);

  const [destinosOpen, setDestinosOpen] = useState(false);
  const [clubeOpen, setClubeOpen] = useState(false); // ✅ NOVO (placeholder)

  const [, setSearchOpen] = useState(false);
  const [, setFavoritesOpen] = useState(false);
  const [, setNotificationsOpen] = useState(false);

  const [destinoId, setDestinoId] = useState<string>('serra-gaucha');

  // ✅ MOCK (trocar pelo login real)
  const [userName] = useState<string | null>('Marcelo');

  return (
    <div
      style={{
        ['--app-header-h' as any]: 'calc(56px + env(safe-area-inset-top))',
      }}
    >
      <FloatingHeader
        favoritesCount={favoritesCount}
        notificationsCount={notificationsCount}
        userName={userName}
        onOpenDestinos={() => setDestinosOpen(true)}
        onOpenClub={() => setClubeOpen(true)} // ✅ NOVO
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Destinos */}
      <DestinosSheet
        open={destinosOpen}
        onClose={() => setDestinosOpen(false)}
        onSelect={(id) => setDestinoId(id)}
      />

      {/* ✅ Placeholder do Clube (por enquanto) */}
      {clubeOpen && (
        <div className="fixed inset-0 z-[999]">
          <button
            type="button"
            aria-label="Fechar clube"
            onClick={() => setClubeOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[6px] touch-manipulation"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-md px-[5px] pb-[5px]">
              <div className="rounded-t-md bg-zinc-100/92 shadow-2xl ring-1 ring-black/10 overflow-hidden">
                <div className="px-4 pt-3 pb-4">
                  <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />
                  <div className="text-[14px] font-semibold text-black">Meu Clube</div>
                  <div className="mt-1 text-[13px] text-black/60">
                    Aqui vão as informações do clube (placeholder).
                  </div>

                  <button
                    type="button"
                    onClick={() => setClubeOpen(false)}
                    className="mt-4 w-full rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-14" style={{ paddingTop: 'var(--app-header-h, 56px)' }}>
        {children}
      </div>

      <div className="hidden" data-destino={destinoId} />
    </div>
  );
}
