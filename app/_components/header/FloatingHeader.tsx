'use client';

import React from 'react';

type Props = {
  favoritesCount?: number;
  notificationsCount?: number;
  onOpenDestinos: () => void;
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
  onOpenNotifications: () => void;
};

/* =========================
   ÍCONES SVG (INLINE)
========================= */

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s6-5.33 6-10a6 6 0 10-12 0c0 4.67 6 10 6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

/* =========================
   COMPONENTE
========================= */

export default function FloatingHeader({
  favoritesCount = 0,
  notificationsCount = 0,
  onOpenDestinos,
  onOpenSearch,
  onOpenFavorites,
  onOpenNotifications,
}: Props) {
  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[150]
        h-14 bg-white
        flex items-center justify-between
        px-4
      "
    >
      {/* ESQUERDA — DESTINOS */}
      <button
        onClick={onOpenDestinos}
        className="flex items-center gap-1 text-sm font-semibold"
      >
        <IconMapPin />
        Destinos
      </button>

      {/* DIREITA — AÇÕES */}
      <div className="flex items-center gap-4">
        {/* FAVORITOS */}
        <button
          onClick={onOpenFavorites}
          className="relative"
          aria-label="Favoritos"
        >
          <IconHeart />
          {favoritesCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1
                min-w-[16px] h-4
                rounded-full bg-red-600
                text-[10px] font-semibold text-white
                flex items-center justify-center
                px-1
              "
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {/* BUSCA */}
        <button
          onClick={onOpenSearch}
          aria-label="Buscar"
        >
          <IconSearch />
        </button>

        {/* AVISOS */}
        <button
          onClick={onOpenNotifications}
          className="relative"
          aria-label="Avisos"
        >
          <IconBell />
          {notificationsCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1
                min-w-[16px] h-4
                rounded-full bg-emerald-600
                text-[10px] font-semibold text-white
                flex items-center justify-center
                px-1
              "
            >
              {notificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
