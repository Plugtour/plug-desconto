// app/_components/modals/MenuCarouselModalRight.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ModalOverlay from '@/app/_components/modals/ModalOverlay';
import useLockBodyScroll from '@/app/_components/modals/useLockBodyScroll';

type Props = {
  open: boolean;
  onClose: () => void;

  categoryName?: string | null;
  categoryCount?: number | null;
  title?: string;

  children?: React.ReactNode;
  hideHeader?: boolean;
};

export default function MenuCarouselModalRight({
  open,
  onClose,
  categoryName = null,
  categoryCount = null,
  title = 'Categoria',
  children,
  hideHeader = false,
}: Props) {
  useLockBodyScroll(open);

  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    setEntered(false);

    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(r2);
    });

    return () => cancelAnimationFrame(r1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const MODAL_TOP_OFFSET = 'calc(env(safe-area-inset-top) + 20px + 6px)';
  const GAP_BETWEEN_BUTTON_AND_MODAL = 6;

  // ✅ modal NÃO encosta no celular
  const SIDE_GUTTER_PX = 4;

  const countText = typeof categoryCount === 'number' ? `${categoryCount} produtos` : '';

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        className={['fixed inset-0 z-[220]', open ? 'pointer-events-auto' : 'pointer-events-none'].join(' ')}
        onClick={onClose}
        aria-hidden={!open}
      >
        <div
          className={[
            'absolute inset-0',
            'backdrop-blur-[4px]',
            'transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />

        <div
          className="fixed left-0 right-0 bottom-0 z-[230]"
          style={{
            top: MODAL_TOP_OFFSET,
            transform: entered ? 'translateY(0%)' : 'translateY(110%)',
            transitionProperty: 'transform',
            transitionDuration: entered ? '560ms' : '520ms',
            transitionTimingFunction: entered ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mx-auto w-full max-w-md h-full flex flex-col min-h-0"
            style={{ paddingLeft: SIDE_GUTTER_PX, paddingRight: SIDE_GUTTER_PX }}
          >
            {/* BOTÃO FECHAR */}
            <div className="relative pt-1 flex justify-start">
              <div className="w-full flex justify-start pl-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  aria-label="Fechar"
                  className={[
                    'min-h-[38px]',
                    'px-4',
                    'flex items-center justify-center',
                    'rounded-md',
                    'bg-zinc-100',
                    'border border-zinc-200',
                    'text-red-600',
                    'text-[13px] font-medium',
                    'touch-manipulation select-none',
                    'active:scale-[0.98]',
                    'transition-colors',
                    'hover:bg-zinc-100/90',
                  ].join(' ')}
                >
                  Fechar
                </button>
              </div>
            </div>

            <div aria-hidden="true" style={{ height: GAP_BETWEEN_BUTTON_AND_MODAL }} />

            {/* SHEET */}
            <div
              className={['bg-zinc-100', 'flex-1', 'rounded-t-md', 'overflow-hidden', 'min-h-0'].join(' ')}
              onClick={(e) => e.stopPropagation()}
            >
              {!hideHeader && (
                <div className="px-3 pt-3 pb-2">
                  <div className="text-sm font-semibold text-zinc-900">{categoryName ?? title ?? ''}</div>
                  <div className="mt-[-1px] text-[12px] font-medium text-emerald-700">{countText}</div>
                </div>
              )}

              {/* ✅ FIX: quando hideHeader=true, NÃO pode existir scroll aqui
                  (senão cria “micro-rolagem” no topo/título). */}
              <div
                className={[
                  'flex-1',
                  'min-h-0',
                  'flex flex-col',
                  hideHeader ? 'px-2 pt-2 pb-3 overflow-hidden' : 'overflow-auto',
                ].join(' ')}
              >
                {children ?? <div className="px-3 pb-6" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
