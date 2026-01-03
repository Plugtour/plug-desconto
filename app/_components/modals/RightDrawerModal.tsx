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
  const GAP_BETWEEN_BUTTON_AND_MODAL = 6;
  const SIDE_GUTTER_PX = 6;

  return (
    <ModalOverlay open={open} onClose={onClose}>
      {/* blur visual */}
      <div
        className={[
          'absolute inset-0',
          'backdrop-blur-[4px]',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-[10000] transition-transform duration-300"
        style={{
          top: MODAL_TOP_OFFSET,
          transform: open ? 'translateX(0%)' : 'translateX(100%)',
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()} // ✅ impede fechar clicando dentro
      >
        <div
          className="h-full w-full max-w-md flex flex-col"
          style={{
            paddingLeft: SIDE_GUTTER_PX,
            paddingRight: SIDE_GUTTER_PX,
          }}
        >
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

          <div className={['bg-zinc-100', 'flex-1', 'rounded-md', 'overflow-hidden'].join(' ')}>
            {!hideHeader && (
              <div className="px-4 pt-4 pb-3">
                <div className="text-sm font-semibold text-zinc-900">{title}</div>
                {subtitle ? (
                  <div className="mt-[-1px] text-[12px] font-medium text-emerald-700">{subtitle}</div>
                ) : null}
              </div>
            )}

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
    </ModalOverlay>
  );
}
