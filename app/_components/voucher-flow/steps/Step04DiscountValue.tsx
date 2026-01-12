// app/_components/voucher-flow/steps/Step04DiscountValue.tsx
'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  /** valor inicial (opcional) */
  initialValue?: number;

  /** callback ao avançar */
  onNext: (value: number) => void;

  /** callback opcional ao fechar (X) */
  onClose?: () => void;

  /** desabilita ações */
  disabled?: boolean;
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function parseBRL(input: string) {
  const cleaned = input.replace(/\D/g, '');
  return Number(cleaned) / 100;
}

export default function Step04DiscountValue({
  initialValue = 0,
  onNext,
  onClose,
  disabled = false,
}: Props) {
  const [raw, setRaw] = useState<string>(formatBRL(initialValue));

  // mantém input sincronizado se o valor inicial mudar
  useEffect(() => {
    setRaw(formatBRL(initialValue));
  }, [initialValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseBRL(e.target.value);
    setRaw(formatBRL(value));
  }

  function handleNext() {
    const value = parseBRL(raw);
    if (value <= 0) return;
    onNext(value);
  }

  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-md border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-[13px] leading-5 text-black/70">
            Informe o desconto
          </p>

          <h2 className="mt-1 text-[14px] font-semibold leading-6 text-black">
            Qual foi o valor do desconto concedido?
          </h2>
        </div>

        <div className="mt-5">
          <input
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={handleChange}
            disabled={disabled}
            className={[
              'h-11 w-full rounded-md border border-black/15 bg-white px-3 text-center text-[15px] font-semibold text-emerald-700 outline-none',
              'focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/30',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          />
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleNext}
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
