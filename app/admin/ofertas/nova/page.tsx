'use client';

// app/admin/ofertas/nova/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save, X, GripVertical } from 'lucide-react';
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

function StatusModal({
  open,
  value,
  onChange,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  value: OfferStatus;
  onChange: (v: OfferStatus) => void;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;

  const overlay = [
    'fixed inset-0 z-[80] bg-black/40 backdrop-blur-[1px]',
    'flex items-center justify-center p-4',
  ].join(' ');

  const card = [
    'w-full max-w-[520px] rounded-2xl border p-4 shadow-xl',
    'border-zinc-200 bg-white text-zinc-900',
    'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100',
  ].join(' ');

  const radioWrap = [
    'mt-3 space-y-2 rounded-xl border p-3',
    'border-zinc-200 bg-zinc-50',
    'dark:border-zinc-800 dark:bg-zinc-900/30',
  ].join(' ');

  const radioRow = [
    'flex items-center gap-3 rounded-lg px-2 py-2 transition',
    'hover:bg-white/60 dark:hover:bg-zinc-900/60',
  ].join(' ');

  const pill = (s: OfferStatus) =>
    [
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
      s === 'publicado'
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        : s === 'rascunho'
        ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
        : s === 'pausado'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    ].join(' ');

  return (
    <div className={overlay} role="dialog" aria-modal="true">
      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Escolha o status para salvar</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Você escolhe agora, confirma e salvamos no status selecionado.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className={[
              'grid h-9 w-9 place-items-center rounded-lg border transition',
              'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900/60',
            ].join(' ')}
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={radioWrap}>
          {([
            { key: 'rascunho', label: 'Rascunho', hint: 'Não aparece no site.' },
            { key: 'publicado', label: 'Publicado', hint: 'Aparece no site.' },
            { key: 'pausado', label: 'Pausado', hint: 'Sai do ar temporariamente.' },
            { key: 'arquivado', label: 'Arquivado', hint: 'Arquivado/encerrado.' },
          ] as const).map((it) => (
            <label key={it.key} className={radioRow}>
              <input
                type="radio"
                name="statusToSave"
                checked={value === it.key}
                onChange={() => onChange(it.key)}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{it.label}</span>
                  <span className={pill(it.key)}>{it.key}</span>
                </div>
                <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{it.hint}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={!!busy}
            className={[
              'rounded-lg border px-3 py-2 text-sm transition',
              'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
              busy ? 'opacity-60' : '',
            ].join(' ')}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!!busy}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              'bg-zinc-900 text-white hover:bg-zinc-800',
              'dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white',
              busy ? 'opacity-60' : '',
            ].join(' ')}
          >
            <Save className="h-4 w-4" />
            {busy ? 'Salvando...' : 'Confirmar e salvar'}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [descricao, setDescricao] = useState('');
  const [regiao, setRegiao] = useState('Serra Gaúcha');

  // ✅ múltiplas imagens + ordem
  const [images, setImages] = useState<string[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ status escolhido somente ao salvar (modal)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusToSave, setStatusToSave] = useState<OfferStatus>('rascunho');

  const canSave = titulo.trim().length >= 4 && descricao.trim().length >= 10;

  const removeImageAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    setImages((prev) => {
      const copy = [...prev];
      const item = copy[from];
      copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const doSave = async (status: OfferStatus) => {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const selectedCategory = categories.find((c) => c.label === categoriaLabel) ?? categories[0];

      // ✅ garante limpeza (sem strings vazias)
      const cleanImageUrls = images.map((u) => String(u).trim()).filter(Boolean);

      const payload: any = {
        title: titulo.trim(),
        partnerName: parceiro.trim(),
        city: normalizeCity(regiao),
        categoryId: normalizeCategoryId(selectedCategory?.id ?? ''),
        status,
        description: descricao.trim(),

        // ✅ PRINCIPAL (compat)
        imageUrl: cleanImageUrls[0] ? cleanImageUrls[0] : null,

        // ✅ O CAMPO CORRETO QUE O BACKEND SALVA:
        imageUrls: cleanImageUrls,

        priceText: priceText.trim() ? priceText.trim() : null,
      };

      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error ? `${data.error}${data?.detail ? `\n${data.detail}` : ''}` : 'Falha ao salvar.');
        return;
      }

      await refreshOffers();
      router.push('/admin/ofertas');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert(`Falha ao salvar.\n${message}`);
    } finally {
      setSaving(false);
      setStatusModalOpen(false);
    }
  };

  const onClickSave = () => {
    if (!canSave || saving) return;
    setStatusModalOpen(true);
  };

  const card = ['rounded-xl border p-4', 'border-zinc-200 bg-white', 'dark:border-zinc-900 dark:bg-zinc-950'].join(
    ' '
  );

  const label = 'block text-sm text-zinc-700 dark:text-zinc-300';

  const inputBase = [
    'mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none',
    'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400',
    'dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700',
  ].join(' ');

  const help = 'mt-2 text-xs text-zinc-500';

  const thumbsWrap = [
    'mt-3 flex items-stretch gap-3 overflow-x-auto pb-2',
    '[&::-webkit-scrollbar]:h-2',
    '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/70',
    'dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/60',
  ].join(' ');

  const thumbCard = (isPrimary: boolean, isDragging: boolean) =>
    [
      'relative flex-none overflow-hidden rounded-xl border',
      'h-[96px] w-[160px]',
      'border-zinc-200 bg-zinc-100',
      'dark:border-zinc-800 dark:bg-zinc-900/50',
      isPrimary ? 'ring-2 ring-zinc-900 dark:ring-zinc-100' : '',
      isDragging ? 'opacity-70' : '',
    ].join(' ');

  return (
    <main className="space-y-4">
      <StatusModal
        open={statusModalOpen}
        value={statusToSave}
        onChange={setStatusToSave}
        onCancel={() => setStatusModalOpen(false)}
        onConfirm={() => doSave(statusToSave)}
        busy={saving}
      />

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
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cadastro real no Supabase via Prisma.</p>
        </div>

        <button
          type="button"
          onClick={onClickSave}
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
                Array.from(files).forEach((file) => form.append('files', file));

                const res = await fetch('/api/admin/upload/offer-image', { method: 'POST', body: form });
                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data?.urls || !Array.isArray(data.urls)) {
                  alert('Erro ao subir imagens');
                  return;
                }

                const urls = data.urls.filter((u: any) => typeof u === 'string' && u.trim().length > 0);
                if (!urls.length) return;

                setImages((prev) => {
                  const set = new Set(prev);
                  for (const u of urls) set.add(u);
                  return Array.from(set);
                });

                e.currentTarget.value = '';
              }}
            />

            {images.length > 0 ? (
              <>
                <div className={thumbsWrap}>
                  {images.map((src, idx) => {
                    const isPrimary = idx === 0;
                    const isDragging = dragFrom === idx;

                    return (
                      <div
                        key={`${src}-${idx}`}
                        className={thumbCard(isPrimary, isDragging)}
                        draggable
                        onDragStart={() => setDragFrom(idx)}
                        onDragEnd={() => setDragFrom(null)}
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={() => {
                          if (dragFrom === null) return;
                          moveImage(dragFrom, idx);
                          setDragFrom(null);
                        }}
                        title={isPrimary ? 'Imagem principal (1ª)' : 'Arraste para ordenar'}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Imagem ${idx + 1}`} className="h-full w-full object-cover" />

                        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white">
                          <GripVertical className="h-3.5 w-3.5" />
                          {isPrimary ? 'Principal' : `#${idx + 1}`}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-black/55 text-white hover:bg-black/70"
                          title="Remover"
                          aria-label="Remover"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className={help}>
                  Arraste e solte para ordenar. A <span className="font-medium">1ª imagem</span> será a principal.
                </p>
              </>
            ) : (
              <p className={help}>Envie 1 ou mais imagens. Depois você pode ordenar arrastando.</p>
            )}

            <p className={help}>PNG/JPEG são convertidas para WebP. WebP é mantido.</p>
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
            <select value={categoriaLabel} onChange={(e) => setCategoriaLabel(e.target.value)} className={inputBase}>
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
            <div className="mt-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
              Agora o status é escolhido ao clicar em <span className="font-medium">Salvar</span>.
            </div>
            <p className={help}>Você confirma o status no modal antes de salvar.</p>
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
            Próximo: usar imageUrls[] no site/app.
          </div>
        </div>
      </section>
    </main>
  );
}
