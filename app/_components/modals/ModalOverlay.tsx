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
        'fixed inset-0 z-[9999]', // ✅ acima de qualquer header/menu
        'transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* ✅ backdrop (fecha ao clicar) */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
      />

      {/* ✅ camada do conteúdo NÃO pode bloquear clique no backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
