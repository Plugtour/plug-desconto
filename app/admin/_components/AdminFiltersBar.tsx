'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type FilterItem<K extends string> = { key: K | 'todos'; label: string; count?: number };

function isSame(a: string, b: string) {
  return (a || '') === (b || '');
}

export default function AdminFiltersBar<K extends string>({
  value,
  onChange,
  items,
  search,
  onSearch,
  placeholder,
}: {
  value: K | 'todos';
  onChange: (v: K | 'todos') => void;
  items: FilterItem<K>[];
  search: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const didInitRef = useRef(false);
  const lastWrittenRef = useRef<string>('');

  useEffect(() => {
    if (didInitRef.current) return;

    const qParam = params.get('q') || '';
    const statusParam = (params.get('status') || '') as K | '';

    if (qParam && !search) onSearch(qParam);

    if (statusParam) {
      const exists = items.some((it) => String(it.key) === String(statusParam));
      if (exists) onChange(statusParam as K);
    }

    didInitRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didInitRef.current) return;

    const next = new URLSearchParams(params.toString());

    const qClean = (search || '').trim();
    if (qClean) next.set('q', qClean);
    else next.delete('q');

    if (value && value !== 'todos') next.set('status', String(value));
    else next.delete('status');

    const nextQS = next.toString();
    const nextUrl = nextQS ? `${pathname}?${nextQS}` : pathname;

    if (isSame(lastWrittenRef.current, nextUrl)) return;
    lastWrittenRef.current = nextUrl;

    router.replace(nextUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, value, pathname]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it) => {
          const active = it.key === value;

          return (
            <button
              key={String(it.key)}
              onClick={() => onChange(it.key)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs transition',
                active
                  ? [
                      'border-zinc-900 bg-zinc-900 text-white',
                      'dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900',
                    ].join(' ')
                  : [
                      'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
                      'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200',
                    ].join(' '),
              ].join(' ')}
              type="button"
            >
              {it.label}
              {typeof it.count === 'number' && (
                <span
                  className={[
                    'ml-2 rounded-full px-2 py-0.5 text-[11px]',
                    active
                      ? 'bg-white/15 text-white dark:bg-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300',
                  ].join(' ')}
                >
                  {it.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder || 'Buscar...'}
          className={[
            'w-full rounded-xl border px-3 py-2 text-sm outline-none',
            'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400',
            'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700',
          ].join(' ')}
        />
      </div>
    </div>
  );
}
