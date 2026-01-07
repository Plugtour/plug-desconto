// app/_components/voucher-flow/steps/Step02Terms.tsx
'use client';

import React from 'react';

type Props = {
  /** percent do desconto (ex: 20) */
  discountPct?: number;

  /** limite de pessoas (ex: 2) */
  peopleLimit?: number;

  /** lista de itens não elegíveis (opcional) */
  excepts?: string[];

  /** callback do botão "De acordo" */
  onAgree: () => void;

  /** callback do X/fechar (se quiser tratar aqui) */
  onClose?: () => void;

  /** desabilita ações (ex: enquanto processa) */
  disabled?: boolean;
};

export default function Step02Terms({
  discountPct = 20,
  peopleLimit = 2,
  excepts = [
    'Entradas',
    'Sobremesas',
    'Bebidas',
    'Couvert',
    'Taxas de serviço',
    'Outros consumos e serviços',
  ],
  onAgree,
  onClose,
  disabled = false,
}: Props) {
  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-[13px] leading-5 text-black/70">
            Condições do desconto
          </p>

          <h2 className="mt-1 text-[14px] font-semibold leading-6 text-black">
            Está sendo concedido{' '}
            <span className="font-extrabold">{discountPct}%</span> de desconto
            sobre o valor da refeição principal.
          </h2>
        </div>

        <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-[13px] font-semibold text-black">
            Excetos:
          </p>
          <p className="mt-1 text-[12px] leading-5 text-black/70">
            {excepts.join(', ')}.
          </p>

          <p className="mt-3 text-[13px] font-semibold text-black">
            Obs.:
          </p>
          <p className="mt-1 text-[12px] leading-5 text-black/70">
            O benefício se aplica para até{' '}
            <span className="font-semibold">{peopleLimit}</span> pessoas por
            assinatura.
          </p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onAgree}
            disabled={disabled}
            className={[
              'h-10 w-full rounded-xl bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          >
            De acordo
          </button>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className={[
                'mt-2 h-10 w-full rounded-xl border border-black/10 bg-white text-[13px] font-semibold text-black/80 transition',
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
