// app/_components/modals/ModalRight.tsx
'use client';

import React, { useEffect, useId, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;

  widthClassName?: string;
  panelClassName?: string;
};

export default function ModalRight({
  open,
  onClose,
  children,
  className,
  widthClassName = 'w-[92vw] max-w-[420px]',
  panelClassName,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <div
      className={['fixed inset-0 z-[160]', open ? 'pointer-events-auto' : 'pointer-events-none', className ?? ''].join(' ')}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={[
          'absolute inset-0',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
          'bg-black/45',
        ].join(' ')}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'absolute right-0 top-0 h-full',
          widthClassName,
          'outline-none',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div
          className={[
            'h-full',
            'bg-zinc-100/95 backdrop-blur-md',
            'border-l border-black/10',
            'shadow-2xl',
            'flex flex-col',
            panelClassName ?? '',
          ].join(' ')}
        >
          <h2 id={titleId} className="sr-only">
            Painel lateral
          </h2>

          {children}
        </div>
      </div>
    </div>
  );
}
