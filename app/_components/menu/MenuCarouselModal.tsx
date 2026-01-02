'use client';

import React, { useEffect } from 'react';
import ModalOverlay from '@/app/_components/modals/ModalOverlay';
import useLockBodyScroll from '@/app/_components/modals/useLockBodyScroll';

type Props = {
  open: boolean;
  onClose: () => void;

  categoryName?: string | null;
  categoryCount?: number | null;
  title?: string;

  // permite reutilizar o modal em outros contextos (ex: busca / destinos)
  children?: React.ReactNode;

  // para casos como Busca/Destinos, onde não queremos cabeçalho de categoria
  hideHeader?: boolean;
};

export default function MenuCarouselModal({
  open,
  onClose,
  categoryName = null,
  categoryCount = null,
  title = 'Categoria',
  children,
  hideHeader = false,
}: Props) {
  useLockBodyScroll(open);

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

  // respiro lateral
  const SIDE_GUTTER_PX = 6;

  const countText =
    typeof categoryCount === 'number' ? `${categoryCount} produtos` : '';

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        className={[
          'fixed inset-0 z-[220]',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
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
          className="fixed left-0 right-0 bottom-0 z-[230] transition-transform duration-300"
          style={{
            top: MODAL_TOP_OFFSET,
            transform: open ? 'translateY(0%)' : 'translateY(100%)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mx-auto w-full max-w-md h-full flex flex-col"
            style={{
              paddingLeft: SIDE_GUTTER_PX,
              paddingRight: SIDE_GUTTER_PX,
            }}
          >
            {/* BOTÃO FECHAR — alinhado à direita */}
            <div className="relative pt-1 flex justify-end">
              <div className="w-full flex justify-end pr-0">
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
              className={[
                'bg-zinc-100',
                'flex-1',
                'rounded-t-md',
                'overflow-hidden',
              ].join(' ')}
              onClick={(e) => e.stopPropagation()}
            >
              {!hideHeader && (
                <div className="px-4 pt-4 pb-3">
                  <div className="text-sm font-semibold text-zinc-900">
                    {categoryName ?? title ?? ''}
                  </div>
                  <div className="mt-[-1px] text-[12px] font-medium text-emerald-700">
                    {countText}
                  </div>
                </div>
              )}

              {/* ✅ Conteúdo reutilizável + rolagem segura */}
              <div
                className={[
                  'h-full',
                  'flex flex-col',
                  hideHeader ? 'px-4 pt-3 pb-5 overflow-auto' : 'overflow-auto',
                ].join(' ')}
              >
                {children ?? <div className="px-4 pb-6" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
