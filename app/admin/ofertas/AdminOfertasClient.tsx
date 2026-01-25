'use client';

// app/admin/ofertas/AdminOfertasClient.tsx
import { useMemo, useState } from 'react';
import Link from 'next/link';

import AdminStatusPill from '../_components/AdminStatusPill';
import AdminFiltersBar from '../_components/AdminFiltersBar';
import AdminTableShell from '../_components/AdminTableShell';
import AdminTag from '../_components/AdminTag';
import AdminRowActions from '../_components/AdminRowActions';
import { useAdminToast } from '../_components/AdminToastProvider';
import { useAdminData } from '../_components/AdminDataProvider';

import type { OfferStatus } from '../_data/adminMappers';

export default function AdminOfertasClient() {
  const { showToast } = useAdminToast();
  const { offers, setOfferStatus } = useAdminData();

  const [status, setStatus] = useState<OfferStatus | 'todos'>('todos');
  const [q, setQ] = useState('');

  const getTitleById = (id: string) => offers.find((o) => o.id === id)?.titulo || id;

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

  const handleRestore = (id: string) => {
    setOfferStatus(id, 'rascunho');
    showToast(`Oferta restaurada: ${getTitleById(id)}`, 'success');
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return offers
      .filter((o) => (status === 'todos' ? true : o.status === status))
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

  const counts = useMemo(() => {
    const base: Record<'todos' | OfferStatus, number> = {
      todos: offers.length,
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
    };
    for (const o of offers) base[o.status] += 1;
    return base;
  }, [offers]);

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

  return (
    <main className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ofertas</h1>
          <p className="mt-1 text-sm text-zinc-400">
            MVP: listar, buscar e filtrar por status. Nada é apagado — tudo é arquivado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/ofertas/nova"
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            Nova oferta
          </Link>
        </div>
      </div>

      <AdminFiltersBar<OfferStatus>
        value={status}
        onChange={setStatus}
        items={filterItems}
        search={q}
        onSearch={setQ}
        placeholder="Buscar por título, parceiro, categoria..."
      />

      <AdminTableShell
        footer={
          <>
            Mostrando <span className="text-zinc-300">{filtered.length}</span> de{' '}
            <span className="text-zinc-300">{offers.length}</span> ofertas (mock).
          </>
        }
      >
        <table className="w-full min-w-[860px] text-left">
          <thead className="border-b border-zinc-900 bg-zinc-950">
            <tr className="text-xs text-zinc-400">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Parceiro</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Atualizado</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-900">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                  Nenhuma oferta encontrada com os filtros atuais.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="text-sm">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-100">{o.titulo}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{o.id}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{o.parceiro}</td>
                  <td className="px-4 py-3">
                    <AdminTag>{o.categoria}</AdminTag>
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{o.atualizadoEm}</td>
                  <td className="px-4 py-3">
                    <AdminRowActions
                      id={o.id}
                      status={o.status}
                      onView={(id) => showToast(`Visualizar: ${getTitleById(id)}`, 'success')}
                      onEdit={(id) => showToast(`Editar: ${getTitleById(id)}`, 'success')}
                      onPublish={handlePublish}
                      onPause={handlePause}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                    />
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
