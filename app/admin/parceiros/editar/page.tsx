'use client';

// app/admin/parceiros/editar/page.tsx
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

import { useAdminData } from '../../_components/AdminDataProvider';

type PartnerStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

export default function AdminEditarParceiroPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = (sp.get('id') || '').trim();

  // ⚠️ precisa existir no AdminDataProvider: updatePartner(...)
  const { partners, updatePartner } = useAdminData();

  const partner = useMemo(() => partners.find((p) => p.id === id) || null, [partners, id]);

  const categories = useMemo(
    () => ['Gastronomia', 'Atrações', 'Passeios', 'Hospedagem', 'Transporte', 'Compras', 'Serviços'],
    []
  );

  const cities = useMemo(() => ['Gramado', 'Canela', 'Nova Petrópolis', 'São Francisco de Paula'], []);

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState(categories[0] ?? '');
  const [cidade, setCidade] = useState(cities[0] ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const imageUrl = images[0] ?? '';

  const [status, setStatus] = useState<PartnerStatus>('rascunho');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!partner) return;

    setNome(partner.nome || '');
    setCategoria(partner.categoria || (categories[0] ?? ''));
    setCidade(partner.cidade || (cities[0] ?? ''));
    setWhatsapp(partner.whatsapp || '');
    setInstagram((partner as any)?.instagram || '');

    const initialImages =
      (Array.isArray((partner as any)?.images) && (partner as any).images.length
        ? (partner as any).images
        : null) || (partner.imageUrl ? [partner.imageUrl] : []);

    setImages(
      (initialImages || [])
        .filter((x: any) => typeof x === 'string' && x.trim().length > 0)
        .map((x: string) => x.trim())
    );

    setStatus((partner.status as PartnerStatus) || 'rascunho');
    setObservacoes(((partner as any)?.observacoes as string) || '');
  }, [partner, categories, cities]);

  const canSave = !!id && nome.trim().length >= 3 && onlyDigits(whatsapp).length >= 10;

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);

    try {
      updatePartner({
        id,
        nome: nome.trim(),
        categoria,
        cidade,
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() || null,
        imageUrl: imageUrl.trim() || null,
        images: images.length ? images : null,
        status,
        observacoes: observacoes.trim() || null,
      });

      router.push('/admin/parceiros');

      // ✅ garante refresh já na rota da listagem
      setTimeout(() => {
        router.refresh();
      }, 50);
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

  if (!id) {
    return (
      <main className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-200">
          ID não informado. Volte e tente novamente.
        </div>
        <Link
          href="/admin/parceiros"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </main>
    );
  }

  if (!partner) {
    return (
      <main className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-200">
          Parceiro não encontrado: <span className="font-mono">{id}</span>
        </div>
        <Link
          href="/admin/parceiros"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/parceiros"
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

          <h1 className="text-2xl font-semibold tracking-tight">Editar parceiro</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            ID: <span className="font-mono">{id}</span>
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
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className={card}>
            <label className={label}>Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Cantina Bella" className={inputBase} />
            <p className={help}>Mínimo: 3 caracteres.</p>
          </div>

          <div className={card}>
            <label className={label}>WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: (54) 99999-0000" className={inputBase} />
            <p className={help}>Obrigatório.</p>
          </div>

          <div className={card}>
            <label className={label}>Instagram (opcional)</label>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Ex: @cantinabella" className={inputBase} />
          </div>

          <div className={card}>
            <label className={label}>Imagens do parceiro</label>

            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className={inputBase}
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                setUploading(true);
                try {
                  const form = new FormData();
                  Array.from(files).forEach((file) => form.append('files', file));

                  const res = await fetch('/api/admin/upload/partner-image', { method: 'POST', body: form });
                  const data = await res.json().catch(() => ({}));

                  if (!res.ok || !Array.isArray(data?.urls)) {
                    alert(data?.error ? String(data.error) : 'Erro ao subir imagens');
                    return;
                  }

                  setImages((prev) => {
                    const next = [...prev];
                    for (const u of data.urls as string[]) if (!next.includes(u)) next.push(u);
                    return next;
                  });

                  e.currentTarget.value = '';
                } finally {
                  setUploading(false);
                }
              }}
            />

            {uploading && <p className="mt-2 text-xs text-zinc-500">Enviando imagens...</p>}

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((u) => (
                  <button
                    key={u}
                    type="button"
                    className={['group relative overflow-hidden rounded-lg border', 'border-zinc-200 bg-white', 'dark:border-zinc-900 dark:bg-zinc-950'].join(' ')}
                    title="Clique para remover"
                    onClick={() => setImages((prev) => prev.filter((x) => x !== u))}
                  >
                    <img src={u} alt="Preview" className="h-20 w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 bg-black/35 opacity-0 transition group-hover:opacity-100" />
                    <div className="pointer-events-none absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                      Remover
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className={help}>PNG/JPEG são convertidas para WebP. WebP é mantido. Clique na miniatura para remover.</p>
          </div>

          <div className={card}>
            <label className={label}>Notas internas</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: regras de repasse, contrato, contato responsável..."
              rows={5}
              className={[inputBase, 'resize-none'].join(' ')}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className={card}>
            <label className={label}>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputBase}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={card}>
            <label className={label}>Cidade</label>
            <select value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputBase}>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={card}>
            <label className={label}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as PartnerStatus)} className={inputBase}>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="pausado">Pausado</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <p className={help}>Para remover do ar, use “Pausado” ou “Arquivado”.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
