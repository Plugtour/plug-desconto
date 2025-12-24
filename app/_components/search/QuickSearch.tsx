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
  const [value, setValue] = useState('');
  const [active, setActive] = useState(0);

  const debounced = useDebouncedValue(value, 120);

  const results = useMemo(() => {
    return searchOffers(offers, debounced, maxResults);
  }, [offers, debounced, maxResults]);

  const filteredCats = useMemo(() => {
    return filterCategories(categories, debounced, maxCategories);
  }, [categories, debounced, maxCategories]);

  // trava scroll do body quando modal abre
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  // foco automático quando abre
  useEffect(() => {
    if (!sheetOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [sheetOpen]);

  function closeSheet() {
    setSheetOpen(false);
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // navega apenas pelos resultados (produtos), como você pediu:
    // resultados ficam entre o campo e as categorias, então o Enter prioriza produto.
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

  // Campo compacto da Home (abre o bottom sheet ao clicar)
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="w-full"
        aria-label="Abrir busca"
      >
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 shadow-sm ring-1 ring-black/10 px-3 py-2">
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
          <div className="flex-1 text-left text-[15px] text-black/45">
            {placeholder}
          </div>
        </div>
      </button>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[999]">
          {/* backdrop */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={closeSheet}
            className="absolute inset-0 bg-black/40"
          />

          {/* painel */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="sheet-enter mx-auto w-full max-w-md">
              <div className="rounded-t-3xl bg-zinc-100 shadow-2xl ring-1 ring-black/10 overflow-hidden">
                {/* topo do sheet */}
                <div className="px-4 pt-3 pb-2">
                  <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />

                  <div className="flex items-center gap-2 rounded-2xl bg-white shadow-sm ring-1 ring-black/10 px-3 py-2">
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

                    {value.trim().length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setValue('');
                          setActive(0);
                          inputRef.current?.focus();
                        }}
                        className="shrink-0 rounded-xl px-2 py-1 text-[12px] font-semibold text-black/60 hover:text-black"
                      >
                        Limpar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={closeSheet}
                        className="shrink-0 rounded-xl px-2 py-1 text-[12px] font-semibold text-black/60 hover:text-black"
                      >
                        Fechar
                      </button>
                    )}
                  </div>
                </div>

                {/* CONTEÚDO: resultados entre o campo e as categorias */}
                <div className="max-h-[72vh] overflow-auto px-4 pb-5">
                  {/* RESULTADOS */}
                  <div className="pt-2">
                    <div className="text-[12px] font-semibold text-black/60">
                      Resultados
                    </div>

                    {results.length === 0 ? (
                      <div className="mt-2 rounded-2xl bg-white ring-1 ring-black/10 px-3 py-3 text-[13px] text-black/55">
                        {value.trim().length ? 'Nenhum resultado encontrado.' : 'Comece digitando para pesquisar.'}
                      </div>
                    ) : (
                      <div className="mt-2 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
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
                              <div className="h-10 w-10 overflow-hidden rounded-xl bg-black/5 shrink-0">
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

                  {/* CATEGORIAS */}
                  <div className="pt-4">
                    <div className="text-[12px] font-semibold text-black/60">
                      Categorias
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {filteredCats.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="rounded-2xl bg-white ring-1 ring-black/10 px-3 py-3 text-left hover:bg-black/5 transition-colors"
                          onClick={() => {
                            // comportamento simples de filtro:
                            // ao tocar na categoria, preenche no campo e mantém aberto
                            setValue(c.title);
                            setActive(0);
                            inputRef.current?.focus();
                          }}
                        >
                          <div className="text-[13px] font-semibold text-black truncate">
                            {c.title}
                          </div>
                          {typeof c.count === 'number' ? (
                            <div className="text-[12px] text-black/55">
                              {c.count} opções
                            </div>
                          ) : (
                            <div className="text-[12px] text-black/45">
                              Filtrar
                            </div>
                          )}
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

            <style jsx global>{`
              @keyframes sheetEnter {
                from {
                  transform: translateY(18px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              .sheet-enter {
                animation: sheetEnter 180ms ease-out both;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
