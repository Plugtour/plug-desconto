// app/_components/voucher-flow/steps/Step03Voucher.tsx
'use client';

import React, { useRef } from 'react';

type Props = {
  /** código do voucher */
  voucherCode: string;

  /** percentual de desconto */
  discountPct?: number;

  /** data/hora de geração do voucher */
  generatedAt?: Date;

  /** callback do botão "Próximo" */
  onNext: () => void;

  /** callback opcional ao fechar (X) */
  onClose?: () => void;

  /** desabilita ações (ex: enquanto processa) */
  disabled?: boolean;
};

function formatDateTime(d?: Date) {
  if (!d) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Step03Voucher({
  voucherCode,
  discountPct = 20,
  generatedAt,
  onNext,
  onClose,
  disabled = false,
}: Props) {
  // fixa a data/hora na primeira renderização
  const generatedRef = useRef<Date>(generatedAt ?? new Date());

  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-md border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-[13px] leading-5 text-black/70">Voucher</p>

          <div className="mt-1 text-[18px] font-extrabold tracking-wider text-emerald-700">
            {voucherCode}
          </div>

          <p className="mt-2 text-[13px] leading-5 text-black/80">
            Você obteve{' '}
            <span className="font-semibold">{discountPct}%</span> de desconto
            <br />
            sobre o prato principal
          </p>
        </div>

        <div className="mt-4 rounded-md border border-amber-300 bg-amber-100 px-4 py-3 text-center">
          <p className="text-[12px] font-semibold text-amber-900">
            Utilizado em
          </p>
          <p className="text-[12px] text-amber-900/80">
            {formatDateTime(generatedRef.current)}
          </p>
        </div>

        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[12px] font-semibold text-red-700">Atenção:</p>
          <p className="mt-1 text-[12px] leading-5 text-red-700/90">
            Chame o garçom, apresente esta tela do aplicativo e peça a sua conta.
          </p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className={[
              'h-10 w-full rounded-md bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          >
            Próximo
          </button>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className={[
                'mt-2 h-10 w-full rounded-md border border-black/10 bg-white text-[13px] font-semibold text-black/80 transition',
                'active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                'disabled:opacity-60 disabled:pointer-events-none',
              ].join(' ')}
            >
              Fechar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
