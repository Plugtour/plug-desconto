'use client';

// app/admin/franquiados/AdminFranquiadosClient.tsx
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import AdminStatusPill from '../_components/AdminStatusPill';
import AdminFiltersBar from '../_components/AdminFiltersBar';
import AdminTableShell from '../_components/AdminTableShell';
import AdminTag from '../_components/AdminTag';
import AdminRowActions from '../_components/AdminRowActions';
import { useAdminToast } from '../_components/AdminToastProvider';
import { useAdminData } from '../_components/AdminDataProvider';

import type { FranchiseeStatus, AdminFranchiseeRow } from '../_data/adminMappers';

const isFranchiseeStatus = (v: string | null): v is FranchiseeStatus =>
  v === 'rascunho' || v === 'publicado' || v === 'pausado' || v === 'arquivado' || v === 'lixeira';

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

const buildWhatsappHref = (raw: string) => {
  const digits = onlyDigits(raw);
  if (!digits) return 'https://wa.me/55';
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

const formatBRPhone = (raw: string) => {
  let d = onlyDigits(raw);
  if (!d) return '';

  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.length < 10) return raw;

  const ddd = d.slice(0, 2);
  const rest = d.slice(2);

  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;

  return `(${ddd}) ${rest}`;
};

const parseAnyDate = (s: string) => {
  const raw = (s || '').trim();
  if (!raw) return 0;

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const t = new Date(raw.slice(0, 10)).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  const clean = raw.replace(/-/g, '/');
  const parts = clean.split('/');
  if (parts.length < 3) return 0;

  const dd = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  const yy = parseInt(parts[2], 10);

  if (!dd || !mm || Number.isNaN(yy)) return 0;

  const yyyy = yy < 100 ? 2000 + yy : yy;
  const t = new Date(yyyy, mm - 1, dd).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const statusWeight: Record<FranchiseeStatus, number> = {
  publicado: 1,
  rascunho: 2,
  pausado: 3,
  arquivado: 4,
  lixeira: 5,
};

type SortKey = 'nome' | 'cidade' | 'whatsapp' | 'status' | 'atualizadoEm';
type SortDir = 'asc' | 'desc';

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
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  innerClassName?: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  return (
    <th className={`px-3 py-3 font-medium ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => onToggle(k)}
        className={[
          'inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition',
          'text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
          'dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100',
          innerClassName,
        ].join(' ')}
        title="Ordenar"
      >
        <span className="text-xs">{children}</span>
        <SortIcon colKey={k} activeKey={sortKey} dir={sortDir} />
      </button>
    </th>
  );
}

function RowThumb({ src, alt }: { src?: string | null; alt: string }) {
  const [err, setErr] = useState(false);
  const showImg = !!src && !err;

  return (
    <div
      className={[
        'h-[42px] w-[56px] overflow-hidden rounded-md border',
        'border-zinc-200 bg-zinc-100',
        'dark:border-zinc-800 dark:bg-zinc-900',
      ].join(' ')}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="h-full w-full bg-blue-600/90 dark:bg-blue-500/70" aria-hidden="true" />
      )}
    </div>
  );
}

export default function AdminFranquiadosClient() {
  const { showToast } = useAdminToast();
  const {
    franchisees,
    setFranchiseeStatus,
    emptyFranchiseesTrash,
    deleteFranchiseeForever,
  } = useAdminData();

  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<FranchiseeStatus | 'todos'>('todos');
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

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;

    const sp = new URLSearchParams(window.location.search);
    const qParam = sp.get('q') || '';
    const statusParam = sp.get('status');

    if (qParam) setQ(qParam);
    if (statusParam && isFranchiseeStatus(statusParam)) setStatus(statusParam);

    didInitRef.current = true;
  }, []);

  useEffect(() => {
    if (!didInitRef.current) return;

    const sp = new URLSearchParams(window.location.search);

    const nextQ = q.trim();
    if (nextQ) sp.set('q', nextQ);
    else sp.delete('q');

    if (status && status !== 'todos') sp.set('status', status);
    else sp.delete('status');

    const next = sp.toString();
    const url = next ? `${pathname}?${next}` : pathname;
    router.replace(url, { scroll: false });
  }, [q, status, pathname, router]);

  const clearFilters = () => {
    setStatus('todos');
    setQ('');
  };

  const getNameById = (id: string) => (franchisees as AdminFranchiseeRow[]).find((f) => f.id === id)?.nome || id;

  const handlePublish = (id: string) => {
    setFranchiseeStatus(id, 'publicado');
    showToast(`Franquiado publicado: ${getNameById(id)}`, 'success');
  };

  const handlePause = (id: string) => {
    setFranchiseeStatus(id, 'pausado');
    showToast(`Franquiado pausado: ${getNameById(id)}`, 'warning');
  };

  const handleArchive = (id: string) => {
    setFranchiseeStatus(id, 'arquivado');
    showToast(`Franquiado arquivado: ${getNameById(id)}`, 'error');
  };

  const handleTrash = (id: string) => {
    setFranchiseeStatus(id, 'lixeira');
    showToast(`Enviado para lixeira: ${getNameById(id)}`, 'warning');
  };

  const handleRestore = (id: string) => {
    setFranchiseeStatus(id, 'rascunho');
    showToast(`Franquiado restaurado: ${getNameById(id)}`, 'success');
  };

  const handleEmptyTrash = () => {
    emptyFranchiseesTrash();
    showToast('Lixeira esvaziada', 'success');
  };

  const handleDeleteForever = (id: string) => {
    deleteFranchiseeForever(id);
    showToast(`Excluído definitivamente: ${getNameById(id)}`, 'success');
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return (franchisees as AdminFranchiseeRow[])
      .filter((f) => (status === 'todos' ? true : f.status === status))
      .filter((f) => {
        if (!term) return true;
        return (
          f.nome.toLowerCase().includes(term) ||
          f.cidade.toLowerCase().includes(term) ||
          (f.whatsapp || '').toLowerCase().includes(term) ||
          f.id.toLowerCase().includes(term)
        );
      });
  }, [franchisees, status, q]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;

    const getValue = (f: AdminFranchiseeRow, key: SortKey) => {
      switch (key) {
        case 'nome':
          return (f.nome || '').toLowerCase();
        case 'cidade':
          return (f.cidade || '').toLowerCase();
        case 'whatsapp':
          return (f.whatsapp || '').toLowerCase();
        case 'status':
          return statusWeight[f.status] ?? 999;
        case 'atualizadoEm':
          return parseAnyDate(f.atualizadoEm);
        default:
          return '';
      }
    };

    return [...filtered].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;

      const na = (a.nome || '').toLowerCase();
      const nb = (b.nome || '').toLowerCase();
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const counts = useMemo(() => {
    const rows = franchisees as AdminFranchiseeRow[];
    const base: Record<'todos' | FranchiseeStatus, number> = {
      todos: rows.length,
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
      lixeira: 0,
    };
    for (const f of rows) base[f.status] += 1;
    return base;
  }, [franchisees]);

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
  const shiftInner = '-ml-10';

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Franquiados</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Listar, buscar e filtrar por status. Itens podem ir para arquivado ou lixeira.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/franquiados/novo"
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              'border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
              'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            Novo franquiado
          </Link>
        </div>
      </div>

      <AdminFiltersBar<FranchiseeStatus | 'todos'>
        value={status}
        onChange={setStatus}
        items={filterItems}
        search={q}
        onSearch={setQ}
        placeholder="Buscar por nome, cidade..."
      />

      {status === 'lixeira' && (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-900 dark:bg-zinc-950">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Itens na lixeira podem ser restaurados.</div>

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
            <span className="text-zinc-900 dark:text-zinc-300">{(franchisees as AdminFranchiseeRow[]).length}</span>{' '}
            franquiados.
          </>
        }
      >
        <table className="w-full min-w-[1180px] table-fixed text-left">
          <colgroup>
            <col style={{ width: '76px' }} />
            <col />
            <col />
            <col style={{ width: '170px' }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '170px' }} />
            <col style={{ width: '190px' }} />
          </colgroup>

          <thead className="border-b border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
            <tr className="text-xs text-zinc-600 dark:text-zinc-400">
              <th className="pl-3 pr-0 py-3 font-medium">
                <span className="sr-only">Imagem</span>
              </th>

              <ThSort k="nome" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Nome
              </ThSort>

              <ThSort k="cidade" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Cidade
              </ThSort>

              <ThSort k="whatsapp" innerClassName={shiftInner} sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort}>
                Telefone
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
                <td className="px-3 py-6 text-sm text-zinc-600 dark:text-zinc-500" colSpan={7}>
                  Nenhum franquiado encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              sorted.map((f) => {
                const whatsappHref = f.whatsappHref || buildWhatsappHref(f.whatsapp);
                const phoneLabel = formatBRPhone(f.whatsapp) || f.whatsapp;

                return (
                  <tr key={f.id} className="h-[54px] text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                    <td className="pl-3 pr-0 py-2 align-middle">
                      <div className="flex h-[54px] items-center">
                        <RowThumb src={f.imageUrl ?? null} alt={f.nome} />
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className="flex h-[54px] flex-col justify-center leading-[1.05]">
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={f.nome}>
                          {f.nome}
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-500" title={f.id}>
                          {f.id}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle text-zinc-700 dark:text-zinc-200">
                      <span className="block truncate" title={f.cidade}>
                        {f.cidade}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className={shiftInner}>
                        <AdminTag>
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full whitespace-nowrap hover:underline"
                            title={phoneLabel}
                          >
                            {phoneLabel}
                          </a>
                        </AdminTag>
                      </div>
                    </td>

                    <td className="px-2 py-2 align-middle">
                      <div className={shiftInner}>
                        <div className="whitespace-nowrap">
                          <AdminStatusPill status={f.status} />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle text-zinc-600 dark:text-zinc-300">
                      <div className={shiftInner}>
                        <span className="whitespace-nowrap">{f.atualizadoEm}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className="flex justify-end whitespace-nowrap">
                        <AdminRowActions
                          id={f.id}
                          status={f.status}
                          onView={(id) => showToast(`Visualizar: ${getNameById(id)}`, 'success')}
                          onEdit={(id) => showToast(`Editar: ${getNameById(id)}`, 'success')}
                          onPublish={handlePublish}
                          onPause={handlePause}
                          onArchive={handleArchive}
                          onTrash={handleTrash}
                          onRestore={handleRestore}
                          onDeleteForever={handleDeleteForever}
                          viewBaseHref="/admin/franquiados"
                          editBaseHref="/admin/franquiados/editar"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </main>
  );
}
