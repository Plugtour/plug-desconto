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
};

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
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-4 w-4'}
      fill="none"
      aria-hidden="true"
    >
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
          <path
            d="M7 3v7M10 3v7M8.5 10v11"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 3c2 2.4 2 4.8 0 7v11"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
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
          <path
            d="M8 12v-1.6M16 12v-1.6"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'compras':
    case 'compras2':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden="true">
          <path
            d="M7.5 9h9l-.7 10H8.2L7.5 9z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
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
          <path
            d="M6 11h12v6H6v-6z"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
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

export default function QuickSearch({
  offers,
  categories,
  className,
  placeholder = 'Buscar ofertas, passeios, ingressos…',
  maxResults = 8,
  maxCategories = 24,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [closing, setClosing] = useState(false); // ✅ novo: animação de saída
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
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 70);
    return () => window.clearTimeout(t);
  }, [sheetOpen]);

  function openSheet() {
    setClosing(false);
    setSheetOpen(true);
  }

  function closeSheet() {
    // ✅ fecha com animação (desliza para baixo)
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setSheetOpen(false);
      setClosing(false);
      setActive(0);
    }, 260);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      closeSheet();
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
    <div className={className}>
      {/* campo compacto (home) */}
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={openSheet}
          className="flex-1"
          aria-label="Abrir busca"
        >
          <div className="h-10 flex items-center rounded-md bg-white/95 shadow-sm ring-1 ring-black/10 px-3 py-0">
            <div className="flex-1 text-left text-[14px] leading-none text-black/45">
              {placeholder}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={openSheet}
          className="h-10 flex items-center justify-center rounded-md bg-emerald-600 px-3 py-0 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
          aria-label="Buscar"
        >
          Buscar
        </button>
      </div>

      {/* bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[999]">
          {/* backdrop com blur (também anima na saída) */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={closeSheet}
            className={[
              'absolute inset-0 rounded-md bg-black/35 backdrop-blur-[6px]',
              closing ? 'backdrop-exit' : 'backdrop-enter',
            ].join(' ')}
          />

          {/* painel */}
          <div className="absolute inset-x-0 bottom-0">
            <div
              className={[
                'mx-auto w-full max-w-md px-[5px] pb-[5px] relative',
                closing ? 'sheet-exit' : 'sheet-enter',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={closeSheet}
                className="absolute right-[5px] -top-9 rounded-md bg-white/80 ring-1 ring-black/10 px-3 py-1.5 text-[13px] font-normal text-black/75 hover:bg-white"
              >
                Fechar
              </button>

              <div className="rounded-t-md bg-zinc-100/92 shadow-2xl ring-1 ring-black/10 overflow-hidden">
                {/* topo */}
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
                          setValue(e.target.value);
                          setActive(0);
                        }}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/45"
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
                            inputRef.current?.focus();
                          }}
                          aria-label="Limpar pesquisa"
                          className="shrink-0 rounded-md px-2 py-1 text-black/55 hover:text-black"
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
                      className="rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                      aria-label="Buscar"
                      onClick={() => inputRef.current?.focus()}
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                {/* modal com altura fixa (não encolhe) */}
                <div className="h-[72vh] px-4 pb-5 overflow-hidden">
                  <div className="h-full overflow-auto">
                    {hasQuery && (
                      <div className="pt-2">
                        <div className="text-[12px] font-semibold text-black/60">
                          Resultados
                        </div>

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
                                  onClick={closeSheet}
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

                    {/* categorias */}
                    <div className={hasQuery ? 'pt-4' : 'pt-3'}>
                      <div className="text-[12px] font-semibold text-black/60">
                        Categorias
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {filteredCats.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="rounded-md bg-white/90 border border-neutral-200/60 px-2 py-2 flex flex-col items-center gap-0 hover:bg-black/5 transition-colors"
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
                            <span className="text-[11px] text-neutral-500">
                              {typeof c.count === 'number' ? c.count : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 text-[12px] text-black/45">
                      Dica: use ↑ ↓ e Enter para escolher um resultado.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ animações: abrir (subir) + fechar (descer), suaves */}
            <style jsx global>{`
              @keyframes sheetEnter {
                from {
                  transform: translateY(34px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              @keyframes sheetExit {
                from {
                  transform: translateY(0);
                  opacity: 1;
                }
                to {
                  transform: translateY(34px);
                  opacity: 0;
                }
              }
              .sheet-enter {
                animation: sheetEnter 320ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
              }
              .sheet-exit {
                animation: sheetExit 280ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
              }

              @keyframes backdropEnter {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes backdropExit {
                from {
                  opacity: 1;
                }
                to {
                  opacity: 0;
                }
              }
              .backdrop-enter {
                animation: backdropEnter 220ms ease-out both;
              }
              .backdrop-exit {
                animation: backdropExit 220ms ease-in both;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
