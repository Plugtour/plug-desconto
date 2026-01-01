'use client';

import React, { useState } from 'react';
import FloatingHeader from './FloatingHeader';
import DestinosSheet from '../sheets/DestinosSheet';

type Props = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: Props) {
  // Contadores (por enquanto mock; depois ligamos nos estados reais)
  const [favoritesCount] = useState<number>(0);
  const [notificationsCount] = useState<number>(0);

  // Sheets / modais
  const [destinosOpen, setDestinosOpen] = useState(false);

  // Estados de “aberturas” (placeholder – depois viram sheets reais)
  const [, setSearchOpen] = useState(false);
  const [, setFavoritesOpen] = useState(false);
  const [, setNotificationsOpen] = useState(false);

  // Seleção de destino (placeholder – depois liga no tenant/host)
  const [destinoId, setDestinoId] = useState<string>('serra-gaucha');

  return (
    <>
      <FloatingHeader
        favoritesCount={favoritesCount}
        notificationsCount={notificationsCount}
        onOpenDestinos={() => setDestinosOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Sheet Destinos: abre de baixo pra cima */}
      <DestinosSheet
        open={destinosOpen}
        onClose={() => setDestinosOpen(false)}
        onSelect={(id) => setDestinoId(id)}
      />

      {/* padding-top para não ficar por baixo do header */}
      <div className="pt-14">{children}</div>

      {/* marker invisível (não impacta UI) — útil pra debug */}
      <div className="hidden" data-destino={destinoId} />
    </>
  );
}
