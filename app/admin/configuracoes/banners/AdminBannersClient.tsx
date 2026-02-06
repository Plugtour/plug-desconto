// caminho: app/admin/configuracoes/banners/AdminBannersClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

type BannerStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';
type BannerAlign = 'left' | 'center' | 'right';

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  highlight?: string | null;
  tag?: string | null;
  href?: string | null;
  align?: BannerAlign | null;
  imageUrl: string;
  status: BannerStatus | string;
  order: number;
};

function norm(v: any) {
  return typeof v === 'string' ? v.trim() : '';
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function addQuery(url: string, key: string, val: string | number) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`;
}

function withWebp(url: string) {
  if (!url) return url;
  if (url.toLowerCase().endsWith('.webp')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}fm=webp`;
}

// ✅ Vercel Blob NÃO suporta transformações tipo ?w=... / ?fm=...
function isVercelBlobUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return host.includes('vercel-storage') || host.includes('blob');
  } catch {
    return false;
  }
}

// ✅ regra segura: só adiciona query de “transform” se não for Vercel Blob
function variantUrl(url: string, width: number) {
  const u = url || '';
  if (!u) return u;

  // local (ex: /banners/...)
  if (!isRemoteUrl(u)) return u;

  // remoto (ex: Vercel Blob): não mexe
  if (isVercelBlobUrl(u)) return u;

  // remoto genérico: mantém como antes
  const webp = withWebp(u);
  return addQuery(webp, 'w', width);
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  highlight: '',
  tag: '',
  href: '',
  align: 'left' as BannerAlign,
  status: 'publicado' as BannerStatus,
  order: 1,
  imageUrl: '',
};

