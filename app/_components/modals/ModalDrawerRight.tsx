'use client';

import React, { useEffect } from 'react';
import ModalOverlay from './ModalOverlay';
import useLockBodyScroll from './useLockBodyScroll';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClassName?: string; // ex: 'w-[92vw] max-w-[420px]'
  className?: string;
};

export default function ModalDrawerRight({
  open,
  onClose,
  title,
  children,
  widthClassName = 'w-[92vw] max-w-[420px]',
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
          'fixed inset-y-0 right-0 z-[200]',
          widthClassName,
          'bg-white',
          'shadow-2xl',
          'transition-transform duration-300',
          'will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full',
          'rounded-l-2xl',
          'flex flex-col',
          'pb-[env(safe-area-inset-bottom)]',
          className ?? '',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
      >
<div className="sticky top-0 z-10 bg-white/95 backdrop-blur-[2px] border-b border-black/10">
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
</div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
