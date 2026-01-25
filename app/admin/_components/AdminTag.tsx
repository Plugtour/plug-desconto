// app/admin/_components/AdminTag.tsx
import type { ReactNode } from 'react';

export default function AdminTag({ children }: { children: ReactNode }) {
  return (
    <span
      className={[
        'inline-flex max-w-full items-center',
        'rounded-md border border-zinc-800 bg-zinc-900',
        'px-2 py-1 text-xs text-zinc-200',
        'whitespace-nowrap',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
