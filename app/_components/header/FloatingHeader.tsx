'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

type Props = {
  favoritesCount?: number;
  notificationsCount?: number;

  onOpenDestinos: () => void;
  onOpenClub: () => void;
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
  onOpenNotifications: () => void;

  userName?: string | null;
};

/* =========================
   TOKEN ÚNICO (TOPO "GLASS")
========================= */
const TOP_GLASS =
  'bg-zinc-200/95 backdrop-blur-[2px] ' +
  'transition-[background-color,backdrop-filter] duration-200 ease-out ' +
  'will-change-[background-color,backdrop-filter]';

/* =========================
   ÍCONES SVG (INLINE)
========================= */

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-4 w-4'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
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

/* =========================
   COMPONENTE
========================= */

export default function FloatingHeader({
  favoritesCount = 0,
  notificationsCount = 0,
  onOpenDestinos,
  onOpenClub,
  onOpenSearch,
  onOpenFavorites,
  onOpenNotifications,
  userName = null,
}: Props) {
  const isLogged = !!(userName && userName.trim().length > 0);

  return (
    <header
      className={['fixed top-0 left-0 right-0 z-[150]', TOP_GLASS, 'flex items-center', 'px-4'].join(' ')}
      style={{
        height: 'var(--app-header-h, calc(56px + env(safe-area-inset-top)))',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* ESQUERDA — MEU CLUBE */}
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={onOpenClub}
          className={[
            'min-h-[44px]',
            'touch-manipulation select-none',
            'active:scale-[0.99]',
            'text-left',
            'leading-[1.05]',
            'min-w-0',
            'py-2',
          ].join(' ')}
          aria-label="Abrir meu clube"
        >
          {isLogged ? (
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-black">{userName}</div>
              <div className="truncate text-[11px] font-medium text-emerald-700">Ver meu clube</div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-black">Entrar</div>
              <div className="truncate text-[11px] font-medium text-emerald-700">Ver meu clube</div>
            </div>
          )}
        </button>
      </div>

      {/* MEIO — DESTINOS */}
      <div className="flex-1 flex items-center justify-end px-0">
        <button
          type="button"
          onClick={onOpenDestinos}
          className={[
            'min-h-[44px]',
            'touch-manipulation select-none',
            'active:scale-[0.99]',
            'inline-flex items-center gap-[2px]',
            'px-[15px]',
            'text-black',
          ].join(' ')}
          aria-label="Selecionar destinos"
        >
          <IconMapPin className="h-7 w-7 opacity-60" />
          <span className="text-[13px] font-medium">Destinos</span>
        </button>
      </div>

      {/* DIREITA — AÇÕES */}
      <div className="flex items-center gap-0">
        {/* FAVORITOS */}

        <button
          onClick={onOpenFavorites}
          className="
            relative
            min-h-[44px] min-w-[44px]
            inline-flex items-center justify-center
            touch-manipulation select-none
            active:scale-[0.99]
          "
          aria-label="Favoritos"
        >
          {/* BOLINHA (atrás e “invadindo” o coração) */}
          {favoritesCount > 0 && (
            <span
              className="
                absolute
                top-[8px] right-[8px]
                min-w-[16px] h-4
                rounded-full
                bg-red-600
                text-[9px] font-medium text-white
                flex items-center justify-center
                px-1
                ring-1 ring-white/50
                z-[11]
              "
              style={{
                transform: 'translate(25%, -35%)', // ✅ deixa parcialmente por trás do coração
              }}
            >
              {favoritesCount}
            </span>
          )}

          {/* CORAÇÃO (na frente) */}
          <span className="relative z-[2]">
            <IconHeart />
          </span>
        </button>

        {/* BUSCA (LUCIDE) */}
        <button
          onClick={onOpenSearch}
          className={[
            'min-h-[44px] min-w-[44px]',
            'inline-flex items-center justify-center',
            'touch-manipulation select-none',
            'active:scale-[0.99]',
          ].join(' ')}
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* AVISOS (LUCIDE) */}
        <button
          onClick={onOpenNotifications}
          className={[
            'relative',
            'min-h-[44px] min-w-[44px]',
            'inline-flex items-center justify-center',
            'touch-manipulation select-none',
            'active:scale-[0.99]',
          ].join(' ')}
          aria-label="Avisos"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />

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
