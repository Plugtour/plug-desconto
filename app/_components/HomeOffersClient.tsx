'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type OfferItem = {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  partner?: string;
  city?: string;
  categoryId?: string;
  category?: { id?: string; name?: string };
  benefit?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  rating?: number;
  reviewsCount?: number;
};

type OffersResponse = {
  items: OfferItem[];
  total: number;
};

const CITIES = [
  { id: '', label: 'Todas as cidades' },
  { id: 'gramado', label: 'Gramado' },
  { id: 'canela', label: 'Canela' },
  { id: 'nova-petropolis', label: 'Nova Petrópolis' },
  { id: 'bento-goncalves', label: 'Bento Gonçalves' },
];

const CATEGORIES = [
  { id: '', label: 'Todas' },
  { id: 'restaurante', label: 'Restaurantes' },
  { id: 'atracao', label: 'Atrações' },
  { id: 'passeio', label: 'Passeios' },
  { id: 'servico', label: 'Serviços' },
];

function normalizeText(v?: string | null) {
  return (v ?? '').toString().trim();
}

function getOfferTitle(o: OfferItem) {
  return (
    normalizeText(o.title) ||
    normalizeText(o.name) ||
    normalizeText(o.partner) ||
    'Benefício'
  );
}

function getOfferHref(o: OfferItem) {
  const key = normalizeText(o.slug) || normalizeText(o.id);
  return key ? `/beneficio/${encodeURIComponent(key)}` : '#';
}

function getOfferImage(o: OfferItem) {
  return normalizeText(o.coverImageUrl) || normalizeText(o.imageUrl) || '';
}

function getOfferCategoryId(o: OfferItem) {
  return normalizeText(o.categoryId) || normalizeText(o.category?.id);
}

function getOfferCity(o: OfferItem) {
  return normalizeText(o.city);
}

function formatRating(n?: number) {
  if (typeof n !== 'number' || Number.isNaN(n)) return null;
  const v = Math.max(0, Math.min(5, n));
  return v.toFixed(1).replace('.', ',');
}

function buildOfertasHref(params: { cat?: string; city?: string }) {
  const qs = new URLSearchParams();
  if (params.cat) qs.set('cat', params.cat);
  if (params.city) qs.set('city', params.city);
  const s = qs.toString();
  return s ? `/ofertas?${s}` : `/ofertas`;
}

export default function HomeOffersClient() {
  const [city, setCity] = useState<string>('');
  const [cat, setCat] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<OffersResponse>({ items: [], total: 0 });

  // Continua usando a API para carregar os cards deste bloco
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    // Se a API também suportar categoryId, mantemos; se não suportar, não quebra — só ignora no backend.
    // A página /ofertas já filtra por cat via apiGetOffers(cat).
    if (cat) params.set('categoryId', cat);
    const qs = params.toString();
    return qs ? `/api/offers?${qs}` : `/api/offers`;
  }, [city, cat]);

  const ofertasHref = useMemo(() => buildOfertasHref({ cat: cat || undefined, city: city || undefined }), [cat, city]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Falha ao buscar ofertas (${res.status})`);
        }
        const json = (await res.json()) as OffersResponse;

        if (!cancelled) {
          const items = Array.isArray(json?.items) ? json.items : [];
          const total =
            typeof json?.total === 'number' ? json.total : items.length;

          setData({ items, total });
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Erro ao buscar ofertas');
          setData({ items: [], total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const hasFilters = Boolean(city || cat);

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-xs">
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Cidade
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              Categorias
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = cat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={[
                      'h-10 rounded-full border px-4 text-sm transition',
                      active
                        ? 'border-zinc-200 bg-zinc-200 text-zinc-950'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800',
                    ].join(' ')}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:pl-2">
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setCity('');
                  setCat('');
                }}
                className="h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Limpar
              </button>
            ) : null}

            <Link
              href={ofertasHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              Ver todas em /ofertas
            </Link>
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          Fonte (API): <span className="font-mono">{apiUrl}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-50">Benefícios</h3>
          <div className="text-sm text-zinc-400">
            {loading ? 'Carregando…' : `${data.total} encontrado(s)`}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
              />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
            Nenhum benefício encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.items.map((o, idx) => {
              const title = getOfferTitle(o);
              const href = getOfferHref(o);
              const img = getOfferImage(o);
              const cityName = getOfferCity(o);
              const catId = getOfferCategoryId(o);
              const rating = formatRating(o.rating);
              const reviews =
                typeof o.reviewsCount === 'number' ? o.reviewsCount : null;

              return (
                <Link
                  key={`${o.id ?? o.slug ?? idx}`}
                  href={href}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-3 transition hover:bg-zinc-900"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-24 flex-none overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm font-semibold text-zinc-50">
                        {title}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                        {cityName ? (
                          <span>{cityName}</span>
                        ) : (
                          <span className="text-zinc-500">Cidade</span>
                        )}
                        <span className="text-zinc-700">•</span>
                        {catId ? (
                          <span>{catId}</span>
                        ) : (
                          <span className="text-zinc-500">Categoria</span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-zinc-400">
                          {rating ? (
                            <>
                              <span className="font-semibold text-zinc-200">
                                {rating}
                              </span>
                              {reviews !== null ? (
                                <span> ({reviews})</span>
                              ) : null}
                            </>
                          ) : (
                            <span>Sem avaliações</span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-zinc-200 group-hover:underline">
                          Ver detalhes
                        </div>
                      </div>

                      {o.benefit ? (
                        <div className="mt-2 line-clamp-1 text-xs text-zinc-300">
                          {o.benefit}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
