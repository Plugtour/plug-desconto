// app/_components/search/QuickSearch.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { SearchCategory, SearchOffer } from './types';
import { buildOfferHref, filterCategories, searchOffers } from './search-helpers';

type Props = {
  offers: SearchOffer[];
  categories: SearchCategory[];
  className?: string;
  placeholder?: string;
  maxResults?: number;
  maxCategories?: number;

  // ✅ NOVO: quando true, não abre o sheet interno; chama onOpenExternal
  useExternalModal?: boolean;
  onOpenExternal?: () => void;
};

const QS_STORAGE_KEY = 'plugdesconto_quicksearch_v1';
const QS_TTL_MS = 2 * 60 * 60 * 1000; // 1 hora

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

function SadFaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-4 w-4'} fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 10.2h.01M15 10.2h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M9 16.2c.9-1 2-1.5 3-1.5s2.1.5 3 1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const cls = className ?? 'h-5 w-5';

  const colorsById: Record<string, string> = {
    passeios: '#22C55E',
    passeios2: '#22C55E',
    ingressos: '#F59E0B',
    ingressos2: '#F59E0B',
    servicos: '#3B82F6',
    servicos2: '#3B82F6',
    gastronomia: '#EF4444',
    gastronomia2: '#EF4444',
    hospedagem: '#A855F7',
    hospedagem2: '#A855F7',
    compras: '#F97316',
    compras2: '#F97316',
    transfers: '#06B6D4',
    transfers2: '#06B6D4',
    atracoes: '#EAB308',
    atracoes2: '#EAB308',
  };

  const stroke = colorsById[id] ?? 'currentColor';

  switch (id) {
    case 'passeios':
    case 'passeios2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );

    case 'ingressos':
    case 'ingressos2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M6.5 8.2h11c.7 0 1.3.6 1.3 1.3v1a2 2 0 0 0 0 4v1c0 .7-.6 1.3-1.3 1.3h-11c-.7 0-1.3-.6-1.3-1.3v-1a2 2 0 0 0 0-4v-1c0-.7.6-1.3 1.3-1.3z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 9.5v7" stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case 'servicos':
    case 'servicos2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 3l1.8 5 5 1.7-5 1.8-1.8 5-1.7-5-5-1.8 5-1.7L12 3z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M18.2 13.6l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'gastronomia':
    case 'gastronomia2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M7 3v7M10 3v7M8.5 10v11" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M17 3c2 2.4 2 4.8 0 7v11" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'hospedagem':
    case 'hospedagem2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M5 11.2V9.2c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M5 12h14v6.8M5 18.8v-2.2M19 18.8v-2.2"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M8 12v-1.6M16 12v-1.6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'compras':
    case 'compras2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path d="M7.5 9h9l-.7 10H8.2L7.5 9z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M9.2 9c0-2 1.2-3.2 2.8-3.2S14.8 7 14.8 9"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'transfers':
    case 'transfers2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M6.5 11l1.6-3.5c.2-.5.7-.8 1.2-.8h5.4c.5 0 1 .3 1.2.8L18.5 11"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M6 11h12v6H6v-6z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M8 17.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM16 17.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );

    case 'atracoes':
    case 'atracoes2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 3.6l2.5 5.3 5.8.5-4.4 3.8 1.4 5.7L12 16.1 6.7 18.9l1.4-5.7-4.4-3.8 5.8-.5L12 3.6z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M12 3l2.2 6.2L21 12l-6.8 2.8L12 21l-2.2-6.2L3 12l6.8-2.8L12 3z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function safeReadStoredQuery(): string | null {
  try {
    const raw = localStorage.getItem(QS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { q?: string; t?: number };
    const q = typeof parsed.q === 'string' ? parsed.q : '';
    const t = typeof parsed.t === 'number' ? parsed.t : 0;

    if (!q || !t) return null;

    const age = Date.now() - t;
    if (age >= QS_TTL_MS) {
      localStorage.removeItem(QS_STORAGE_KEY);
      return null;
    }

    return q;
  } catch {
    return null;
  }
}

function safeStoreQuery(q: string) {
  try {
    localStorage.setItem(QS_STORAGE_KEY, JSON.stringify({ q, t: Date.now() }));
  } catch {
    // ignore
  }
}

function safeClearStoredQuery() {
  try {
    localStorage.removeItem(QS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* =========================================================
   ✅ NOVO: Painel (conteúdo) para usar dentro do MenuCarouselModal
========================================================= */
export function QuickSearchPanel({
  offers,
  categories,
  placeholder = 'Buscar ofertas, passeios, ingressos…',
  maxResults = 8,
  maxCategories = 24,
  onRequestClose,
}: {
  offers: SearchOffer[];
  categories: SearchCategory[];
  placeholder?: string;
  maxResults?: number;
  maxCategories?: number;
  onRequestClose?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const clearTimerRef = useRef<number | null>(null);

  const [value, setValue] = useState('');
  const [active, setActive] = useState(0);

  const debounced = useDebouncedValue(value, 120);
  const hasQuery = value.trim().length > 0;

  const results = useMemo(() => {
    return searchOffers(offers, debounced, maxResults);
  }, [offers, debounced, maxResults]);

  const filteredCats = useMemo(() => {
    return filterCategories(categories, debounced, maxCategories);
  }, [categories, debounced, maxCategories]);

  useEffect(() => {
    const saved = safeReadStoredQuery();
    if (saved) {
      setValue(saved);
      setActive(0);
    } else {
      setValue('');
      setActive(0);
    }

    const t = window.setTimeout(() => inputRef.current?.focus(), 70);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  function scheduleAutoClear() {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    clearTimerRef.current = window.setTimeout(() => {
      safeClearStoredQuery();
    }, QS_TTL_MS);
  }

  function persistIfNeeded() {
    if (hasQuery) {
      safeStoreQuery(value.trim());
      scheduleAutoClear();
    } else {
      safeClearStoredQuery();
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      persistIfNeeded();
      onRequestClose?.();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length === 0) return;
      setActive((prev) => Math.min(prev + 1, results.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length === 0) return;
      setActive((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      const item = results[active];
      if (!item) return;
      window.location.href = buildOfferHref(item);
    }
  }

  return (
    <div className="w-full">
      {/* topo igual ao sheet */}
      <div className="px-4 pt-3 pb-2">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md bg-white/90 shadow-sm ring-1 ring-black/10 px-3 py-2 flex-1">
            <span className="shrink-0 opacity-60" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M16.6 16.6 21 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                const next = e.target.value;
                setValue(next);
                setActive(0);

                if (next.trim().length === 0) {
                  safeClearStoredQuery();
                  if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
                  clearTimerRef.current = null;
                }
              }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none text-[16px] placeholder:text-black/45"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
            />

            {hasQuery && (
              <button
                type="button"
                onClick={() => {
                  setValue('');
                  setActive(0);
                  safeClearStoredQuery();
                  if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
                  clearTimerRef.current = null;
                  inputRef.current?.focus();
                }}
                aria-label="Limpar pesquisa"
                className="shrink-0 touch-manipulation rounded-md px-2 py-1 text-black/55 hover:text-black"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M7 7l10 10M17 7 7 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            type="button"
            className="touch-manipulation rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            aria-label="Buscar"
            onClick={() => inputRef.current?.focus()}
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="h-[72vh] px-4 pb-5 overflow-hidden">
        <div className="h-full overflow-auto">
          {hasQuery && (
            <div className="pt-2">
              <div className="text-[12px] font-semibold text-black/60">Resultados</div>

              {results.length === 0 ? (
                <div className="mt-2 px-1 py-2 text-[13px] text-black/55 flex items-center gap-2">
                  <span>Nenhum resultado encontrado.</span>
                  <SadFaceIcon className="h-4 w-4 text-black/50" />
                </div>
              ) : (
                <div className="mt-2 overflow-hidden rounded-xl bg-white/90 ring-1 ring-black/10">
                  {results.map((o, idx) => {
                    const isActive = idx === active;
                    const href = buildOfferHref(o);

                    return (
                      <Link
                        key={`${o.id}-${o.slug ?? ''}`}
                        href={href}
                        className={[
                          'flex items-center gap-3 px-3 py-2.5 transition-colors',
                          isActive ? 'bg-black/5' : 'hover:bg-black/5',
                        ].join(' ')}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => {
                          persistIfNeeded();
                          onRequestClose?.();
                        }}
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-black/5 shrink-0">
                          {o.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={o.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-black">
                            {o.title}
                          </div>
                          <div className="truncate text-[12px] text-black/60">
                            {o.subtitle || o.city || ''}
                          </div>
                        </div>

                        {o.priceText ? (
                          <div className="shrink-0 text-[12px] font-semibold text-black/70">
                            {o.priceText}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className={hasQuery ? 'pt-4' : 'pt-3'}>
            <div className="text-[12px] font-semibold text-black/60">Categorias</div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {filteredCats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="touch-manipulation rounded-md bg-white/90 border border-neutral-200/60 px-2 py-2 flex flex-col items-center gap-0 hover:bg-black/5 transition-colors"
                  onClick={() => {
                    setValue(c.title);
                    setActive(0);
                    inputRef.current?.focus();
                  }}
                >
                  <CategoryIcon id={c.id} className="h-5 w-5" />
                  <span className="w-full px-1 text-center text-[11px] font-semibold leading-[1.15] text-neutral-800 line-clamp-2">
                    {c.title}
                  </span>

                  {/* ✅ aqui é onde você ajusta o espaçamento entre nome e quantidade */}
                  <span className="mt-[0px] text-[11px] text-neutral-500">
                    {typeof c.count === 'number' ? c.count : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuickSearch({
  offers,
  categories,
  className,
  placeholder = 'Buscar ofertas, passeios, ingressos…',
  maxResults = 8,
  maxCategories = 24,
  useExternalModal = false,
  onOpenExternal,
}: Props) {
  // ✅ quando usar modal externo, o componente vira “gatilho” e não abre sheet aqui
  function openSheet() {
    if (useExternalModal) {
      onOpenExternal?.();
      return;
    }
    // fallback: mantém seu comportamento antigo (sheet interno)
    // (o antigo sheet foi removido daqui de propósito porque agora você vai usar o modal externo)
    onOpenExternal?.();
  }

  return (
    <div className={className}>
      {/* PADDING DO BLOCO (o que você grifou) */}
      <div className="px-0 py-3">
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={openSheet}
            className="flex-1 touch-manipulation"
            aria-label="Abrir busca"
          >
            <div className="h-[44px] flex items-center rounded-md bg-white/95 shadow-sm ring-1 ring-black/10 px-3">
              <div className="flex-1 text-left text-[14px] leading-none text-black/45">
                {placeholder}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={openSheet}
            className="h-[44px] touch-manipulation flex items-center justify-center rounded-md bg-emerald-600 px-3 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            aria-label="Buscar"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
