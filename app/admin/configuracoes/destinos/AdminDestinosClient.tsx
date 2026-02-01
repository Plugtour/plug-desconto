'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  PauseCircle,
  FileText,
  Archive,
  Trash2,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';
type StatusKey = 'all' | AdminStatus;

type Destino = {
  id: string;
  nome: string;
  slug: string;
  status?: AdminStatus; // pode vir vazio em dados antigos (a gente normaliza)
  ativo?: boolean; // compat
  criadoEm?: string;
  atualizadoEm?: string;
};

type ClickEvent = React.MouseEvent<HTMLButtonElement>;

function safeStop(e: ClickEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function pickStatus(d: Destino): AdminStatus {
  const s = String(d?.status || '').toLowerCase();
  if (s === 'rascunho' || s === 'publicado' || s === 'pausado' || s === 'arquivado' || s === 'lixeira') return s;
  // compat com legado
  return d?.ativo ? 'publicado' : 'pausado';
}

function formatStatusLabel(s: AdminStatus) {
  if (s === 'rascunho') return 'Rascunho';
  if (s === 'publicado') return 'Publicado';
  if (s === 'pausado') return 'Pausado';
  if (s === 'arquivado') return 'Arquivado';
  return 'Lixeira';
}

function formatDateBR(value: any) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function TonePill({ status }: { status: AdminStatus }) {
  const map: Record<AdminStatus, string> = {
    rascunho:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200',
    publicado:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200',
    pausado:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200',
    arquivado:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200',
    lixeira:
      'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-200',
  };

  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', map[status]].join(' ')}>
      {formatStatusLabel(status)}
    </span>
  );
}

