// app/_components/voucher-flow/base/VoucherModalShell.tsx
'use client';

import React, { useEffect, useId } from 'react';

type Props = {
  /** controla abertura do modal */
  open: boolean;

  /** fecha o modal (X, overlay, botão final) */
  onClose: () => void;

  /** conteúdo central (Steps) */
  children: React.ReactNode;

  /** título no header (ex: nome do restaurante) */
  title?: string;

  /** exibe botão X */
  showClose?: boolean;

  /** largura máxima do modal */
  maxWidthClass?: string; // ex: 'max-w-[420px]'

  /** bloqueia fechamento ao clicar fora */
  lockOverlay?: boolean;
};

export default function VoucherModalShell({
  open,
  onClose,
  children,
  title,
  showClose = true,
  maxWidthClass = 'max-w-[420px]',
  lockOverlay = true,
}: Props) {
  const titleId = useId();

  // trava scroll do body + ESC
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lockOverlay) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, lockOverlay]);

  if (!open) return null;

  function handleOverlayClick() {
    if (lockOverlay) return;
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={`relative w-full ${maxWidthClass} mx-3`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <div
                id={titleId}
                className="truncate text-[14px] font-semibold text-black"
              >
                {title}
              </div>

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-black/60 transition',
                    'hover:bg-black/5 active:scale-95',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                  ].join(' ')}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Content (Steps) */}
          <div className="max-h-[85vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
