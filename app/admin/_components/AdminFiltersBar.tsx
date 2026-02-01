'use client';

// app/admin/_components/AdminFiltersBar.tsx
import React from 'react';

type KeyLike = string;
type Tone = 'blue' | 'red' | 'amber' | 'green' | 'zinc' | 'teal';

export type AdminFilterItem<T extends KeyLike> = {
  key: T;
  label: string;
  count?: number;
  /** 🎨 opcional: quando informado, aplica cor igual ao Dashboard */
  tone?: Tone;
};

const toneBtn: Record<
  Tone,
  {
    idle: string;
    active: string;
    bubbleIdle: string;
    bubbleActive: string;
  }
> = {
  blue: {
    idle:
      'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/20',
    active:
      'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200',
    bubbleIdle: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
    bubbleActive: 'bg-white/70 text-sky-900 dark:bg-white/15 dark:text-sky-100',
  },
  red: {
    idle:
      'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/20',
    active:
      'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200',
    bubbleIdle: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
    bubbleActive: 'bg-white/70 text-rose-900 dark:bg-white/15 dark:text-rose-100',
  },
  amber: {
    idle:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/20',
    active:
      'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200',
    bubbleIdle: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    bubbleActive: 'bg-white/70 text-amber-900 dark:bg-white/15 dark:text-amber-100',
  },
  green: {
    idle:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20',
    active:
      'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200',
    bubbleIdle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    bubbleActive: 'bg-white/70 text-emerald-900 dark:bg-white/15 dark:text-emerald-100',
  },
  zinc: {
    idle:
      'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-200 dark:hover:bg-zinc-500/20',
    active:
      'border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-200',
    bubbleIdle: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-200',
    bubbleActive: 'bg-white/70 text-zinc-900 dark:bg-white/15 dark:text-zinc-100',
  },
  teal: {
    idle:
      'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-200 dark:hover:bg-teal-500/20',
    active:
      'border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-200',
    bubbleIdle: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200',
    bubbleActive: 'bg-white/70 text-teal-900 dark:bg-white/15 dark:text-teal-100',
  },
};

export default function AdminFiltersBar<T extends KeyLike>({
  value,
  onChange,
  items,
  search,
  onSearch,
  placeholder,
  className = '',
}: {
  value: T;
  onChange: (value: T) => void;
  items: AdminFilterItem<T>[];
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={['flex flex-col gap-3', className].join(' ')}>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it) => {
          const active = value === it.key;
          const count = typeof it.count === 'number' ? it.count : undefined;

          const hasTone = Boolean(it.tone);

          const base = [
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-normal transition',
            'border',
          ].join(' ');

          const klass = hasTone
            ? [base, active ? toneBtn[it.tone as Tone].active : toneBtn[it.tone as Tone].idle].join(' ')
            : [
                base,
                active
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/40 dark:hover:border-zinc-700',
              ].join(' ');

          const bubbleClass = hasTone
            ? [
                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none',
                active ? toneBtn[it.tone as Tone].bubbleActive : toneBtn[it.tone as Tone].bubbleIdle,
              ].join(' ')
            : [
                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none',
                active
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
              ].join(' ');

          return (
            <button
              key={String(it.key)}
              type="button"
              onClick={() => onChange(it.key)}
              className={klass}
            >
              <span className="leading-none">{it.label}</span>

              {typeof count === 'number' && <span className={bubbleClass}>{count}</span>}
            </button>
          );
        })}
      </div>

      {typeof search === 'string' && typeof onSearch === 'function' && (
        <div className="w-full">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder || 'Buscar...'}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
          />
        </div>
      )}
    </div>
  );
}
