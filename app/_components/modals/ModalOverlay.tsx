// app/_components/modals/ModalOverlay.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

const EXIT_MS = 320;

export default function ModalOverlay({ open, onClose, children }: Props) {
  const [mounted, setMounted] = useState(open);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = null;
      setMounted(true);
      return;
    }

    if (!mounted) return;

    tRef.current = window.setTimeout(() => {
      setMounted(false);
      tRef.current = null;
    }, EXIT_MS);

    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = null;
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className={[
          'absolute inset-0',
          'bg-black/35 backdrop-blur-[4px]',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

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
