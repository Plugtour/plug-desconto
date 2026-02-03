'use client';

// app/admin/ofertas/editar/AdminEditarOfertaClient.tsx
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, X, GripVertical } from 'lucide-react';

import { useAdminData } from '../../_components/AdminDataProvider';
import type { AdminPartnerRow } from '../../_data/adminMappers';

type OfferStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

type AdminDestino = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type AdminCategoria = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

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
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function safeGetJSON(url: string) {
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ? String(data.error) : `GET ${url} falhou`);
  return data;
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

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(String(url || '').trim());
}

/**
 * Normaliza URL de imagem para o padrão atual do site:
 * - mantém remotas (http/https)
 * - remove -w### antes da extensão
 * - converte /uploads/offers/... -> /offers/...
 * - garante que comece com "/"
 */
function normalizeImgUrl(raw: any) {
  const s0 = typeof raw === 'string' ? raw.trim() : '';
  if (!s0) return '';

  if (isRemoteUrl(s0)) return s0;

  const [pathPart, queryPart] = s0.split('?');
  let p = String(pathPart || '').trim();
  if (!p) return '';

  p = p.replace(/\\/g, '/');

  // remove -w### antes da extensão (ex: foto-w256.webp -> foto.webp)
  p = p.replace(/-w\d+(?=\.(webp|jpg|jpeg|png|avif)$)/i, '');

  // converte legado -> novo padrão
  p = p.replace(/^\/?uploads\/offers\//i, 'offers/');

  // se vier "offers/xxx.webp" vira "/offers/xxx.webp"
  if (!p.startsWith('/')) p = `/${p}`;

  // garantia final (caso tenha virado "/offers/..." ok)
  // nada extra aqui

  return queryPart ? `${p}?${queryPart}` : p;
}

function dedupeKeepOrder(list: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of list) {
    const v = String(x || '').trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export default function AdminEditarOfertaClient() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';

  const { refreshOffers, partners } = useAdminData();

  const partnerOptions = useMemo(() => {
    const list = (partners as AdminPartnerRow[])
      .filter((p) => p && p.status !== 'lixeira')
      .map((p) => String(p.nome || '').trim())
      .filter(Boolean);

    const uniq = Array.from(new Set(list));
    uniq.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return uniq;
  }, [partners]);

  const [categorias, setCategorias] = useState<AdminCategoria[]>([]);
  const [destinos, setDestinos] = useState<AdminDestino[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [parceiro, setParceiro] = useState('');

  const [categoriaSlug, setCategoriaSlug] = useState('');
  const [destinoSlug, setDestinoSlug] = useState('');

  const [status, setStatus] = useState<OfferStatus>('rascunho');
  const [descricao, setDescricao] = useState('');

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);

  // garante que a oferta “manda” nos selects (evita voltar pro valor antigo)
  const [offerLoaded, setOfferLoaded] = useState(false);

  useEffect(() => {
    setParceiro((prev) => prev || partnerOptions[0] || '');
  }, [partnerOptions]);

  // carregar categorias e destinos
  useEffect(() => {
    let alive = true;

    async function loadConfig() {
      setLoadingConfig(true);
      try {
        const [catsRaw, destRaw] = await Promise.all([
          safeGetJSON('/api/admin/config/categorias'),
          safeGetJSON('/api/admin/config/destinos'),
        ]);

        const cats: AdminCategoria[] = Array.isArray(catsRaw)
          ? catsRaw
          : Array.isArray(catsRaw?.categorias)
            ? catsRaw.categorias
            : Array.isArray(catsRaw?.items)
              ? catsRaw.items
              : [];

        const dests: AdminDestino[] = Array.isArray(destRaw)
          ? destRaw
          : Array.isArray(destRaw?.destinos)
            ? destRaw.destinos
            : Array.isArray(destRaw?.items)
              ? destRaw.items
              : [];

        const catsAtivos = cats.filter((c) => c && c.ativo !== false);
        const destsAtivos = dests.filter((d) => d && d.ativo !== false);

        catsAtivos.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
        destsAtivos.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

        if (!alive) return;

        setCategorias(catsAtivos);
        setDestinos(destsAtivos);
      } catch {
        // silêncio
      } finally {
        if (alive) setLoadingConfig(false);
      }
    }

    loadConfig();
    return () => {
      alive = false;
    };
  }, []);

  // carregar oferta
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/admin/offers/${encodeURIComponent(id)}`, { method: 'GET', cache: 'no-store' });
        const data = await res.json().catch(() => ({}));

        if (!alive) return;

        if (!res.ok || !data?.offer) {
          alert(data?.error ? `${data.error}${data?.detail ? `\n${data.detail}` : ''}` : 'Falha ao carregar oferta.');
          setLoading(false);
          return;
        }

        const o: OfferApi = data.offer;

        setTitulo(o.title ?? '');
        setParceiro(o.partnerName ?? '');

        setStatus((o.status as OfferStatus) ?? 'rascunho');
        setDescricao((o.description ?? '') as string);

        setDestinoSlug(normalizeCity(o.city ?? ''));
        setCategoriaSlug(normalizeCategoryId(o.categoryId ?? ''));

        const fromList = Array.isArray(o.imageUrls) ? o.imageUrls.filter(Boolean) : [];
        const fromSingle = o.imageUrl ? [String(o.imageUrl)] : [];
        const merged = (fromList.length ? fromList : fromSingle)
          .map((x) => normalizeImgUrl(x))
          .filter(Boolean);

        setImageUrls(dedupeKeepOrder(merged));
        setPriceText((o.priceText ?? '') as string);

        setOfferLoaded(true);
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
  }, [id]);

  // defaults APENAS se: config carregou e AINDA não carregou oferta
  useEffect(() => {
    if (loadingConfig) return;
    if (offerLoaded) return;

    setCategoriaSlug((prev) => prev || (categorias[0]?.slug ?? ''));
    setDestinoSlug((prev) => prev || (destinos[0]?.slug ?? ''));
  }, [loadingConfig, categorias, destinos, offerLoaded]);

  const canSave = titulo.trim().length >= 4 && !!parceiro.trim() && !!categoriaSlug && !!destinoSlug;

  const removeImageAt = (idx: number) => setImageUrls((prev) => prev.filter((_, i) => i !== idx));

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    setImageUrls((prev) => move(prev, from, to));
  };

  const onSave = async () => {
    if (!id || !canSave || saving) return;

    setSaving(true);
    try {
      const cleanImageUrls = dedupeKeepOrder(
        imageUrls
          .map((u) => normalizeImgUrl(u))
          .map((u) => String(u).trim())
          .filter(Boolean)
      );

      const payload = {
        title: titulo.trim(),
        partnerName: parceiro.trim(),
        city: normalizeCity(destinoSlug),
        categoryId: normalizeCategoryId(categoriaSlug),
        status,
        description: descricao.trim() ? descricao.trim() : null,
        priceText: priceText.trim() ? priceText.trim() : null,
        imageUrls: cleanImageUrls,
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

  const card = ['rounded-xl border p-4', 'border-zinc-200 bg-white', 'dark:border-zinc-900 dark:bg-zinc-950'].join(' ');

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
              ? ['bg-zinc-900 text-white hover:bg-zinc-800', 'dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white'].join(
                  ' '
                )
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
          <div className="space-y-4 md:col-span-2">
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

                  const newOnes = data.urls.map((u: any) => normalizeImgUrl(u)).filter(Boolean);
                  if (!newOnes.length) return;

                  setImageUrls((prev) => dedupeKeepOrder([...prev, ...newOnes]));

                  e.currentTarget.value = '';
                }}
              />

              {imageUrls.length ? (
                <>
                  <div className={thumbsWrap}>
                    {imageUrls.map((url, idx) => {
                      const isPrimary = idx === 0;
                      const isDragging = dragFrom === idx;

                      const src0 = normalizeImgUrl(url);

                      return (
                        <div
                          key={`${url}-${idx}`}
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
                          <img src={src0} alt={`Imagem ${idx + 1}`} className="h-full w-full object-cover" />

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

              {partnerOptions.length ? (
                <select value={parceiro} onChange={(e) => setParceiro(e.target.value)} className={inputBase}>
                  {partnerOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    value={parceiro}
                    onChange={(e) => setParceiro(e.target.value)}
                    placeholder="Digite o nome do parceiro"
                    className={inputBase}
                  />
                  <p className={help}>Nenhum parceiro cadastrado no painel ainda.</p>
                </>
              )}
            </div>

            <div className={card}>
              <label className={label}>Categoria</label>
              <select
                value={categoriaSlug}
                onChange={(e) => setCategoriaSlug(e.target.value)}
                className={inputBase}
                disabled={loadingConfig}
              >
                {categorias.length ? (
                  categorias.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.nome}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhuma categoria cadastrada</option>
                )}
              </select>

              <p className={help}>
                Será salvo como:{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{normalizeCategoryId(categoriaSlug)}</span>
              </p>
            </div>

            <div className={card}>
              <label className={label}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as OfferStatus)} className={inputBase}>
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="pausado">Pausado</option>
                <option value="arquivado">Arquivado</option>
                <option value="lixeira">Lixeira</option>
              </select>
              <p className={help}>Para remover do ar, use “Pausado” ou “Arquivado”.</p>
            </div>

            <div className={card}>
              <label className={label}>Região</label>
              <select
                value={destinoSlug}
                onChange={(e) => setDestinoSlug(e.target.value)}
                className={inputBase}
                disabled={loadingConfig}
              >
                {destinos.length ? (
                  destinos.map((d) => (
                    <option key={d.id} value={d.slug}>
                      {d.nome}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhum destino cadastrado</option>
                )}
              </select>

              <p className={help}>
                Será salvo como:{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{normalizeCity(destinoSlug)}</span>
              </p>

              <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
                Dica: se você editar uma oferta antiga, pode ser que o <span className="font-medium">city</span> e o{' '}
                <span className="font-medium">categoryId</span> não batam 100% com os slugs novos. Nesse caso, selecione
                manualmente no combo e salve.
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
