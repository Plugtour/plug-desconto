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

  // evita loop: ler URL -> setState -> escrever URL na montagem
  const didInitRef = useRef(false);
  const lastWrittenRef = useRef<string>('');

  // 1) ✅ ao montar: aplica q + status vindos da URL para o estado local da página
  useEffect(() => {
    if (didInitRef.current) return;

    const qParam = params.get('q') || '';
    const statusParam = (params.get('status') || '') as K | '';

    if (qParam && !search) onSearch(qParam);

    // status só aplica se existir na lista de items
    if (statusParam) {
      const exists = items.some((it) => String(it.key) === String(statusParam));
      if (exists) onChange(statusParam as K);
    }

    didInitRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) ✅ sempre que search/status mudar: escreve em ?q= e ?status=
  useEffect(() => {
    if (!didInitRef.current) return;

    const next = new URLSearchParams(params.toString());

    // q
    const qClean = (search || '').trim();
    if (qClean) next.set('q', qClean);
    else next.delete('q');

    // status
    if (value && value !== 'todos') next.set('status', String(value));
    else next.delete('status');

    const nextQS = next.toString();
    const nextUrl = nextQS ? `${pathname}?${nextQS}` : pathname;

    // evita replace repetido (loop)
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
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                  : 'border-zinc-900 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
              ].join(' ')}
              type="button"
            >
              {it.label}
              {typeof it.count === 'number' && (
                <span className="ml-2 rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300">
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
          className="w-full rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
        />
      </div>
    </div>
  );
}
