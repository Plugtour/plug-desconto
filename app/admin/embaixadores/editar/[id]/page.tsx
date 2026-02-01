'use client';

// app/admin/embaixadores/editar/[id]/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { useAdminData } from '../../../_components/AdminDataProvider';
import { useAdminToast } from '../../../_components/AdminToastProvider';

import type { AmbassadorStatus } from '../../../_data/adminMappers';

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

function slugifyCode(value: string) {
  return (value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 10);
}

export default function AdminEmbaixadoresEditarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');

  const { showToast } = useAdminToast();
  const { ambassadors, updateAmbassador } = useAdminData();

  const current = useMemo(() => {
    return ambassadors.find((x) => x.id === id) ?? null;
  }, [ambassadors, id]);

  const [nome, setNome] = useState(current?.nome ?? '');
  const [email, setEmail] = useState(current?.email ?? '');
  const [whatsapp, setWhatsapp] = useState(current?.whatsapp ?? '');
  const [codigo, setCodigo] = useState(current?.codigo ?? '');
  const [imageUrl, setImageUrl] = useState(current?.imageUrl ?? '');
  const [status, setStatus] = useState<AmbassadorStatus>((current?.status ?? 'rascunho') as AmbassadorStatus);

  const canSave = useMemo(() => nome.trim().length >= 2 && email.trim().length >= 3, [nome, email]);

  const onCancel = () => router.push('/admin/embaixadores');

  const onSave = () => {
    if (!current) {
      showToast('Embaixador não encontrado', 'error');
      return;
    }
    if (!canSave) {
      showToast('Preencha nome e email', 'warning');
      return;
    }

    const updated = updateAmbassador({
      id,
      nome: nome.trim(),
      email: email.trim(),
      whatsapp: onlyDigits(whatsapp.trim()),
      codigo: (codigo.trim() ? slugifyCode(codigo) : slugifyCode(nome)) || 'CODIGO',
      imageUrl: imageUrl.trim() || null,
      status,
    });

    if (!updated) {
      showToast('Falha ao atualizar', 'error');
      return;
    }

    showToast(`Atualizado: ${updated.nome}`, 'success');
    router.push('/admin/embaixadores');
    router.refresh();
  };

  if (!current) {
    return (
      <main className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-medium">Embaixador não encontrado</div>
          <div className="mt-2">
            <Link className="text-sm underline" href="/admin/embaixadores">
              Voltar
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/embaixadores"
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
            <h1 className="text-xl font-semibold tracking-tight">Editar embaixador</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ID: {current.id}</p>
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
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
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
          />
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500">Salvo com números: {onlyDigits(whatsapp)}</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Código</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={[
              'h-10 w-full rounded-xl border px-3 text-sm outline-none transition',
              'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700',
            ].join(' ')}
          />
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500">Fica assim: {slugifyCode(codigo || nome) || '—'}</div>
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
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AmbassadorStatus)}
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
