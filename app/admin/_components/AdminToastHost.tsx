'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { useAdminToast } from './AdminToastProvider';

export default function AdminToastHost() {
  const { toasts, removeToast } = useAdminToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[9999] flex justify-center px-3">
      <div className="w-full max-w-md space-y-2">
        {toasts.map((t) => {
          const theme =
            t.type === 'success'
              ? {
                  wrap: 'border-emerald-900/60 bg-emerald-950/90 text-emerald-100',
                  icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
                }
              : t.type === 'warning'
              ? {
                  wrap: 'border-amber-900/60 bg-amber-950/90 text-amber-100',
                  icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
                }
              : {
                  wrap: 'border-red-900/60 bg-red-950/90 text-red-100',
                  icon: <XCircle className="h-4 w-4 text-red-300" />,
                };

          return (
            <div
              key={t.id}
              className={[
                'pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 shadow-sm',
                'backdrop-blur-md',
                theme.wrap,
              ].join(' ')}
            >
              <div className="mt-0.5">{theme.icon}</div>

              <div className="flex-1">
                <div className="text-sm leading-snug">{t.message}</div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"
                aria-label="Fechar"
                title="Fechar"
              >
                <X className="h-4 w-4 opacity-80" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
