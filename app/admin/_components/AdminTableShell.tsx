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
    <section
      className={[
        'overflow-hidden rounded-xl border',
        'border-zinc-200 bg-white text-zinc-900',
        'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100',
      ].join(' ')}
    >
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
        <div
          className={[
            'border-t px-4 py-3 text-xs',
            'border-zinc-200 text-zinc-500',
            'dark:border-zinc-900 dark:text-zinc-500',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">{footer}</div>
        </div>
      )}
    </section>
  );
}
