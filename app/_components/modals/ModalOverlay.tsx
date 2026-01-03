'use client';

import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function ModalOverlay({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* BACKDROP REAL (captura clique) */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
        onClick={onClose}
      />

      {/* CONTEÚDO (acima do backdrop) */}
      <div
        className="absolute inset-0 z-[1]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
