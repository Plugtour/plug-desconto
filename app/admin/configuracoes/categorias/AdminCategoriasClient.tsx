'use client';

// app/admin/configuracoes/categorias/AdminCategoriasClient.tsx
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';

type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export default function AdminCategoriasClient() {
  const [items, setItems] = useState<Categoria[]>([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ativos = useMemo(() => items.filter((i) => i.ativo).length, [items]);

  async function refresh() {
    setErr(null);
    const r = await fetch('/api/admin/config/categorias', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.categorias || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate() {
    const v = nome.trim();
    if (!v) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/config/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: v }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Erro');
      setNome('');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao criar');
    } finally {
      setLoading(false);
    }
  }

  async function onUpdate(id: string, patch: Partial<Pick<Categoria, 'nome' | 'ativo'>>) {
    setErr(null);
    try {
      const r = await fetch(`/api/admin/config/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Erro');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao atualizar');
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Excluir categoria?')) return;
    setErr(null);
    try {
      const r = await fetch(`/api/admin/config/categorias/${id}`, { method: 'DELETE' });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Erro');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro ao excluir');
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Cadastre categorias. Elas serão usadas nos formulários e no site.
          </p>
          <div className="text-xs text-zinc-500">
            Total: {items.length} • Ativos: {ativos}
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

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Nova categoria</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Gastronomia"
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

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-medium dark:border-zinc-800">Lista</div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((c) => (
            <Row key={c.id} item={c} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
          {items.length === 0 && <div className="px-4 py-6 text-sm text-zinc-500">Nenhuma categoria cadastrada.</div>}
        </div>
      </div>
    </div>
  );
}

function Row({
  item,
  onUpdate,
  onDelete,
}: {
  item: Categoria;
  onUpdate: (id: string, patch: Partial<Pick<Categoria, 'nome' | 'ativo'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [nome, setNome] = useState(item.nome);
  const changed = nome.trim() !== item.nome;

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-zinc-500">Slug: {item.slug}</div>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-800"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdate(item.id, { ativo: !item.ativo })}
          className={[
            'rounded-xl px-3 py-2 text-sm border transition',
            item.ativo
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900',
          ].join(' ')}
          title={item.ativo ? 'Desativar' : 'Ativar'}
        >
          {item.ativo ? 'Ativo' : 'Inativo'}
        </button>

        <button
          type="button"
          disabled={!changed}
          onClick={() => onUpdate(item.id, { nome })}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Save className="h-4 w-4" />
          Salvar
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </button>
      </div>
    </div>
  );
}
