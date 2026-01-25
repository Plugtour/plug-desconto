'use client';

// app/admin/ofertas/nova/page.tsx
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAdminData } from '../../_components/AdminDataProvider';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

function normalizeCity(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

  // opcionais
  const [imageUrl, setImageUrl] = useState('');
  const [priceText, setPriceText] = useState('');

  const [saving, setSaving] = useState(false);

  const canSave = titulo.trim().length >= 4 && descricao.trim().length >= 10;

  const onSave = async () => {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const selectedCategory =
        categories.find((c) => c.label === categoriaLabel) ?? categories[0];

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
          data?.error
            ? `${data.error}${data?.detail ? `\n${data.detail}` : ''}`
            : 'Falha ao salvar.'
        );
        return;
      }

      // 1) Atualiza o provider antes de voltar (isso evita precisar de F5)
      await refreshOffers();

      // 2) Volta para a listagem
      router.push('/admin/ofertas');

      // opcional: se quiser, pode remover o alert
      // alert(`Oferta criada!\nSlug: ${data?.offer?.slug ?? '(sem slug)'}`);
    } catch (e: any) {
      alert(`Falha ao salvar.\n${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2">
            <Link
              href="/admin/ofertas"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Nova oferta</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Cadastro real no Supabase via Prisma.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
            canSave && !saving
              ? 'bg-zinc-100 text-zinc-950 hover:bg-white'
              : 'bg-zinc-800 text-zinc-400',
          ].join(' ')}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Coluna principal */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: 10% off em fondue na Serra"
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-500">Mínimo: 4 caracteres.</p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Escreva uma descrição clara do benefício..."
              rows={6}
              className="mt-2 w-full resize-none rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-500">Mínimo: 10 caracteres.</p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Imagem (URL)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-500">Opcional.</p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Preço (texto)</label>
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder='Ex: "R$ 125,00" ou "10% off"'
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-500">Opcional.</p>
          </div>
        </div>

        {/* Lateral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Parceiro</label>
            <select
              value={parceiro}
              onChange={(e) => setParceiro(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
            >
              {partners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Categoria</label>
            <select
              value={categoriaLabel}
              onChange={(e) => setCategoriaLabel(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-zinc-500">
              Será salvo como:{' '}
              <span className="text-zinc-300">
                {normalizeCategoryId(
                  categories.find((c) => c.label === categoriaLabel)?.id ?? ''
                )}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OfferStatus)}
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
            >
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="pausado">Pausado</option>
              <option value="arquivado">Arquivado</option>
            </select>

            <p className="mt-2 text-xs text-zinc-500">
              Para remover do ar, use “Pausado” ou “Arquivado”.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <label className="block text-sm text-zinc-300">Região (cidade no banco)</label>
            <input
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              placeholder="Ex: Serra Gaúcha"
              className="mt-2 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Será salvo como:{' '}
              <span className="text-zinc-300">{normalizeCity(regiao)}</span>
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-500">
            Próximo: listar ofertas no admin, editar e deletar (ou arquivar).
          </div>
        </div>
      </section>
    </main>
  );
}
