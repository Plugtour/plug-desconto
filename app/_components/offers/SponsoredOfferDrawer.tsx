'use client';

import React, { useEffect } from 'react';
import type { SponsoredOffer } from '../../../_data/sponsoredOffers';

type Props = {
  open: boolean;
  offer: SponsoredOffer | null;
  onClose: () => void;
};

export default function SponsoredOfferDrawer({
  open,
  offer,
  onClose,
}: Props) {
  /* =========================
     ESC fecha
  ========================= */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  /* =========================
     Trava scroll do body
  ========================= */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const TOP_GAP_PX = 50;   // respiro superior
  const SIDE_GAP_PX = 24;  // respiro lateral (borda esquerda do modal)
  const BUTTON_ABOVE_PX = 36; // equivalente ao "-top-9" da busca rápida

  return (
    <div
      className={[
        'fixed inset-0 z-[999]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={[
          'absolute inset-0',
          'bg-black/25 backdrop-blur-[6px]',
          'transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Botão FECHAR — fora do modal, alinhado exatamente na borda esquerda */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={[
          'absolute z-[1001]',
          'touch-manipulation',
          'rounded-md',
          'bg-white/80',
          'ring-1 ring-black/10',
          'px-3 py-1.5',
          'text-[13px] font-normal text-black/75',
          'hover:bg-white',
          'transition-all duration-250 ease-out',
          open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full',
        ].join(' ')}
        style={{
          // EXATAMENTE a mesma linha da borda esquerda do modal
          left: SIDE_GAP_PX,

          // Fora do modal, acima do topo
          top: TOP_GAP_PX - BUTTON_ABOVE_PX,
        }}
      >
        Fechar
      </button>

      {/* Modal lateral */}
      <div
        className={[
          'absolute right-0',
          'bg-zinc-100 shadow-2xl',
          'rounded-md',
          'transition-transform duration-250 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          top: TOP_GAP_PX,
          height: `calc(100% - ${TOP_GAP_PX}px)`,
          width: `calc(100% - ${SIDE_GAP_PX}px)`,
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Conteúdo temporário */}
        <div className="px-4 pt-4">
          <div className="rounded-md border border-dashed border-zinc-300 p-4 text-[12px] text-zinc-500">
            Modal lateral criado (sem conteúdo ainda).
            {offer?.title ? (
              <div className="mt-2 font-semibold text-zinc-700 line-clamp-2">
                {offer.title}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
