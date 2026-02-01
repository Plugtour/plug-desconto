'use client';

// app/admin/franquiados/novo/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAdminData } from '../../_components/AdminDataProvider';
import { useAdminToast } from '../../_components/AdminToastProvider';

import type { FranchiseeStatus } from '../../_data/adminMappers';

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

export default function AdminFranquiadosNovoPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const { createFranchisee } = useAdminData();

  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<FranchiseeStatus>('rascunho');

  const canSave = useMemo(() => nome.trim().length >= 2 && cidade.trim().length >= 2, [nome, cidade]);

  const onCancel = () => router.push('/admin/franquiados');

  const onSave = () => {
    if (!canSave) {
      showToast('Preencha nome e cidade', 'warning');
      return;
    }

    const created = createFranchisee({
      nome: nome.trim(),
      cidade: cidade.trim(),
      whatsapp: onlyDigits(whatsapp.trim()),
      imageUrl: imageUrl.trim() || null,
      status,
    });

    showToast(`Criado: ${created.nome}`, 'success');
    router.push('/admin/franquiados');
    router.refresh();
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/franquiados"
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition',
              'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/50',
            ].join(' ')}
            title="Voltar"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">Novo franquiado</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cadastro rápido com status.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={[
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
              'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
            ].join(' ')}
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              canSave
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                : 'cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
            ].join(' ')}
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
            placeholder="Ex: Unidade Gramado"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Cidade</label>
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
            placeholder="Ex: Gramado"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">WhatsApp</label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
            placeholder="(DDD) 9xxxx-xxxx"
          />
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500">Salvo com números: {onlyDigits(whatsapp)}</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Imagem (URL)</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FranchiseeStatus)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700',
            ].join(' ')}
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="pausado">Pausado</option>
            <option value="arquivado">Arquivado</option>
            <option value="lixeira">Lixeira</option>
          </select>
        </div>
      </div>
    </main>
  );
}