function Chip({
  label,
  count,
  active,
  icon,
  tone = 'zinc',
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
  tone?: 'zinc' | 'green' | 'amber' | 'blue' | 'red';
  onClick: () => void;
}) {
  const toneCls: Record<string, { idle: string; active: string }> = {
    zinc: {
      idle:
        'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/40',
      active: 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900',
    },
    green: {
      idle:
        'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/20',
      active:
        'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200',
    },
    amber: {
      idle:
        'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/20',
      active:
        'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200',
    },
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
  };

  const cls = [
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
    active ? toneCls[tone].active : toneCls[tone].idle,
  ].join(' ');

  return (
    <button type="button" className={cls} onClick={onClick}>
      <span className="inline-flex items-center gap-2">
        {icon ? <span className="grid place-items-center [&_svg]:h-4 [&_svg]:w-4">{icon}</span> : null}
        <span className="font-medium">{label}</span>
      </span>

      <span
        className={[
          'inline-flex min-w-6 items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
          active
            ? 'border-white/30 bg-white/15 text-white dark:border-zinc-900/20 dark:bg-zinc-900/10 dark:text-zinc-900'
            : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

function RowAction({
  title,
  onClick,
  children,
  disabled,
}: {
  title: string;
  onClick: ((e: ClickEvent) => void) | (() => void);
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick as any}
      disabled={disabled}
      className={[
        'group grid h-9 w-9 place-items-center rounded-lg transition',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : [
              'text-zinc-500 hover:text-zinc-900 active:text-zinc-900',
              'hover:bg-zinc-100 active:bg-zinc-200',
              'dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100',
              'dark:hover:bg-zinc-900/60 dark:active:bg-zinc-900/80',
            ].join(' '),
      ].join(' ')}
    >
      <span className="grid place-items-center [&_svg]:transition [&_svg]:text-current">{children}</span>
    </button>
  );
}

export default function AdminDestinosClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Destino[]>([]);
  const [nome, setNome] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const activeStatus = (searchParams.get('status') as StatusKey | null) ?? 'all';

  async function refresh() {
    setErr(null);
    const r = await fetch('/api/admin/config/destinos', { cache: 'no-store' });
    const j = await r.json().catch(() => null);
    const list = Array.isArray(j?.destinos) ? (j.destinos as Destino[]) : [];
    setItems(list);
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalized = useMemo(() => {
    return items.map((d) => ({ ...d, status: pickStatus(d) }));
  }, [items]);

  const counts = useMemo(() => {
    const base = { total: normalized.length, publicado: 0, pausado: 0, rascunho: 0, arquivado: 0, lixeira: 0 };
    for (const d of normalized) base[d.status as AdminStatus] += 1;
    return base;
  }, [normalized]);

  const filtered = useMemo(() => {
    const byStatus =
      activeStatus === 'all' ? normalized : normalized.filter((d) => (d.status as AdminStatus) === activeStatus);

    const query = q.trim().toLowerCase();
    if (!query) return byStatus;

    return byStatus.filter((d) => {
      const hay = `${d.nome} ${d.slug}`.toLowerCase();
      return hay.includes(query);
    });
  }, [normalized, activeStatus, q]);

  const setStatusParam = (status: StatusKey) => {
    const url = status === 'all' ? pathname : `${pathname}?status=${encodeURIComponent(status)}`;
    router.push(url);
  };

  async function onCreate() {
    const v = nome.trim();
    if (!v) return;

    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/config/destinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: v }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error || 'Erro');
      setNome('');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao criar');
    } finally {
      setLoading(false);
    }
  }

  async function onUpdate(id: string, patch: Partial<Pick<Destino, 'nome' | 'status'>>) {
    setErr(null);
    try {
      const r = await fetch(`/api/admin/config/destinos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error || 'Erro');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao atualizar');
    }
  }

  async function onDeleteForever(id: string) {
    if (!confirm('Excluir definitivamente este destino?')) return;

    setErr(null);
    try {
      const r = await fetch(`/api/admin/config/destinos/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error || 'Erro');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao excluir');
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Destinos</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Listar, buscar e filtrar por status. Itens podem ir para arquivado ou lixeira.
          </p>

          <div className="text-xs text-zinc-500">
            Total: {counts.total} • Publicados: {counts.publicado} • Pausados: {counts.pausado}
          </div>
        </div>

        <Link
          href="/admin/configuracoes"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </div>

            <div className="text-xs text-zinc-500">
              Exibindo: {activeStatus === 'all' ? 'todos' : formatStatusLabel(activeStatus as AdminStatus).toLowerCase()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip
              label="Todos"
              count={counts.total}
              active={activeStatus === 'all'}
              tone="zinc"
              icon={<SlidersHorizontal />}
              onClick={() => setStatusParam('all')}
            />

            <Chip
              label="Publicado"
              count={counts.publicado}
              active={activeStatus === 'publicado'}
              tone="green"
              icon={<CheckCircle2 />}
              onClick={() => setStatusParam('publicado')}
            />

            <Chip
              label="Pausado"
              count={counts.pausado}
              active={activeStatus === 'pausado'}
              tone="amber"
              icon={<PauseCircle />}
              onClick={() => setStatusParam('pausado')}
            />

            <Chip
              label="Rascunho"
              count={counts.rascunho}
              active={activeStatus === 'rascunho'}
              tone="blue"
              icon={<FileText />}
              onClick={() => setStatusParam('rascunho')}
            />

            <Chip
              label="Arquivado"
              count={counts.arquivado}
              active={activeStatus === 'arquivado'}
              tone="red"
              icon={<Archive />}
              onClick={() => setStatusParam('arquivado')}
            />

            <Chip
              label="Lixeira"
              count={counts.lixeira}
              active={activeStatus === 'lixeira'}
              tone="zinc"
              icon={<Trash2 />}
              onClick={() => setStatusParam('lixeira')}
            />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou slug..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* CREATE */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Novo destino</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Rio de Janeiro"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-800"
          />
          <button
            type="button"
            onClick={onCreate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-medium dark:border-zinc-800">
          Lista <span className="text-zinc-500">({filtered.length} itens)</span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-zinc-500">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 font-medium">Destino</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Atualizado</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((d) => (
                <DestinoRow key={d.id} item={d as Destino & { status: AdminStatus }} onUpdate={onUpdate} onDeleteForever={onDeleteForever} />
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                    Nenhum destino encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-xs text-zinc-500">
          <span>
            Mostrando <strong>{filtered.length}</strong> de <strong>{counts.total}</strong>
          </span>
          <span>destinos.</span>
        </div>
      </div>
    </div>
  );
}

function DestinoRow({
  item,
  onUpdate,
  onDeleteForever,
}: {
  item: Destino & { status: AdminStatus };
  onUpdate: (id: string, patch: Partial<Pick<Destino, 'nome' | 'status'>>) => void;
  onDeleteForever: (id: string) => void;
}) {
  const [nome, setNome] = useState(item.nome);

  const status = pickStatus(item);
  const changedName = !!nome.trim() && nome.trim() !== item.nome.trim();

  const canPublish = status === 'rascunho' || status === 'pausado';
  const canPause = status === 'publicado';
  const isArchived = status === 'arquivado';
  const isTrashed = status === 'lixeira';

  const handleSaveName = () => {
    const v = nome.trim();
    if (!v) return;
    onUpdate(item.id, { nome: v });
  };

  const handlePublish = (e: ClickEvent) => {
    safeStop(e);
    onUpdate(item.id, { status: 'publicado' });
  };

  const handlePause = (e: ClickEvent) => {
    safeStop(e);
    onUpdate(item.id, { status: 'pausado' });
  };

  const handleArchive = (e: ClickEvent) => {
    safeStop(e);
    onUpdate(item.id, { status: 'arquivado' });
  };

  const handleRestore = (e: ClickEvent) => {
    safeStop(e);
    onUpdate(item.id, { status: 'rascunho' });
  };

  const handleTrash = (e: ClickEvent) => {
    safeStop(e);
    onUpdate(item.id, { status: 'lixeira' });
  };

  const handleDeleteForever = (e: ClickEvent) => {
    safeStop(e);
    onDeleteForever(item.id);
  };

  return (
    <tr className="align-middle">
      <td className="px-4 py-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-800"
        />
      </td>

      <td className="px-4 py-4">
        <span className="text-zinc-700 dark:text-zinc-200">{item.slug}</span>
      </td>

      <td className="px-4 py-4">
        <TonePill status={status} />
      </td>

      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-200">{formatDateBR(item.atualizadoEm)}</td>

      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <RowAction title="Salvar nome" onClick={handleSaveName} disabled={!changedName || isTrashed}>
            <span className="grid place-items-center">
              <SaveIcon />
            </span>
          </RowAction>

          {!isTrashed && (
            <RowAction title="Enviar para lixeira" onClick={handleTrash}>
              <Trash2 className="h-4 w-4" />
            </RowAction>
          )}

          {!isTrashed && canPublish && (
            <RowAction title="Publicar" onClick={handlePublish}>
              <PlayCircle className="h-4 w-4" />
            </RowAction>
          )}

          {!isTrashed && canPause && (
            <RowAction title="Pausar" onClick={handlePause}>
              <PauseCircle className="h-4 w-4" />
            </RowAction>
          )}

          {isTrashed ? (
            <>
              <RowAction title="Restaurar" onClick={handleRestore}>
                <RotateCcw className="h-4 w-4" />
              </RowAction>

              <RowAction title="Excluir definitivamente" onClick={handleDeleteForever}>
                <Trash2 className="h-4 w-4" />
              </RowAction>
            </>
          ) : isArchived ? (
            <RowAction title="Restaurar" onClick={handleRestore}>
              <RotateCcw className="h-4 w-4" />
            </RowAction>
          ) : (
            <RowAction title="Arquivar" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
            </RowAction>
          )}
        </div>
      </td>
    </tr>
  );
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 3v4h8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
