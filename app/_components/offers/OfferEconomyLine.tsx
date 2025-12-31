// app/_components/offers/OfferEconomyLine.tsx
'use client';

type Props = {
  savingsText?: string | null;
  priceText?: string | null;
};

export default function OfferEconomyLine({ savingsText, priceText }: Props) {
  // ✅ prioridade para o texto em reais/faixa (ex: "R$70 a R$ 110")
  const value = priceText ?? savingsText;

  if (!value) return null;

  return (
    <div className="-mt-[2px] text-[12px] font-medium text-zinc-900">
      Economia de {value}
    </div>
  );
}
