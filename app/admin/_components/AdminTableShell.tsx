// app/admin/_components/AdminTableShell.tsx
import { ReactNode } from 'react';

export default function AdminTableShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
      <div
        className={[
          'min-h-[120px] overflow-x-auto [scrollbar-gutter:stable]',
          // esconder barra (Chrome/Edge/Safari)
          '[&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0',
          '[&::-webkit-scrollbar-thumb]:bg-transparent',
          // esconder barra (Firefox)
          '[scrollbar-width:none]',
          // IE/Edge antigo
          '[-ms-overflow-style:none]',
        ].join(' ')}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-zinc-900 px-4 py-3 text-xs text-zinc-500">
          <div className="flex items-center justify-between gap-3">{footer}</div>
        </div>
      )}
    </section>
  );
}
