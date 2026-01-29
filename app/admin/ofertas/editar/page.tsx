'use client';

// app/admin/ofertas/editar/page.tsx
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';

import { useAdminData } from '../../_components/AdminDataProvider';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

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

type OfferApi = {
  id: string;
  title: string;
  partnerName: string;
  city: string;
  categoryId: string;
  status: OfferStatus;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  priceText?: string | null;
};

function move<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function AdminEditarOfertaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

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

  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [parceiro, setParceiro] = useState(partners[0] ?? '');
  const [categoriaLabel, setCategoriaLabel] = useState(categories[0]?.label ?? '');
  const [status, setStatus] = useState<OfferStatus>('rascunho');
  const [descricao, setDescricao] = useState('');
  const [regiao, setRegiao] = useState('Serra Gaúcha');

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, { method: 'GET' });
        const data = await res.json().catch(() => ({}));

        if (!alive) return;

        if (!res.ok || !data?.offer) {
          alert(data?.error ? `${data.error}${data?.detail ? `\n${data.detail}` : ''}` : 'Falha ao carregar oferta.');
          setLoading(false);
          return;
        }

        const o: OfferApi = data.offer;

        setTitulo(o.title ?? '');
        setParceiro(o.partnerName ?? (partners[0] ?? ''));
        setStatus((o.status as OfferStatus) ?? 'rascunho');

        const catFound = categories.find((c) => normalizeCategoryId(c.id) === normalizeCategoryId(o.categoryId ?? ''));
        setCategoriaLabel(catFound?.label ?? (categories[0]?.label ?? ''));

        setDescricao((o.description ?? '') as string);
        setRegiao(o.city ? o.city : 'Serra Gaúcha');

        const fromList = Array.isArray(o.imageUrls) ? o.imageUrls.filter(Boolean) : [];
        const fromSingle = o.imageUrl ? [String(o.imageUrl)] : [];
        const merged = (fromList.length ? fromList : fromSingle).map((x) => String(x)).filter(Boolean);

        setImageUrls(merged);
        setPriceText((o.priceText ?? '') as string);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        alert(`Falha ao carregar.\n${msg}`);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [id, categories, partners]);

  const canSave = titulo.trim().length >= 4;

  const onSave = async () => {
    if (!id || !canSave || saving) return;

    setSaving(true);
    try {
      const selectedCategory = categories.find((c) => c.label === categoriaLabel) ?? categories[0];

      const cleanImageUrls = imageUrls.map((u) => String(u).trim()).filter(Boolean);

      const payload = {
        title: titulo.trim(),
        partnerName: parceiro.trim(),
        city: normalizeCity(regiao),
        categoryId: normalizeCategoryId(selectedCategory?.id ?? ''),
        status,
        description: descricao.trim() ? descricao.trim() : null,
        priceText: priceText.trim() ? priceText.trim() : null,

        // novas
        imageUrls: cleanImageUrls,

        // compat (principal)
        imageUrl: cleanImageUrls[0] ? cleanImageUrls[0] : null,
      };

      const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, {
        method: 'PUT',
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
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Falha ao salvar.\n${msg}`);
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

          <h1 className="text-2xl font-semibold tracking-tight">Editar oferta</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{id ? `ID: ${id}` : 'Nenhum ID informado.'}</p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!id || !canSave || saving || loading}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
            !loading && id && canSave && !saving
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

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950">
          Carregando...
        </div>
      ) : !id ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950">
          Abra a página com <span className="font-medium">?id=SEU_ID</span>.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className={card}>
              <label className={label}>Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputBase} />
              <p className={help}>Mínimo: 4 caracteres.</p>
            </div>

            <div className={card}>
              <label className={label}>Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={6}
                className={[inputBase, 'resize-none'].join(' ')}
              />
              <p className={help}>Opcional.</p>
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

                  const res = await fetch('/api/admin/upload/offer-image', {
                    method: 'POST',
                    body: form,
                  });

                  const data = await res.json().catch(() => ({}));

                  if (!res.ok || !Array.isArray(data?.urls)) {
                    alert(data?.error ? String(data.error) : 'Erro ao subir imagens');
                    return;
                  }

                  const newOnes = data.urls.map((u: any) => String(u)).filter(Boolean);
                  if (!newOnes.length) return;

                  setImageUrls((prev) => {
                    const set = new Set<string>([...prev, ...newOnes]);
                    return Array.from(set);
                  });

                  e.currentTarget.value = '';
                }}
              />

              {imageUrls.length ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imageUrls.map((url, idx) => {
                    const isMain = idx === 0;
                    return (
                      <div
                        key={url}
                        className={[
                          'relative overflow-hidden rounded-lg border',
                          'border-zinc-200 bg-zinc-50',
                          'dark:border-zinc-900 dark:bg-zinc-900/30',
                        ].join(' ')}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === idx) return;
                          setImageUrls((prev) => move(prev, dragIndex, idx));
                          setDragIndex(null);
                        }}
                        title="Arraste para reordenar"
                      >
                        {isMain ? (
                          <div className="absolute left-2 top-2 z-10 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
                            Principal
                          </div>
                        ) : (
                          <div className="absolute left-2 top-2 z-10 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                            #{idx + 1}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white hover:bg-black/80"
                          title="Remover"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Imagem ${idx + 1}`} className="block h-28 w-full object-cover" />

                        {!isMain ? (
                          <button
                            type="button"
                            onClick={() => setImageUrls((prev) => move(prev, idx, 0))}
                            className="w-full border-t border-zinc-200 bg-white px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            title="Definir como principal"
                          >
                            Definir como principal
                          </button>
                        ) : (
                          <div className="w-full border-t border-zinc-200 bg-white px-2 py-2 text-xs text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
                            Arraste para reordenar
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <p className={help}>PNG/JPEG são convertidas para WebP. WebP é mantido.</p>
            </div>

            <div className={card}>
              <label className={label}>Preço (texto)</label>
              <input value={priceText} onChange={(e) => setPriceText(e.target.value)} className={inputBase} />
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
              <input value={regiao} onChange={(e) => setRegiao(e.target.value)} className={inputBase} />
              <p className={help}>
                Será salvo como:{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{normalizeCity(regiao)}</span>
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}