'use client';

// app/admin/parceiros/page.tsx
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';

import AdminStatusPill from '../_components/AdminStatusPill';
import AdminFiltersBar from '../_components/AdminFiltersBar';
import AdminTableShell from '../_components/AdminTableShell';
import AdminTag from '../_components/AdminTag';
import AdminRowActions from '../_components/AdminRowActions';
import { useAdminToast } from '../_components/AdminToastProvider';
import { useAdminData } from '../_components/AdminDataProvider';

import type { PartnerStatus } from '../_data/adminMappers';

const buildWhatsappHref = (raw: string) => {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return 'https://wa.me/55';
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
};

const isPartnerStatus = (v: string | null): v is PartnerStatus =>
  v === 'rascunho' || v === 'publicado' || v === 'pausado' || v === 'arquivado';

// aceita "DD/MM/AA" ou "DD-MM-AA" e também "YYYY-MM-DD"
const parseAnyDate = (s: string) => {
  const raw = (s || '').trim();
  if (!raw) return 0;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const t = new Date(raw.slice(0, 10)).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  // DD/MM/AA ou DD-MM-AA
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

const statusWeight: Record<PartnerStatus, number> = {
  publicado: 1,
  rascunho: 2,
  pausado: 3,
  arquivado: 4,
};

type SortKey = 'nome' | 'categoria' | 'cidade' | 'whatsapp' | 'status' | 'atualizadoEm';
type SortDir = 'asc' | 'desc';

export default function AdminParceirosPage() {
  const { showToast } = useAdminToast();
  const { partners, setPartnerStatus } = useAdminData();

  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<PartnerStatus | 'todos'>('todos');
  const [q, setQ] = useState('');

  // ✅ ordenação
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

  // evita loop entre ler URL -> setState -> reescrever URL
  const didInitRef = useRef(false);

  // ✅ inicia lendo ?q= e ?status= da URL (mesma aba ou vindo do dashboard)
  useEffect(() => {
    if (didInitRef.current) return;

    const sp = new URLSearchParams(window.location.search);
    const qParam = sp.get('q') || '';
    const statusParam = sp.get('status');

    if (qParam) setQ(qParam);
    if (statusParam && isPartnerStatus(statusParam)) setStatus(statusParam);

    didInitRef.current = true;
  }, []);

  // ✅ mantém URL refletindo o estado atual (q + status)
  useEffect(() => {
    if (!didInitRef.current) return;

    const sp = new URLSearchParams(window.location.search);

    // q
    const nextQ = q.trim();
    if (nextQ) sp.set('q', nextQ);
    else sp.delete('q');

    // status
    if (status && status !== 'todos') sp.set('status', status);
    else sp.delete('status');

    const next = sp.toString();
    const url = next ? `${pathname}?${next}` : pathname;

    router.replace(url, { scroll: false });
  }, [q, status, pathname, router]);

  const clearFilters = () => {
    setStatus('todos');
    setQ('');
    // URL vai atualizar via effect acima
  };

  const getNameById = (id: string) => partners.find((p) => p.id === id)?.nome || id;

  const handlePublish = (id: string) => {
    setPartnerStatus(id, 'publicado');
    showToast(`Parceiro publicado: ${getNameById(id)}`, 'success');
  };

  const handlePause = (id: string) => {
    setPartnerStatus(id, 'pausado');
    showToast(`Parceiro pausado: ${getNameById(id)}`, 'warning');
  };

  const handleArchive = (id: string) => {
    setPartnerStatus(id, 'arquivado');
    showToast(`Parceiro arquivado: ${getNameById(id)}`, 'error');
  };

  const handleRestore = (id: string) => {
    setPartnerStatus(id, 'rascunho');
    showToast(`Parceiro restaurado: ${getNameById(id)}`, 'success');
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return partners
      .filter((p) => (status === 'todos' ? true : p.status === status))
      .filter((p) => {
        if (!term) return true;
        return (
          p.nome.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term) ||
          p.cidade.toLowerCase().includes(term) ||
          p.whatsapp.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term)
        );
      });
  }, [partners, status, q]);

  // ✅ ordenação aplicada ao resultado filtrado
  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;

    const getValue = (p: any, key: SortKey) => {
      switch (key) {
        case 'nome':
          return (p.nome || '').toLowerCase();
        case 'categoria':
          return (p.categoria || '').toLowerCase();
        case 'cidade':
          return (p.cidade || '').toLowerCase();
        case 'whatsapp':
          return (p.whatsapp || '').toLowerCase();
        case 'status':
          return statusWeight[p.status as PartnerStatus] ?? 999;
        case 'atualizadoEm':
          return parseAnyDate(p.atualizadoEm);
        default:
          return '';
      }
    };

    return [...filtered].sort((a: any, b: any) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;

      // desempate: por nome
      const na = (a.nome || '').toLowerCase();
      const nb = (b.nome || '').toLowerCase();
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const counts = useMemo(() => {
    const base: Record<'todos' | PartnerStatus, number> = {
      todos: partners.length,
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
    };
    for (const p of partners) base[p.status] += 1;
    return base;
  }, [partners]);

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
  }: {
    k: SortKey;
    children: React.ReactNode;
    align?: 'left' | 'right';
  }) => {
    return (
      <th className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : ''}`}>
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

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parceiros</h1>
          <p className="mt-1 text-sm text-zinc-400">
            MVP: listar, buscar e filtrar por status. Nada é apagado — tudo é arquivado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/parceiros/novo"
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Novo parceiro
          </Link>
        </div>
      </div>

      <AdminFiltersBar<PartnerStatus>
        value={status}
        onChange={setStatus}
        items={filterItems}
        search={q}
        onSearch={setQ}
        placeholder="Buscar por nome, cidade, categoria..."
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
            <span className="text-zinc-300">{partners.length}</span> parceiros (mock).
          </>
        }
      >
        <table className="w-full min-w-[920px] text-left">
          <thead className="border-b border-zinc-900 bg-zinc-950">
            <tr className="text-xs text-zinc-400">
              <ThSort k="nome">Nome</ThSort>
              <ThSort k="categoria">Categoria</ThSort>
              <ThSort k="cidade">Cidade</ThSort>
              <ThSort k="whatsapp">WhatsApp</ThSort>
              <ThSort k="status">Status</ThSort>
              <ThSort k="atualizadoEm">Atualizado</ThSort>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900">
            {sorted.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                  Nenhum parceiro encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              sorted.map((p) => {
                const whatsappHref = (p as any).whatsappHref || buildWhatsappHref(p.whatsapp);

                return (
                  <tr key={p.id} className="text-sm">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-100">{p.nome}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">{p.id}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">{p.categoria}</td>
                    <td className="px-4 py-3 text-zinc-200">{p.cidade}</td>
                    <td className="px-4 py-3">
                      <AdminTag>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {p.whatsapp}
                        </a>
                      </AdminTag>
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{p.atualizadoEm}</td>
                    <td className="px-4 py-3">
                      <AdminRowActions
                        id={p.id}
                        status={p.status}
                        onView={(id) => showToast(`Visualizar: ${getNameById(id)}`, 'success')}
                        onEdit={(id) => showToast(`Editar: ${getNameById(id)}`, 'success')}
                        onPublish={handlePublish}
                        onPause={handlePause}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        viewBaseHref="/admin/parceiros"
                        editBaseHref="/admin/parceiros/editar"
                      />
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
