'use client';

import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightVh?: number;
  showHandle?: boolean;
};

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeightVh = 85,
  showHandle = true,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      {/* backdrop */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* sheet */}
      <div
        className="
          absolute inset-x-0 bottom-0
          rounded-t-2xl bg-white
          shadow-[0_-8px_30px_rgba(0,0,0,0.18)]
          animate-[pd_sheetUp_180ms_ease-out]
        "
        style={{ maxHeight: `${maxHeightVh}vh` }}
        role="dialog"
        aria-modal="true"
      >
        {showHandle && (
          <div className="pt-2">
            <div className="mx-auto h-1 w-10 rounded-full bg-black/15" />
          </div>
        )}

        {title && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-black/80">
                {title}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-black/60 hover:bg-black/5"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pb-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
