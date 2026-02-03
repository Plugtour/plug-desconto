'use client';

// app/admin/ofertas/AdminOfertasClient.tsx
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import AdminStatusPill from '../_components/AdminStatusPill';
import AdminFiltersBar from '../_components/AdminFiltersBar';
import AdminTableShell from '../_components/AdminTableShell';
import AdminRowActions from '../_components/AdminRowActions';
import { useAdminToast } from '../_components/AdminToastProvider';
import { useAdminData } from '../_components/AdminDataProvider';

import type { OfferStatus } from '../_data/adminMappers';

type SortKey = 'titulo' | 'parceiro' | 'categoria' | 'status' | 'atualizadoEm';
type SortDir = 'asc' | 'desc';

type OfferItem = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
};

const parseAnyDateTime = (s: string) => {
  const raw = (s || '').trim();
  if (!raw) return 0;

  const t1 = new Date(raw).getTime();
  if (!Number.isNaN(t1)) return t1;

  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})$/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yyyy = parseInt(m[3], 10);
    const hh = parseInt(m[4], 10);
    const mi = parseInt(m[5], 10);
    const t = new Date(yyyy, mm - 1, dd, hh, mi).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  const clean = raw.replace(/-/g, '/');
  const parts = clean.split('/');
  if (parts.length >= 3) {
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    const yy = parseInt(parts[2], 10);
    if (dd && mm && !Number.isNaN(yy)) {
      const yyyy = yy < 100 ? 2000 + yy : yy;
      const t = new Date(yyyy, mm - 1, dd).getTime();
      return Number.isNaN(t) ? 0 : t;
    }
  }

  return 0;
};

const statusWeight: Record<OfferStatus, number> = {
  publicado: 1,
  rascunho: 2,
  pausado: 3,
  arquivado: 4,
  lixeira: 5,
};

function SortIcon({
  colKey,
  activeKey,
  dir,
}: {
  colKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
}) {
  if (activeKey !== colKey) return null;
  return dir === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
  );
}

