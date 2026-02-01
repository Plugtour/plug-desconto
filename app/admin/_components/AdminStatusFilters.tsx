'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

type StatusKey = 'all' | 'publicado' | 'pausado' | 'rascunho' | 'arquivado' | 'lixeira';

type Tone = 'blue' | 'red' | 'amber' | 'green' | 'zinc';

const STATUS_FILTERS: { key: StatusKey; label: string; tone?: Tone }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'publicado', label: 'Publicado', tone: 'green' },
  { key: 'pausado', label: 'Pausado', tone: 'amber' },
  { key: 'rascunho', label: 'Rascunho', tone: 'blue' },
  { key: 'arquivado', label: 'Arquivado', tone: 'red' },
  { key: 'lixeira', label: 'Lixeira', tone: 'zinc' },
];

const toneChip: Record<
  Tone,
  {
    idle: string;
    active: string;
  }
> = {
  blue: {
    idle:
      'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/20',
    active:
      'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200',
  },
  red: {
    idle:
      'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/20',
    active:
      'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200',
  },
  amber: {
    idle:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/20',
    active:
      'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200',
  },
  green: {
    idle:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20',
    active:
      'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  zinc: {
    idle:
      'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-200 dark:hover:bg-zinc-500/20',
    active:
      'border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-200',
  },
};

export default function AdminStatusFilters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get('status') as StatusKey | null;
  const activeStatus: StatusKey = statusParam ?? 'all';

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTERS.map((filter) => {
        const isActive = activeStatus === filter.key;

        const href = filter.key === 'all' ? pathname : `${pathname}?status=${filter.key}`;

        const base = 'rounded-full px-3 py-1 text-sm transition border';

        const klass =
          filter.key === 'all'
            ? [
                base,
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-900/40',
              ].join(' ')
            : [
                base,
                isActive ? toneChip[filter.tone as Tone].active : toneChip[filter.tone as Tone].idle,
              ].join(' ');

        return (
          <Link key={filter.key} href={href} className={klass}>
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
