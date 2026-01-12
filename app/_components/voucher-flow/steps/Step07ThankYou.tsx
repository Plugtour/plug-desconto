// app/_components/voucher-flow/steps/Step07ThankYou.tsx
'use client';

import React from 'react';

type Props = {
  /** mensagem principal (opcional, para customizar depois) */
  title?: string;

  /** texto complementar */
  subtitle?: string;

  /** callback ao fechar o fluxo */
  onClose: () => void;

  /** desabilita ações */
  disabled?: boolean;
};

export default function Step07ThankYou({
  title = 'Muito obrigado por utilizar o Clube Plug Descontos.',
  subtitle = 'Você já está economizando e poderá economizar muito mais. Continue usando.',
  onClose,
  disabled = false,
}: Props) {
  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-md border border-black/10 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl text-emerald-700 transition-transform duration-200 ease-out active:scale-[0.98]">
              ✓
            </span>
          </div>

          <h2 className="text-[15px] font-semibold leading-6 text-black">
            {title}
          </h2>

          <p className="mt-2 text-[13px] leading-5 text-black/70">
            {subtitle}
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className={[
              'h-10 w-full rounded-md bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
