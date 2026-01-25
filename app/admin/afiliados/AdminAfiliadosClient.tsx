'use client';

// app/admin/afiliados/page.client.tsx
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

import AdminStatusPill from '../_components/AdminStatusPill';
import AdminFiltersBar from '../_components/AdminFiltersBar';
import AdminTableShell from '../_components/AdminTableShell';
import AdminTag from '../_components/AdminTag';
import AdminRowActions from '../_components/AdminRowActions';
import { useAdminToast } from '../_components/AdminToastProvider';
import { useAdminData } from '../_components/AdminDataProvider';

import type { AffiliateStatus } from '../_data/adminMappers';

const buildWhatsappHref = (raw: string) => {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return 'https://wa.me/55';
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

const isAffiliateStatus = (v: string | null): v is AffiliateStatus =>
  v === 'rascunho' || v === 'publicado' || v === 'pausado' || v === 'arquivado';

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

const statusWeight: Record<AffiliateStatus, number> = {
  publicado: 1,
  rascunho: 2,
  pausado: 3,
  arquivado: 4,
};

type SortKey = 'nome' | 'email' | 'whatsapp' | 'cupom' | 'status' | 'atualizadoEm';
type SortDir = 'asc' | 'desc';

export default function AdminAfiliadosClient() {
  const { showToast } = useAdminToast();
  const { affiliates, setAffiliateStatus } = useAdminData();

  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<AffiliateStatus | 'todos'>('todos');
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

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-zinc-300" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-zinc-300" />
    );
  };

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;

    const sp = new URLSearchParams(window.location.search);
    const qParam = sp.get('q') || '';
    const statusParam = sp.get('status');

    if (qParam) setQ(qParam);
    if (statusParam && isAffiliateStatus(statusParam)) setStatus(statusParam);

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

  const getNameById = (id: string) => affiliates.find((a) => a.id === id)?.nome || id;

  const handlePublish = (id: string) => {
    setAffiliateStatus(id, 'publicado');
    showToast(`Afiliado publicado: ${getNameById(id)}`, 'success');
  };

  const handlePause = (id: string) => {
    setAffiliateStatus(id, 'pausado');
    showToast(`Afiliado pausado: ${getNameById(id)}`, 'warning');
  };

  const handleArchive = (id: string) => {
    setAffiliateStatus(id, 'arquivado');
    showToast(`Afiliado arquivado: ${getNameById(id)}`, 'error');
  };

  const handleRestore = (id: string) => {
    setAffiliateStatus(id, 'rascunho');
    showToast(`Afiliado restaurado: ${getNameById(id)}`, 'success');
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return affiliates
      .filter((a) => (status === 'todos' ? true : a.status === status))
      .filter((a) => {
        if (!term) return true;
        return (
          a.nome.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          a.whatsapp.toLowerCase().includes(term) ||
          a.cupom.toLowerCase().includes(term) ||
          a.id.toLowerCase().includes(term)
        );
      });
  }, [affiliates, status, q]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;

    const getValue = (a: any, key: SortKey) => {
      switch (key) {
        case 'nome':
          return (a.nome || '').toLowerCase();
        case 'email':
          return (a.email || '').toLowerCase();
        case 'whatsapp':
          return (a.whatsapp || '').toLowerCase();
        case 'cupom':
          return (a.cupom || '').toLowerCase();
        case 'status':
          return statusWeight[a.status as AffiliateStatus] ?? 999;
        case 'atualizadoEm':
          return parseAnyDate(a.atualizadoEm);
        default:
          return '';
      }
    };

    return [...filtered].sort((a: any, b: any) => {
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
    const base: Record<'todos' | AffiliateStatus, number> = {
      todos: affiliates.length,
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
    };
    for (const a of affiliates) base[a.status] += 1;
    return base;
  }, [affiliates]);

  const filterItems = useMemo(
    () => [
      { key: 'todos' as const, label: 'Todos', count: counts.todos },
      { key: 'publicado' as const, label: 'Publicado', count: counts.publicado },
      { key: 'rascunho' as const, label: 'Rascunho', count: counts.rascunho },
      { key: 'pausado' as const, label: 'Pausado', count: counts.pausado },
      { key: 'arquivado' as const, label: 'Arquivado', count: counts.arquivado },
    ],
    [counts]
  );

  const hasFilters = q.trim().length > 0 || status !== 'todos';

  const ThSort = ({
    k,
    children,
    align = 'left',
    className = '',
  }: {
    k: SortKey;
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
  }) => {
    return (
      <th className={`px-3 py-3 font-medium ${align === 'right' ? 'text-right' : ''} ${className}`}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={[
            'inline-flex items-center gap-1 rounded-md px-1 py-0.5',
            'hover:bg-zinc-900 hover:text-zinc-200',
            'text-xs text-zinc-400',
          ].join(' ')}
          title="Ordenar"
        >
          <span className="text-xs text-zinc-400">{children}</span>
          <SortIcon k={k} />
        </button>
      </th>
    );
  };

  const copyText = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(okMsg, 'success');
    } catch {
      showToast('Não foi possível copiar', 'error');
    }
  };

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Afiliados</h1>
          <p className="mt-1 text-sm text-zinc-400">
            MVP: listar, buscar e filtrar por status. Comissões entram depois.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/afiliados/novo"
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Novo afiliado
          </Link>
        </div>
      </div>

      <AdminFiltersBar<AffiliateStatus>
        value={status}
        onChange={setStatus}
        items={filterItems}
        search={q}
        onSearch={setQ}
        placeholder="Buscar por nome, email, cupom..."
      />

      {hasFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500">Filtrado por:</span>

            {status !== 'todos' && (
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200">
                status: <span className="text-zinc-100">{status}</span>
              </span>
            )}

            {q.trim() && (
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200">
                busca: <span className="text-zinc-100">"{q.trim()}"</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
          >
            Limpar filtros
          </button>
        </div>
      )}

      <AdminTableShell
        footer={
          <>
            Mostrando <span className="text-zinc-300">{sorted.length}</span> de{' '}
            <span className="text-zinc-300">{affiliates.length}</span> afiliados (mock).
          </>
        }
      >
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col />
            <col />
            <col style={{ width: '140px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '190px' }} />
          </colgroup>

          <thead className="border-b border-zinc-900 bg-zinc-950">
            <tr className="text-xs text-zinc-400">
              <ThSort k="nome">Nome</ThSort>
              <ThSort k="email">Email</ThSort>
              <ThSort k="whatsapp">WhatsApp</ThSort>
              <ThSort k="cupom">Cupom</ThSort>
              <ThSort k="status">Status</ThSort>
              <ThSort k="atualizadoEm">Atualizado</ThSort>
              <th className="px-3 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900">
            {sorted.length === 0 ? (
              <tr className="h-[64px]">
                <td className="px-3 py-6 text-sm text-zinc-500" colSpan={7}>
                  Nenhum afiliado encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              sorted.map((a) => {
                const whatsappHref = (a as any).whatsappHref || buildWhatsappHref(a.whatsapp);

                return (
                  <tr key={a.id} className="h-[54px] text-sm">
                    <td className="px-2 py-1 align-middle">
                      <div className="flex h-[54px] flex-col justify-center leading-[1.05]">
                        <div className="truncate font-medium text-zinc-100" title={a.nome}>
                          {a.nome}
                        </div>
                        <div className="mt-1 truncate text-xs text-zinc-500" title={a.id}>
                          {a.id}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-1 align-middle">
                      <button
                        type="button"
                        onClick={() => copyText(a.email, 'Email copiado')}
                        title={a.email}
                        className="block w-full truncate text-left text-zinc-200 hover:underline"
                      >
                        {a.email}
                      </button>
                    </td>

                    <td className="px-2 py-1 align-middle">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full truncate text-[12px] text-zinc-200 hover:underline"
                        title={a.whatsapp}
                      >
                        {a.whatsapp}
                      </a>
                    </td>

                    <td className="px-2 py-1 align-middle">
                      <button
                        type="button"
                        onClick={() => copyText(a.cupom, 'Cupom copiado')}
                        title="Clique para copiar"
                        className="inline-flex max-w-full items-center"
                      >
                        <AdminTag>
                          <span className="block max-w-full truncate" title={a.cupom}>
                            {a.cupom}
                          </span>
                        </AdminTag>
                      </button>
                    </td>

                    <td className="px-2 py-2 align-middle">
                      <div className="whitespace-nowrap">
                        <AdminStatusPill status={a.status} />
                      </div>
                    </td>

                    <td className="px-2 py-2 align-middle text-zinc-300">
                      <span className="whitespace-nowrap">{a.atualizadoEm}</span>
                    </td>

                    <td className="px-2 py-2 align-middle">
                      <div className="flex justify-end whitespace-nowrap">
                        <AdminRowActions
                          id={a.id}
                          status={a.status}
                          onView={(id) => showToast(`Visualizar: ${getNameById(id)}`, 'success')}
                          onEdit={(id) => showToast(`Editar: ${getNameById(id)}`, 'success')}
                          onPublish={handlePublish}
                          onPause={handlePause}
                          onArchive={handleArchive}
                          onRestore={handleRestore}
                          viewBaseHref="/admin/afiliados"
                          editBaseHref="/admin/afiliados/editar"
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
