'use client';

import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function ModalOverlay({ open, onClose, children }: Props) {
  // ESC fecha
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={[
        'fixed inset-0 z-[210]',
        'transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* fundo escuro (fecha ao tocar) */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      {/* conteúdo */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
