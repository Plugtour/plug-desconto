'use client';

import { useEffect, useState } from 'react';

type BannerStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  status: BannerStatus | string;
  order: number;
};

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

// ✅ mesma regra do HomeBanner: remoto ganha ?w=..., local usa original (sem variantes)
function variantUrl(url: string, width: number) {
  const u = withWebp(url);
  if (!u) return u;
  if (isRemoteUrl(u)) return addQuery(u, 'w', width);
  return u;
}

export default function AdminBannersClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetch('/api/admin/config/banners', { cache: 'no-store' as RequestCache })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Falha ao buscar banners'))))
      .then((data: any) => {
        if (!alive) return;

        const list: unknown[] = Array.isArray(data?.banners) ? (data.banners as unknown[]) : [];
        const normalized: Banner[] = list
          .filter((b: unknown): b is Record<string, unknown> => !!b && typeof b === 'object')
          .map((b) => ({
            id: String(b.id ?? '').trim(),
            title: String(b.title ?? '').trim() || 'Banner',
            imageUrl: String(b.imageUrl ?? '').trim(),
            status: String(b.status ?? ''),
            order: Number.isFinite(Number(b.order)) ? Number(b.order) : 0,
          }))
          .filter((b: Banner) => !!b.id && !!b.imageUrl);

        setBanners(normalized);
      })
      .catch(() => {
        if (!alive) return;
        setBanners([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-zinc-500">Carregando banners…</div>;
  }

  if (!banners.length) {
    return <div className="text-sm text-zinc-500">Nenhum banner cadastrado.</div>;
  }

  return (
    <div className="space-y-3">
      {banners.map((b) => {
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
                <div className="text-xs text-zinc-500">{b.status}</div>
              </div>
            </div>

            <div className="text-xs text-zinc-400">ordem {b.order}</div>
          </div>
        );
      })}
    </div>
  );
}
