// app/_components/voucher-flow/base/VoucherHeader.tsx
'use client';

import React from 'react';

type Props = {
  /** título principal (ex: nome do restaurante) */
  title?: string;

  /** subtítulo opcional */
  subtitle?: string;

  /** exibe botão de fechar */
  showClose?: boolean;

  /** ação do botão fechar */
  onClose?: () => void;
};

export default function VoucherHeader({
  title,
  subtitle,
  showClose = true,
  onClose,
}: Props) {
  if (!title && !subtitle && !showClose) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/5 px-4 py-3">
      <div className="min-w-0">
        {title && (
          <div className="truncate text-[14px] font-semibold text-black">
            {title}
          </div>
        )}

        {subtitle && (
          <div className="mt-0.5 truncate text-[12px] text-black/60">
            {subtitle}
          </div>
        )}
      </div>

      {showClose && (
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
          }}
          aria-label="Fechar"
          disabled={!onClose}
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/60 transition',
            'hover:bg-black/5 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            'disabled:opacity-40 disabled:pointer-events-none',
          ].join(' ')}
        >
          ✕
        </button>
      )}
    </div>
  );
}