function ThSort({
  k,
  children,
  align = 'left',
  className = '',
  innerClassName = '',
  sortKey,
  sortDir,
  onToggle,
}: {
  k: SortKey;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  innerClassName?: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  return (
    <th className={`px-3 py-3 font-medium ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <div className={innerClassName}>
        <button
          type="button"
          onClick={() => onToggle(k)}
          className={[
            'inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition',
            'text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
            'dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100',
          ].join(' ')}
          title="Ordenar"
        >
          <span className="text-xs">{children}</span>
          <SortIcon colKey={k} activeKey={sortKey} dir={sortDir} />
        </button>
      </div>
    </th>
  );
}

function RowThumb({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div
      className={['h-[44px] w-[44px] flex-none overflow-hidden rounded-md', 'bg-blue-600/90 dark:bg-blue-500/80'].join(
        ' '
      )}
      aria-hidden={!src}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  );
}

export default function AdminOfertasClient() {
  const { showToast } = useAdminToast();
  const { offers, setOfferStatus, emptyOffersTrash, deleteOfferForever } = useAdminData();

  // ✅ padrão: "todos" (mas sem incluir lixeira)
  const [status, setStatus] = useState<OfferStatus | 'todos'>('todos');
  const [q, setQ] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('atualizadoEm');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
      return prevKey;
    });
  };

  const shiftInner = '-ml-10';

  const getTitleById = (id: string) => (offers as OfferItem[]).find((o) => o.id === id)?.titulo || id;

  const handlePublish = (id: string) => {
    setOfferStatus(id, 'publicado');
    showToast(`Oferta publicada: ${getTitleById(id)}`, 'success');
  };

  const handlePause = (id: string) => {
    setOfferStatus(id, 'pausado');
    showToast(`Oferta pausada: ${getTitleById(id)}`, 'warning');
  };

  const handleArchive = (id: string) => {
    setOfferStatus(id, 'arquivado');
    showToast(`Oferta arquivada: ${getTitleById(id)}`, 'error');
  };

  const handleTrash = (id: string) => {
    setOfferStatus(id, 'lixeira');
    showToast(`Enviado para lixeira: ${getTitleById(id)}`, 'warning');
  };

  const handleRestore = (id: string) => {
    setOfferStatus(id, 'rascunho');
    showToast(`Oferta restaurada: ${getTitleById(id)}`, 'success');
  };

  const handleDeleteForever = (id: string) => {
    deleteOfferForever(id);
    showToast(`Excluída definitivamente: ${getTitleById(id)}`, 'error');
  };

  const handleEmptyTrash = () => {
    emptyOffersTrash();
    showToast('Lixeira esvaziada', 'success');
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return (offers as OfferItem[])
      .filter((o) => {
        // ✅ REGRA PRINCIPAL:
        // - "todos" = tudo MENOS lixeira
        // - "lixeira" = só lixeira
        // - demais = status exato
        if (status === 'todos') return o.status !== 'lixeira';
        return o.status === status;
      })
      .filter((o) => {
        if (!term) return true;
        return (
          o.titulo.toLowerCase().includes(term) ||
          o.parceiro.toLowerCase().includes(term) ||
          o.categoria.toLowerCase().includes(term) ||
          o.id.toLowerCase().includes(term)
        );
      });
  }, [offers, status, q]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;

    const getValue = (o: OfferItem, key: SortKey) => {
      switch (key) {
        case 'titulo':
          return (o.titulo || '').toLowerCase();
        case 'parceiro':
          return (o.parceiro || '').toLowerCase();
        case 'categoria':
          return (o.categoria || '').toLowerCase();
        case 'status':
          return statusWeight[o.status] ?? 999;
        case 'atualizadoEm':
          return parseAnyDateTime(o.atualizadoEm);
        default:
          return '';
      }
    };

    return [...filtered].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;

      const ta = (a.titulo || '').toLowerCase();
      const tb = (b.titulo || '').toLowerCase();
      if (ta < tb) return -1;
      if (ta > tb) return 1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const counts = useMemo(() => {
    const list = offers as OfferItem[];

    const base: Record<'todos' | OfferStatus, number> = {
      // ✅ "todos" NÃO conta lixeira
      todos: list.filter((o) => o.status !== 'lixeira').length,
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
      lixeira: 0,
    };

    for (const o of list) base[o.status] += 1;
    return base;
  }, [offers]);

  // ✅ ordem: Todos primeiro
  const filterItems = useMemo(
    () => [
      { key: 'todos' as const, label: 'Todos', count: counts.todos },
      { key: 'publicado' as const, label: 'Publicado', count: counts.publicado },
      { key: 'pausado' as const, label: 'Pausado', count: counts.pausado },
      { key: 'rascunho' as const, label: 'Rascunho', count: counts.rascunho },
      { key: 'arquivado' as const, label: 'Arquivado', count: counts.arquivado },
      { key: 'lixeira' as const, label: 'Lixeira', count: counts.lixeira },
    ],
    [counts]
  );
 
  const hasFilters = q.trim().length > 0 || status !== 'todos';

  const clearFilters = () => {
    setStatus('todos');
    setQ('');
  };

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ofertas</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Listar, buscar e filtrar por status. Itens podem ir para arquivado ou lixeira.
          </p>
        </div>

        <Link
          href="/admin/ofertas/nova"
          className={[
            'rounded-lg px-3 py-2 text-sm font-medium transition',
            'border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
            'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
          ].join(' ')}
        >
          Nova oferta
        </Link>
      </div>

      <AdminFiltersBar<OfferStatus | 'todos'>
        value={status}
        onChange={setStatus}
        items={filterItems}
        search={q}
        onSearch={setQ}
        placeholder="Buscar por título, parceiro, categoria..."
      />

      {status === 'lixeira' && (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-900 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Itens na lixeira podem ser restaurados ou excluídos definitivamente.
          </div>

          <button
            type="button"
            onClick={handleEmptyTrash}
            className={[
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
              'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
            ].join(' ')}
            title="Remove definitivamente os itens que estão na lixeira"
          >
            <Trash2 className="h-4 w-4" />
            Esvaziar lixeira
          </button>
        </div>
      )}

      {hasFilters && (
        <div
          className={[
            'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3',
            'border-zinc-200 bg-white',
            'dark:border-zinc-900 dark:bg-zinc-950',
          ].join(' ')}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-500 dark:text-zinc-500">Filtrado por:</span>

            {status !== 'todos' && (
              <span
                className={[
                  'rounded-full border px-2 py-1',
                  'border-zinc-200 bg-zinc-100 text-zinc-700',
                  'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
                ].join(' ')}
              >
                status: <span className="font-medium text-zinc-900 dark:text-zinc-100">{status}</span>
              </span>
            )}

            {q.trim() && (
              <span
                className={[
                  'rounded-full border px-2 py-1',
                  'border-zinc-200 bg-zinc-100 text-zinc-700',
                  'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
                ].join(' ')}
              >
                busca:{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">&quot;{q.trim()}&quot;</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className={[
              'rounded-lg border px-3 py-1.5 text-xs transition',
              'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
            ].join(' ')}
          >
            Limpar filtros
          </button>
        </div>
      )}

      <AdminTableShell
        footer={
          <>
            Mostrando <span className="text-zinc-900 dark:text-zinc-300">{sorted.length}</span> de{' '}
            <span className="text-zinc-900 dark:text-zinc-300">
              {(() => {
                const list = offers as OfferItem[];
                return status === 'todos' ? list.filter((o) => o.status !== 'lixeira').length : list.length;
              })()}
            </span>{' '}
            ofertas.
          </>
        }
      >
        <table className="w-full min-w-[1120px] table-fixed text-left">
          <colgroup>
            <col />
            <col style={{ width: '170px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '190px' }} />
          </colgroup>

          <thead className="border-b border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
            <tr className="text-xs text-zinc-600 dark:text-zinc-400">
              <ThSort k="titulo" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Título
              </ThSort>

              <ThSort k="parceiro" innerClassName={shiftInner} sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Parceiro
              </ThSort>

              <ThSort
                k="categoria"
                innerClassName={shiftInner}
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
              >
                Categoria
              </ThSort>

              <ThSort k="status" innerClassName={shiftInner} sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Status
              </ThSort>

              <ThSort
                k="atualizadoEm"
                innerClassName={shiftInner}
                sortKey={sortKey}
                sortDir={sortDir}
                onToggle={toggleSort}
              >
                Atualizado
              </ThSort>

              <th className="px-3 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
            {sorted.length === 0 ? (
              <tr className="h-[64px]">
                <td className="px-3 py-6 text-sm text-zinc-500" colSpan={6}>
                  Nenhuma oferta encontrada com os filtros atuais.
                </td>
              </tr>
            ) : (
              sorted.map((o) => (
                <tr key={o.id} className="h-[54px] text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-3">
                      <RowThumb src={o.imageUrl} alt={o.titulo} />
                      <div className="flex h-[54px] min-w-0 flex-col justify-center leading-[1.05]">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={o.titulo}>
                          {o.titulo}
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500" title={o.id}>
                          {o.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                    <div className={shiftInner}>
                      <span className="block truncate" title={o.parceiro}>
                        {o.parceiro}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                    <div className={shiftInner}>
                      <span className="block whitespace-normal break-words">{o.categoria}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <div className={shiftInner}>
                      <AdminStatusPill status={o.status} />
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle text-zinc-600 dark:text-zinc-300">
                    <div className={shiftInner}>
                      <span className="whitespace-nowrap">{o.atualizadoEm}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <div className="flex justify-end whitespace-nowrap">
                      <AdminRowActions
                        id={o.id}
                        editBaseHref="/admin/ofertas/editar"
                        status={o.status}
                        onView={(id) => showToast(`Visualizar: ${getTitleById(id)}`, 'success')}
                        onEdit={(id) => showToast(`Editar: ${getTitleById(id)}`, 'success')}
                        onPublish={handlePublish}
                        onPause={handlePause}
                        onArchive={handleArchive}
                        onTrash={handleTrash}
                        onRestore={handleRestore}
                        onDeleteForever={handleDeleteForever}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </main>
  );
}
