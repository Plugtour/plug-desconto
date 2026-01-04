/* ============================
   RightDrawerModal.tsx
   ✅ respiro lateral +10px em cada lado
============================ */
'use client';

import React from 'react';
import ModalOverlay from '@/app/_components/modals/ModalOverlay';
import useLockBodyScroll from '@/app/_components/modals/useLockBodyScroll';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string | null;
  children?: React.ReactNode;
  hideHeader?: boolean;
};

export default function RightDrawerModal({
  open,
  onClose,
  title = 'Detalhes',
  subtitle = null,
  children,
  hideHeader = false,
}: Props) {
  useLockBodyScroll(open);

  const MODAL_TOP_OFFSET = 'calc(env(safe-area-inset-top) + 20px + 6px)';
  const GAP = 6;

  // ✅ antes: 6  → agora: 12  ( +6px por lado )
  const SIDE_GUTTER = 12;

  const DRAWER_W = 'min(448px, 100vw)';

  return (
    <ModalOverlay open={open} onClose={onClose}>
      {/* ÁREA CLICÁVEL FORA DO DRAWER (fecha) */}
      <div className="absolute inset-0 z-[1]" onClick={onClose} />

      {/* DRAWER */}
      <div
        className="fixed right-0 z-[2] transition-transform duration-300"
        style={{
          top: MODAL_TOP_OFFSET,
          bottom: 0,
          width: DRAWER_W,
          transform: open ? 'translateX(0%)' : 'translateX(100%)',
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="h-full w-full flex flex-col"
          style={{
            paddingLeft: SIDE_GUTTER,
            paddingRight: SIDE_GUTTER,
          }}
        >
          {/* BOTÃO FECHAR */}
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-4 rounded-md bg-zinc-100 border border-zinc-200 text-red-600 text-[13px] font-medium active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>

          <div style={{ height: GAP }} />

          {/* PAINEL */}
          <div className="bg-zinc-100 flex-1 rounded-md overflow-hidden">
            {!hideHeader && (
              <div className="px-4 pt-4 pb-3">
                <div className="text-sm font-semibold text-zinc-900">{title}</div>
                {subtitle && <div className="text-[12px] font-medium text-emerald-700">{subtitle}</div>}
              </div>
            )}

            <div className={hideHeader ? 'px-4 pt-3 pb-5 overflow-auto h-full' : 'overflow-auto h-full'}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
