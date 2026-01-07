// app/_components/voucher-flow/VoucherFlowController.tsx
'use client';

import React, { useEffect, useState } from 'react';

// Base
import VoucherModalShell from './base/VoucherModalShell';
import VoucherProgressDots from './base/VoucherProgressDots';

// Steps
import Step01AskBill from './steps/Step01AskBill';
import Step02Terms from './steps/Step02Terms';
import Step03Voucher from './steps/Step03Voucher';
import Step04DiscountValue from './steps/Step04DiscountValue';
import Step05PaidValue from './steps/Step05PaidValue';
import Step06Rating from './steps/Step06Rating';
import Step07ThankYou from './steps/Step07ThankYou';

type Props = {
  open: boolean;
  onClose: () => void;

  restaurantName: string;
  userName?: string | null;

  discountPct?: number;
};

const TOTAL_STEPS = 7;

function generateVoucherCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function VoucherFlowController({
  open,
  onClose,
  restaurantName,
  userName = null,
  discountPct = 20,
}: Props) {
  const [step, setStep] = useState<number>(1);

  // dados coletados ao longo do fluxo
  const [voucherCode, setVoucherCode] = useState<string>(generateVoucherCode());
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paidValue, setPaidValue] = useState<number>(0);

  // ✅ reset completo sempre que o modal abrir
  useEffect(() => {
    if (!open) return;

    setStep(1);
    setDiscountValue(0);
    setPaidValue(0);
    setVoucherCode(generateVoucherCode());
  }, [open]);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function resetAndClose() {
    // ✅ reset total (pra sempre reabrir limpo)
    setStep(1);
    setDiscountValue(0);
    setPaidValue(0);
    setVoucherCode(generateVoucherCode());

    onClose();
  }

  function renderStep() {
    switch (step) {
      case 1:
        return <Step01AskBill userName={userName} onYes={next} onNo={resetAndClose} />;

      case 2:
        return (
          <Step02Terms
            discountPct={discountPct}
            onAgree={next}
            onClose={resetAndClose}
          />
        );

      case 3:
        return (
          <Step03Voucher
            voucherCode={voucherCode}
            discountPct={discountPct}
            onNext={next}
          />
        );

      case 4:
        return (
          <Step04DiscountValue
            initialValue={discountValue}
            onNext={(v) => {
              setDiscountValue(v);
              next();
            }}
          />
        );

      case 5:
        return (
          <Step05PaidValue
            initialValue={paidValue}
            onNext={(v) => {
              setPaidValue(v);
              next();
            }}
          />
        );

      case 6:
        return (
          <Step06Rating
            onSubmit={(data) => {
              // ✅ pronto pro backend (quando você ligar API):
              // data.rating, data.highlights, data.comment
              // discountValue, paidValue, voucherCode, restaurantName, discountPct

              void data;
              next();
            }}
          />
        );

      case 7:
        return <Step07ThankYou onClose={resetAndClose} />;

      default:
        return null;
    }
  }

  return (
    <VoucherModalShell
      open={open}
      onClose={resetAndClose}
      title={restaurantName}
      showClose
      lockOverlay
      maxWidthClass="max-w-[420px]"
    >
      <VoucherProgressDots current={step} total={TOTAL_STEPS} />

      {renderStep()}
    </VoucherModalShell>
  );
}
