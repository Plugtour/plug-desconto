'use client';

// app/admin/logs/AdminLogsClient.tsx
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

type LogItem = {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorRole: string;
  actorName?: string | null;
  before?: any;
  after?: any;
};

type SortDir = 'desc' | 'asc';

function parseDateTime(s: string) {
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function shortId(id?: string | null) {
  if (!id) return '';
  return id.length <= 8 ? id : id.slice(0, 8);
}

function safeText(v: unknown) {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

export default function AdminLogsClient() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filtros
  const [q, setQ] = useState('');
  const [action, setAction] = useState<string>('todos');
  const [entityType, setEntityType] = useState<string>('todos');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set('page', String(p));
      sp.set('pageSize', '20');

      // ordem (API hoje só ordena desc; a gente trata asc no client com reverse)
      // mantém o endpoint simples e estável.

      if (action !== 'todos') sp.set('action', action);
      if (entityType !== 'todos') sp.set('entityType', entityType);

      const res = await fetch(`/api/admin/logs?${sp.toString()}`, { cache: 'no-store' });
      const data = await res.json().catch(() => null);

      if (data?.ok) {
        const got: LogItem[] = Array.isArray(data.items) ? data.items : [];

        // ordenação no client (sem exigir mudança no endpoint)
        const sorted = [...got].sort((a, b) => {
          const da = parseDateTime(a.createdAt);
          const db = parseDateTime(b.createdAt);
          return sortDir === 'desc' ? db - da : da - db;
        });

        setItems(sorted);
        setPages(Number(data.pages ?? 1) || 1);
        setPage(Number(data.page ?? p) || p);
        setTotal(Number(data.total ?? 0) || 0);
      } else {
        setItems([]);
        setPages(1);
        setPage(1);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // primeira carga
  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando muda filtro/ordem, volta pra página 1
  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, entityType, sortDir]);

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.action);
    return ['todos', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) set.add(it.entityType);
    return ['todos', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // busca local (rápida e leve)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((l) => {
      const hay = [
        l.action,
        l.entityType,
        l.entityId ?? '',
        l.actorName ?? '',
        l.actorRole ?? '',
        l.id,
      ]
        .join(' ')
        .toLowerCase();

      return hay.includes(term);
    });
  }, [items, q]);

  const hasFilters = q.trim().length > 0 || action !== 'todos' || entityType !== 'todos' || sortDir !== 'desc';

  const clearFilters = () => {
    setQ('');
    setAction('todos');
    setEntityType('todos');
    setSortDir('desc');
  };

  const SortIcon = () => {
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
    );
  };

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logs de Auditoria</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Histórico de ações administrativas no sistema.
          </p>
        </div>
      </div>

      {/* BARRA DE FILTROS (mesmo feeling do AdminOfertas) */}
      <section
        className={[
          'rounded-xl border px-4 py-3',
          'border-zinc-200 bg-white',
          'dark:border-zinc-900 dark:bg-zinc-950',
        ].join(' ')}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* busca */}
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por ação, entidade, id, usuário..."
                className={[
                  'h-10 w-full md:w-[340px] rounded-lg border px-3 text-sm outline-none transition',
                  'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
                  'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
                ].join(' ')}
              />
              {q.trim() && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className={[
                    'absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition',
                    'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                    'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                  ].join(' ')}
                  aria-label="Limpar busca"
                  title="Limpar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* action */}
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className={[
                'h-10 rounded-lg border px-3 text-sm outline-none transition',
                'border-zinc-200 bg-white text-zinc-900 focus:border-zinc-300',
                'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700',
              ].join(' ')}
              title="Filtrar por ação"
            >
              <option value="todos">Todas as ações</option>
              {actionOptions
                .filter((v) => v !== 'todos')
                .map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
            </select>

            {/* entity */}
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className={[
                'h-10 rounded-lg border px-3 text-sm outline-none transition',
                'border-zinc-200 bg-white text-zinc-900 focus:border-zinc-300',
                'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700',
              ].join(' ')}
              title="Filtrar por entidade"
            >
              <option value="todos">Todas as entidades</option>
              {entityOptions
                .filter((v) => v !== 'todos')
                .map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
            </select>

            {/* order */}
            <button
              type="button"
              onClick={() => setSortDir((v) => (v === 'desc' ? 'asc' : 'desc'))}
              className={[
                'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition',
                'border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
                'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
              ].join(' ')}
              title="Alternar ordem"
            >
              <span>{sortDir === 'desc' ? 'Mais recentes' : 'Mais antigos'}</span>
              <SortIcon />
            </button>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={[
                'h-10 rounded-lg border px-3 text-sm transition',
                'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
              ].join(' ')}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {/* TABELA (mais leve) */}
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
            '[&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0',
            '[&::-webkit-scrollbar-thumb]:bg-transparent',
            '[scrollbar-width:none]',
            '[-ms-overflow-style:none]',
          ].join(' ')}
        >
          <table className="w-full min-w-[980px] table-fixed text-left">
            <colgroup>
              <col style={{ width: '210px' }} />
              <col style={{ width: '230px' }} />
              <col style={{ width: '190px' }} />
              <col style={{ width: '180px' }} />
              <col />
            </colgroup>

            <thead className="border-b border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
              <tr className="text-xs text-zinc-600 dark:text-zinc-400">
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-3 py-3 font-medium">Ação</th>
                <th className="px-3 py-3 font-medium">Entidade</th>
                <th className="px-3 py-3 font-medium">Quem</th>
                <th className="px-3 py-3 font-medium">Resumo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
              {loading ? (
                <tr className="h-[64px]">
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={5}>
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className="h-[64px]">
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={5}>
                    Nenhum log encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="h-[54px] text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                    <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                      <div className="flex h-[54px] flex-col justify-center leading-[1.05]">
                        <div className="whitespace-nowrap" title={l.createdAt}>
                          {new Date(l.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500" title={l.id}>
                          {l.id}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={l.action}>
                        {l.action}
                      </div>
                      {l.entityId ? (
                        <div className="mt-1 truncate text-xs text-zinc-500" title={safeText(l.entityId)}>
                          {safeText(l.entityId)}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-zinc-500">—</div>
                      )}
                    </td>

                    <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                      <span className="truncate" title={l.entityType}>
                        {l.entityType}
                      </span>
                      {l.entityId ? (
                        <span className="text-zinc-500"> #{shortId(l.entityId)}</span>
                      ) : null}
                    </td>

                    <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                      <span className="truncate" title={safeText(l.actorName || l.actorRole)}>
                        {l.actorName || l.actorRole}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-middle text-xs text-zinc-500">
                      {l.before || l.after ? 'Alteração registrada' : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER (igual do TableShell) */}
        <div
          className={[
            'border-t px-4 py-3 text-xs',
            'border-zinc-200 text-zinc-500',
            'dark:border-zinc-900 dark:text-zinc-500',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              Mostrando <span className="text-zinc-900 dark:text-zinc-300">{filtered.length}</span> de{' '}
              <span className="text-zinc-900 dark:text-zinc-300">{items.length}</span> logs nesta página — total:{' '}
              <span className="text-zinc-900 dark:text-zinc-300">{total}</span>.
            </div>

            <div className="flex items-center gap-2">
              <div className="mr-2 hidden text-xs text-zinc-500 md:block">
                Página <span className="text-zinc-900 dark:text-zinc-300">{page}</span> de{' '}
                <span className="text-zinc-900 dark:text-zinc-300">{pages}</span>
              </div>

              <button
                disabled={page <= 1 || loading}
                onClick={() => load(page - 1)}
                className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                disabled={page >= pages || loading}
                onClick={() => load(page + 1)}
                className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
