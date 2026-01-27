// app/admin/_components/AdminTag.tsx
import type { ReactNode } from 'react';

export default function AdminTag({ children }: { children: ReactNode }) {
  return (
    <span
      className={[
        'inline-flex max-w-full items-center',
        'rounded-md border px-2 py-1 text-xs',
        'whitespace-nowrap',
        'border-zinc-200 bg-zinc-100 text-zinc-700',
        'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
