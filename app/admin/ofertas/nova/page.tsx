'use client';

// app/admin/ofertas/nova/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAdminData } from '../../_components/AdminDataProvider';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

function normalizeCity(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeCategoryId(value: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export default function AdminNovaOfertaPage() {
  const router = useRouter();
  const { refreshOffers } = useAdminData();

  const categories = useMemo(
    () => [
      { label: 'Gastronomia', id: 'gastronomia' },
      { label: 'Atrações', id: 'atracoes' },
      { label: 'Passeios', id: 'passeios' },
      { label: 'Hospedagem', id: 'hospedagem' },
      { label: 'Transporte', id: 'transporte' },
      { label: 'Compras', id: 'compras' },
      { label: 'Serviços', id: 'servicos' },
    ],
    []
  );

  const partners = useMemo(
    () => ['Cantina Bella', 'Dreamland', 'Gramado Tour', 'Bistrô do Centro', 'Serra Trips', 'Café da Colina'],
    []
  );

  const [titulo, setTitulo] = useState('');
  const [parceiro, setParceiro] = useState(partners[0] ?? '');
  const [categoriaLabel, setCategoriaLabel] = useState(categories[0]?.label ?? '');
  const [status, setStatus] = useState<OfferStatus>('rascunho');
  const [descricao, setDescricao] = useState('');
  const [regiao, setRegiao] = useState('Serra Gaúcha');

  const [imageUrl, setImageUrl] = useState('');
  const [priceText, setPriceText] = useState('');

  const [saving, setSaving] = useState(false);

  const canSave = titulo.trim().length >= 4 && descricao.trim().length >= 10;

  const onSave = async () => {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const selectedCategory = categories.find((c) => c.label === categoriaLabel) ?? categories[0];

      const payload = {
        title: titulo.trim(),
        partnerName: parceiro.trim(),
        city: normalizeCity(regiao),
        categoryId: normalizeCategoryId(selectedCategory?.id ?? ''),
        status,
        description: descricao.trim(),
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
        priceText: priceText.trim() ? priceText.trim() : null,
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(
          data?.error ? `${data.error}${data?.detail ? `\n${data.detail}` : ''}` : 'Falha ao salvar.'
        );
        return;
      }

      await refreshOffers();
      router.push('/admin/ofertas');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert(`Falha ao salvar.\n${message}`);
    } finally {
      setSaving(false);
    }
  };

  const card = [
    'rounded-xl border p-4',
    'border-zinc-200 bg-white',
    'dark:border-zinc-900 dark:bg-zinc-950',
  ].join(' ');

  const label = 'block text-sm text-zinc-700 dark:text-zinc-300';

  const inputBase = [
    'mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none',
    'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400',
    'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700',
  ].join(' ');

  const help = 'mt-2 text-xs text-zinc-500';

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/ofertas"
              className={[
                'inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition',
                'text-zinc-700 hover:bg-zinc-100',
                'dark:text-zinc-300 dark:hover:bg-zinc-900',
              ].join(' ')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Nova oferta</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Cadastro real no Supabase via Prisma.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            canSave && !saving
              ? [
                  'bg-zinc-900 text-white hover:bg-zinc-800',
                  'dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white',
                ].join(' ')
              : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
          ].join(' ')}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className={card}>
            <label className={label}>Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: 10% off em fondue na Serra"
              className={inputBase}
            />
            <p className={help}>Mínimo: 4 caracteres.</p>
          </div>

          <div className={card}>
            <label className={label}>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Escreva uma descrição clara do benefício..."
              rows={6}
              className={[inputBase, 'resize-none'].join(' ')}
            />
            <p className={help}>Mínimo: 10 caracteres.</p>
          </div>

          <div className={card}>
            <label className={label}>Imagens da oferta</label>

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className={inputBase}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                const form = new FormData();
                Array.from(files).forEach((file) => {
                  form.append('files', file);
                });

                const res = await fetch('/api/admin/upload/offer-image', {
                  method: 'POST',
                  body: form,
                });

                const data = await res.json();

                if (!res.ok || !data.urls) {
                  alert('Erro ao subir imagens');
                  return;
                }

                setImageUrl(data.urls[0]);
              }}
            />

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-3 max-h-40 rounded-lg border"
              />
            )}

            <p className={help}>
              PNG/JPEG são convertidas para WebP. WebP é mantido.
            </p>
          </div>

          <div className={card}>
            <label className={label}>Preço (texto)</label>
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder='Ex: "R$ 125,00" ou "10% off"'
              className={inputBase}
            />
            <p className={help}>Opcional.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={card}>
            <label className={label}>Parceiro</label>
            <select value={parceiro} onChange={(e) => setParceiro(e.target.value)} className={inputBase}>
              {partners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className={card}>
            <label className={label}>Categoria</label>
            <select
              value={categoriaLabel}
              onChange={(e) => setCategoriaLabel(e.target.value)}
              className={inputBase}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>

            <p className={help}>
              Será salvo como:{' '}
              <span className="font-medium text-zinc-900 dark:text-zinc-200">
                {normalizeCategoryId(categories.find((c) => c.label === categoriaLabel)?.id ?? '')}
              </span>
            </p>
          </div>

          <div className={card}>
            <label className={label}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as OfferStatus)} className={inputBase}>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="pausado">Pausado</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <p className={help}>Para remover do ar, use “Pausado” ou “Arquivado”.</p>
          </div>

          <div className={card}>
            <label className={label}>Região (cidade no banco)</label>
            <input
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              placeholder="Ex: Serra Gaúcha"
              className={inputBase}
            />
            <p className={help}>
              Será salvo como:{' '}
              <span className="font-medium text-zinc-900 dark:text-zinc-200">{normalizeCity(regiao)}</span>
            </p>
          </div>

          <div
            className={[
              'rounded-xl border border-dashed p-4 text-xs',
              'border-zinc-300 bg-white text-zinc-500',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500',
            ].join(' ')}
          >
            Próximo: listar ofertas no admin, editar e deletar (ou arquivar).
          </div>
        </div>
      </section>
    </main>
  );
}
