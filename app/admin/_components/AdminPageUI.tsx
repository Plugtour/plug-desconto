import type { ReactNode } from 'react';

export function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </div>
  );
}

export function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  );
}

export function Box({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </div>
      <div className="mt-1 text-sm text-zinc-500">{desc}</div>
    </div>
  );
}

export function Placeholder({ height = 220 }: { height?: number }) {
  return (
    <div
      className="mt-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800"
      style={{ height }}
    />
  );
}
