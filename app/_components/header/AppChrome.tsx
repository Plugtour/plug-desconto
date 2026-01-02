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

  const [, setSearchOpen] = useState(false);
  const [, setFavoritesOpen] = useState(false);
  const [, setNotificationsOpen] = useState(false);

  const [destinoId, setDestinoId] = useState<string>('serra-gaucha');

  return (
    <div
      style={{
        ['--app-header-h' as any]: 'calc(56px + env(safe-area-inset-top))',
      }}
    >
      <FloatingHeader
        favoritesCount={favoritesCount}
        notificationsCount={notificationsCount}
        onOpenDestinos={() => setDestinosOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      <DestinosSheet
        open={destinosOpen}
        onClose={() => setDestinosOpen(false)}
        onSelect={(id) => setDestinoId(id)}
      />

      <div className="pt-14" style={{ paddingTop: 'var(--app-header-h, 56px)' }}>
        {children}
      </div>

      <div className="hidden" data-destino={destinoId} />
    </div>
  );
}
