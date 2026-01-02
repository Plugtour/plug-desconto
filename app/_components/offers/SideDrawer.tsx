// app/_components/offers/SideDrawer.tsx
'use client';

import { useEffect } from 'react';

/* =========================
   SCROLL LOCK SIMPLES (igual ao carrossel)
========================= */
function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SideDrawer({ open, onClose }: Props) {
  useLockScroll(open);

  if (!open) return null;

  const TOP_GAP = 50;
  const SIDE_GAP = 24;
  const BTN_OFFSET = 36;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/25 backdrop-blur-[6px]" />

      {/* botão fechar */}
      <button
        onClick={onClose}
        className="absolute z-[1001] rounded-md bg-white/80 ring-1 ring-black/10 px-3 py-1.5 text-[13px] text-red-500 hover:bg-white"
        style={{
          left: SIDE_GAP,
          top: TOP_GAP - BTN_OFFSET,
        }}
      >
        Fechar
      </button>

      {/* drawer */}
      <div
        className="absolute right-0 bg-zinc-100 shadow-2xl rounded-md animate-slide-in"
        style={{
          top: TOP_GAP,
          height: `calc(100% - ${TOP_GAP}px)`,
          width: `calc(100% - ${SIDE_GAP}px)`,
        }}
      >
        <div className="h-full w-full" />
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(28px);
            opacity: 0.98;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}
