'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;

  categoryName?: string | null;
  categoryCount?: number | null;
  title?: string;

  children?: React.ReactNode;
  hideHeader?: boolean;

  /** quanto sobe em relação ao Modal 1 */
  liftPx?: number;
};

export default function MenuCarouselModalRightStacked({
  open,
  onClose,
  categoryName = null,
  categoryCount = null,
  title = 'Categoria',
  children,
  hideHeader = false,
  liftPx = 20, // ✅ SOBE AQUI
}: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    setEntered(false);
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const BASE_TOP_OFFSET = 'calc(env(safe-area-inset-top) + 20px + 6px)';
  const GAP = 6;
  const SIDE_GUTTER = 10;

  const countText = typeof categoryCount === 'number' ? `${categoryCount} produtos` : '';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300]"
      aria-hidden={!open}
      onClick={onClose}
    >
      {/* NÃO TEM BLUR AQUI */}
      <div
        className="fixed left-0 right-0 bottom-0"
        style={{
          top: `calc(${BASE_TOP_OFFSET} - ${liftPx}px)`,
          transform: entered ? 'translateY(0%)' : 'translateY(110%)',
          transition: 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="mx-auto w-full max-w-md h-full flex flex-col min-h-0"
          style={{ paddingLeft: SIDE_GUTTER, paddingRight: SIDE_GUTTER }}
        >
          {/* FECHAR */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-4 rounded-md bg-zinc-100 border border-zinc-200 text-red-600 text-[13px] font-medium"
            >
              Fechar
            </button>
          </div>

          <div style={{ height: GAP }} />

          {/* CONTEÚDO */}
          <div className="bg-zinc-100 flex-1 rounded-t-md overflow-hidden min-h-0">
            {!hideHeader && (
              <div className="px-3 pt-3 pb-2">
                <div className="text-sm font-semibold text-zinc-900">
                  {categoryName ?? title}
                </div>
                <div className="text-[12px] font-medium text-emerald-700">
                  {countText}
                </div>
              </div>
            )}

            <div
              className={[
                'flex-1 min-h-0 flex flex-col',
                hideHeader ? 'px-2 pt-2 pb-3 overflow-hidden' : 'overflow-auto',
              ].join(' ')}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
