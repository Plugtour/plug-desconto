import type { ReactNode } from 'react';

export function Header({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

        {description ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
        ) : null}
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Kpi({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500">{title}</div>

      <div className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>

      {hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

export function Box({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </div>

      {desc ? <div className="mt-1 text-sm text-zinc-500">{desc}</div> : null}

      {children ? <div className={desc ? 'mt-4' : 'mt-3'}>{children}</div> : null}
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

/** opcional: separador discreto para blocos */
export function SoftDivider() {
  return <div className="my-4 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />;
}