export default function AdminBannersClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pickedName, setPickedName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const sorted = useMemo(() => {
    const base = Array.isArray(banners) ? [...banners] : [];
    base.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
    return base;
  }, [banners]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/config/banners', { cache: 'no-store' as RequestCache });
      if (!r.ok) throw new Error('Falha ao buscar banners');
      const data = await r.json();

      const list: unknown[] = Array.isArray(data?.banners) ? (data.banners as unknown[]) : [];
      const normalized: Banner[] = list
        .filter((b: unknown): b is Record<string, unknown> => !!b && typeof b === 'object')
        .map((b) => ({
          id: String((b as any).id ?? '').trim(),
          title: String((b as any).title ?? '').trim() || 'Banner',
          subtitle: norm((b as any).subtitle) || '',
          highlight: norm((b as any).highlight) || '',
          tag: norm((b as any).tag) || '',
          href: norm((b as any).href) || '',
          align:
            (b as any).align === 'left' || (b as any).align === 'center' || (b as any).align === 'right'
              ? ((b as any).align as any)
              : 'left',
          imageUrl: String((b as any).imageUrl ?? '').trim(),
          status: String((b as any).status ?? ''),
          order: Number.isFinite(Number((b as any).order)) ? Number((b as any).order) : 0,
        }))
        .filter((b: Banner) => !!b.id && !!b.imageUrl);

      setBanners(normalized);
      setErrorMsg('');
    } catch (e: unknown) {
      setBanners([]);
      const msg = e instanceof Error ? e.message : 'Falha ao carregar';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: (sorted[sorted.length - 1]?.order ?? 0) + 1 });
    setPickedName('');
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      title: b.title ?? '',
      subtitle: (b.subtitle ?? '') as any,
      highlight: (b.highlight ?? '') as any,
      tag: (b.tag ?? '') as any,
      href: (b.href ?? '') as any,
      align: (b.align ?? 'left') as any,
      status: (b.status as any) || 'publicado',
      order: Number.isFinite(Number(b.order)) ? Number(b.order) : 0,
      imageUrl: b.imageUrl ?? '',
    });
    setPickedName('');
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function uploadBannerImage(file: File) {
    const fd = new FormData();
    fd.append('file', file);

    const r = await fetch('/api/admin/upload/banner-image', {
      method: 'POST',
      body: fd,
    });

    const j = await r.json().catch(() => ({} as any));
    const url = String((j as any)?.url ?? (j as any)?.imageUrl ?? '').trim();

    if (!r.ok || !url) {
      const detail = String((j as any)?.detail ?? (j as any)?.error ?? '').trim();
      throw new Error(detail || 'Falha no upload');
    }

    return url;
  }

  function openFilePicker() {
    setErrorMsg('');
    fileRef.current?.click();
  }

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setPickedName(f.name);
    setErrorMsg('');

    try {
      setSaving(true);
      const url = await uploadBannerImage(f);
      setField('imageUrl', url as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no upload';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    const payload = {
      title: norm(form.title),
      subtitle: norm(form.subtitle),
      highlight: norm(form.highlight),
      tag: norm(form.tag),
      href: norm(form.href),
      align: form.align,
      status: form.status,
      order: Number(form.order ?? 0),
      imageUrl: norm(form.imageUrl),
    };

    if (!payload.title || !payload.imageUrl) {
      setErrorMsg('Informe Título e Imagem.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      if (editingId) {
        await fetch(`/api/admin/config/banners/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/config/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await load();
      startNew();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!id) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await fetch(`/api/admin/config/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await load();
      if (editingId === id) startNew();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao excluir';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-zinc-500">Carregando banners…</div>;
  }

  const previewSrc = form.imageUrl ? variantUrl(form.imageUrl, 360) || form.imageUrl : '';

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">{editingId ? 'Editar banner' : 'Novo banner'}</div>
          <button
            type="button"
            onClick={startNew}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-800"
          >
            Novo
          </button>
        </div>

        {errorMsg ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {errorMsg}
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div>
            <div className="text-[11px] text-zinc-500">Título</div>
            <input
              value={form.title}
              onChange={(e) => setField('title', e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Ex: Descontos em Gramado"
            />
          </div>

          <div>
            <div className="text-[11px] text-zinc-500">Subtítulo</div>
            <input
              value={form.subtitle}
              onChange={(e) => setField('subtitle', e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Ex: Economize nos melhores lugares"
            />
          </div>

          <div>
            <div className="text-[11px] text-zinc-500">Highlight</div>
            <input
              value={form.highlight}
              onChange={(e) => setField('highlight', e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Ex: Ofertas novas toda semana"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-zinc-500">Tag</div>
              <input
                value={form.tag}
                onChange={(e) => setField('tag', e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Ex: Destaque"
              />
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Link (href)</div>
              <input
                value={form.href}
                onChange={(e) => setField('href', e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="/ofertas"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] text-zinc-500">Alinhamento</div>
              <select
                value={form.align}
                onChange={(e) => setField('align', e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Status</div>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="publicado">publicado</option>
                <option value="rascunho">rascunho</option>
                <option value="pausado">pausado</option>
                <option value="arquivado">arquivado</option>
                <option value="lixeira">lixeira</option>
              </select>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Ordem</div>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField('order', Number(e.target.value) as any)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-500">Imagem (URL)</div>
            <input
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="/banners/banner-01.webp ou https://..."
            />

            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={saving}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium disabled:opacity-60 dark:border-zinc-800"
              >
                Selecionar imagem
              </button>

              <div className="text-xs text-zinc-500">{pickedName ? pickedName : 'Nenhum arquivo selecionado'}</div>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>

              {form.imageUrl ? (
                <div
                  className="ml-auto overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
                  style={{ width: 96, height: 56 }}
                  title="Preview"
                >
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* LISTA */}
      {!sorted.length ? (
        <div className="text-sm text-zinc-500">Nenhum banner cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => {
            const thumb = variantUrl(b.imageUrl, 320) || b.imageUrl;

            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={thumb}
                    alt={b.title}
                    className="h-12 w-20 rounded-md object-cover"
                    width={80}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <div className="text-sm font-medium">{b.title}</div>
                    <div className="text-xs text-zinc-500">
                      {b.status} • ordem {b.order}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(b)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-800"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(b.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-900/50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
