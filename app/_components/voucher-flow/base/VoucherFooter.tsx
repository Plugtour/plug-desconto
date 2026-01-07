// app/_components/voucher-flow/base/VoucherFooter.tsx
'use client';

import React from 'react';

type Props = {
  /** conteúdo do footer (opcional) */
  children?: React.ReactNode;

  /** texto auxiliar (opcional) */
  hintText?: string;

  /** se true, mostra uma “barra” fixa no rodapé do modal */
  sticky?: boolean;
};

export default function VoucherFooter({
  children,
  hintText,
  sticky = false,
}: Props) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    sticky ? (
      <div className="sticky bottom-0 z-10 bg-white">
        {children}
      </div>
    ) : (
      <>{children}</>
    );

  if (!children && !hintText) return null;

  return (
    <Wrapper>
      <div className="border-t border-black/5 px-4 py-3">
        {hintText ? (
          <p className="mb-2 text-[12px] leading-5 text-black/55">{hintText}</p>
        ) : null}

        {children ? <div className="flex items-center justify-center">{children}</div> : null}
      </div>
    </Wrapper>
  );
}
