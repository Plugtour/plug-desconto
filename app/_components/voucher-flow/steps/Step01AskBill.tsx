// app/_components/voucher-flow/steps/Step01AskBill.tsx
'use client';

import React from 'react';

type Props = {
  /** Nome do usuário (opcional). Se não vier, usa texto genérico */
  userName?: string | null;

  /** callback quando clicar em "Sim" */
  onYes: () => void;

  /** callback quando clicar em "Não" (normalmente fecha o fluxo) */
  onNo: () => void;

  /** desabilita ações (ex: enquanto processa) */
  disabled?: boolean;
};

export default function Step01AskBill({
  userName = null,
  onYes,
  onNo,
  disabled = false,
}: Props) {
  const name = userName?.trim()?.length ? userName.trim() : null;

  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-center">
          {name ? (
            <p className="text-[13px] leading-5 text-black/70">Olá, {name}!</p>
          ) : (
            <p className="text-[13px] leading-5 text-black/50">Confirmação</p>
          )}

          <h2 className="mt-1 text-[15px] font-semibold leading-6 text-black">
            Você deseja pedir a conta agora?
          </h2>

          <p className="mt-2 text-[12px] leading-5 text-black/55">
            Ao continuar, você seguirá para as próximas etapas para usar o desconto.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onYes}
            disabled={disabled}
            className={[
              'h-10 rounded-xl bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          >
            Sim
          </button>

          <button
            type="button"
            onClick={onNo}
            disabled={disabled}
            className={[
              'h-10 rounded-xl bg-red-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/35',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
