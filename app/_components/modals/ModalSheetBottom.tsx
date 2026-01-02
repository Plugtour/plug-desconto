'use client';

import React, { useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import useLockBodyScroll from './useLockBodyScroll';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  heightClassName?: string; // ex: 'h-[78vh]' ou 'max-h-[85vh]'
  className?: string;
};

export default function ModalSheetBottom({
  open,
  onClose,
  title,
  children,
  heightClassName = 'max-h-[85vh]',
  className,
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

  return (
    <>
      <ModalOverlay open={open} onClose={onClose} />

      <div
        aria-hidden={!open}
        className={[
          'fixed inset-x-0 bottom-0 z-[200]',
          'bg-white',
          'shadow-2xl',
          'transition-transform duration-300',
          'will-change-transform',
          open ? 'translate-y-0' : 'translate-y-full',
          'rounded-t-2xl',
          heightClassName,
          'flex flex-col',
          'pb-[env(safe-area-inset-bottom)]',
          className ?? '',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-black/10 bg-white/95 backdrop-blur-[2px]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              {title ? (
                <div className="text-sm font-semibold text-zinc-900 truncate">
                  {title}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-3 rounded-xl px-3 py-2 text-sm font-medium bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300"
            >
              Fechar
            </button>
          </div>

          {/* “alça” visual (opcional) */}
          <div className="flex justify-center pb-2">
            <div className="h-1 w-10 rounded-full bg-zinc-300" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
