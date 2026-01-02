// app/_components/header/AppChrome.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import FloatingHeader from './FloatingHeader';
import MenuCarouselModal from '../menu/MenuCarouselModal';

import { getFavorites, onFavoritesChange, type FavoriteItem } from '../favorites/favoritesStore';

type Props = {
  children: React.ReactNode;
};

type DestinoItem = {
  id: string;
  title: string;
  subtitle?: string;
};

const DESTINOS: DestinoItem[] = [
  { id: 'serra-gaucha', title: 'Serra Gaúcha', subtitle: 'Gramado • Canela • Nova Petrópolis' },
  { id: 'gramado', title: 'Gramado', subtitle: 'Gastronomia • Ingressos • Passeios' },
  { id: 'canela', title: 'Canela', subtitle: 'Parques • Natureza • Atrações' },
  { id: 'porto-alegre', title: 'Porto Alegre', subtitle: 'Compras • Cultura • Gastronomia' },
  { id: 'bento', title: 'Bento Gonçalves', subtitle: 'Vinhos • Vale dos Vinhedos' },
  { id: 'caxias', title: 'Caxias do Sul', subtitle: 'Gastronomia • Cultura' },
];

function safeHref(v: any) {
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : '/';
}

export default function AppChrome({ children }: Props) {
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [notificationsCount] = useState<number>(0);

  const [destinosOpen, setDestinosOpen] = useState(false);
  const [clubeOpen, setClubeOpen] = useState(false);

  const [, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [, setNotificationsOpen] = useState(false);

  const [destinoId, setDestinoId] = useState<string>('serra-gaucha');

  const [userName] = useState<string | null>('Marcelo');

  const [destinosQuery, setDestinosQuery] = useState('');
  const destinosFiltered = DESTINOS.filter((d) => {
    const q = destinosQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      d.title.toLowerCase().includes(q) ||
      (d.subtitle ?? '').toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  });

  function closeDestinos() {
    setDestinosOpen(false);
    setDestinosQuery('');
  }

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const sync = () => {
      const list = getFavorites(); // ✅ já normaliza e corrige storage
      setFavorites(list);
      setFavoritesCount(list.length);
    };

    sync();
    const off = onFavoritesChange(sync);
    return () => off();
  }, []);

  const favoritesContent = useMemo(() => {
    if (!favorites.length) {
      return (
        <div className="px-4 pt-4 pb-6">
          <div className="text-[14px] font-semibold text-black">Nenhum favorito ainda</div>
          <div className="mt-1 text-[13px] text-black/60">Toque no coração nos cards para salvar aqui.</div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="px-4 pt-3 pb-3">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />
          <div className="text-[14px] font-semibold text-black">Favoritos</div>
          <div className="mt-1 text-[13px] text-black/60">Seus itens salvos aparecem aqui.</div>
        </div>

        <div className="px-4 pb-5 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="text-[12px] font-semibold text-black/60">Itens</div>

            <div className="mt-2 overflow-hidden rounded-xl bg-white/90 ring-1 ring-black/10">
              {favorites.map((f) => {
                const hrefSafe = safeHref((f as any)?.href);

                return (
                  <Link
                    key={f.id}
                    href={hrefSafe}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 transition-colors"
                    onClick={() => setFavoritesOpen(false)}
                  >
                    <div className="h-11 w-11 overflow-hidden rounded-lg bg-black/5 shrink-0">
                      {f.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-black">{f.title}</div>
                      <div className="truncate text-[12px] text-black/60">{f.subtitle || f.city || ''}</div>
                    </div>

                    {f.priceText ? (
                      <div className="shrink-0 text-[12px] font-semibold text-black/70">{f.priceText}</div>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setFavoritesOpen(false)}
                className="w-full rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [favorites]);

  return (
    <div
      style={{
        ['--app-header-h' as any]: 'calc(56px + env(safe-area-inset-top))',
      }}
    >
      <FloatingHeader
        favoritesCount={favoritesCount}
        notificationsCount={notificationsCount}
        userName={userName}
        onOpenDestinos={() => setDestinosOpen(true)}
        onOpenClub={() => setClubeOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* DESTINOS */}
      <MenuCarouselModal open={destinosOpen} onClose={closeDestinos} hideHeader>
        <div className="h-full flex flex-col">
          <div className="px-4 pt-3 pb-3">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />

            <div className="text-[14px] font-semibold text-black">Destinos</div>
            <div className="mt-1 text-[13px] text-black/60">Escolha um destino para ver as ofertas disponíveis.</div>

            <div className="mt-3 rounded-md bg-white/90 shadow-sm ring-1 ring-black/10 px-3 py-2 flex items-center gap-2">
              <span className="opacity-60" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path d="M16.6 16.6 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>

              <input
                value={destinosQuery}
                onChange={(e) => setDestinosQuery(e.target.value)}
                placeholder="Buscar destino…"
                className="w-full bg-transparent outline-none text-[16px] placeholder:text-black/45"
                inputMode="search"
                autoComplete="off"
                spellCheck={false}
              />

              {!!destinosQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setDestinosQuery('')}
                  aria-label="Limpar"
                  className="shrink-0 touch-manipulation rounded-md px-2 py-1 text-black/55 hover:text-black"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="px-4 pb-5 flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="text-[12px] font-semibold text-black/60">
                {destinosQuery.trim() ? 'Resultados' : 'Sugestões'}
              </div>

              <div className="mt-2 overflow-hidden rounded-xl bg-white/90 ring-1 ring-black/10">
                {destinosFiltered.length === 0 ? (
                  <div className="px-3 py-3 text-[13px] text-black/55">Nenhum destino encontrado.</div>
                ) : (
                  destinosFiltered.map((d) => {
                    const active = d.id === destinoId;

                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={[
                          'w-full text-left',
                          'px-3 py-3',
                          'flex items-center gap-3',
                          'transition-colors',
                          active ? 'bg-black/5' : 'hover:bg-black/5',
                        ].join(' ')}
                        onClick={() => {
                          setDestinoId(d.id);
                          closeDestinos();
                        }}
                      >
                        <div
                          className={[
                            'h-10 w-10 rounded-lg shrink-0',
                            active ? 'bg-emerald-600/15 ring-1 ring-emerald-600/25' : 'bg-black/5',
                            'flex items-center justify-center',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                            <path
                              d="M12 21s6-5.33 6-10a6 6 0 10-12 0c0 4.67 6 10 6 10z"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={active ? 'text-emerald-700' : 'text-black/60'}
                            />
                            <circle
                              cx="12"
                              cy="11"
                              r="2"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={active ? 'text-emerald-700' : 'text-black/60'}
                            />
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold text-black">{d.title}</div>
                          <div className="truncate text-[12px] text-black/60">{d.subtitle ?? ''}</div>
                        </div>

                        {active ? (
                          <div className="shrink-0 text-[12px] font-semibold text-emerald-700">Ativo</div>
                        ) : (
                          <div className="shrink-0 text-[12px] font-semibold text-black/45">Ver</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={closeDestinos}
                  className="w-full rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </MenuCarouselModal>

      {/* FAVORITOS */}
      <MenuCarouselModal open={favoritesOpen} onClose={() => setFavoritesOpen(false)} hideHeader>
        {favoritesContent}
      </MenuCarouselModal>

      {/* CLUBE placeholder */}
      {clubeOpen && (
        <div className="fixed inset-0 z-[999]">
          <button
            type="button"
            aria-label="Fechar clube"
            onClick={() => setClubeOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[6px] touch-manipulation"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-md px-[5px] pb-[5px]">
              <div className="rounded-t-md bg-zinc-100/92 shadow-2xl ring-1 ring-black/10 overflow-hidden">
                <div className="px-4 pt-3 pb-4">
                  <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />
                  <div className="text-[14px] font-semibold text-black">Meu Clube</div>
                  <div className="mt-1 text-[13px] text-black/60">Aqui vão as informações do clube (placeholder).</div>

                  <button
                    type="button"
                    onClick={() => setClubeOpen(false)}
                    className="mt-4 w-full rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-14" style={{ paddingTop: 'var(--app-header-h, 56px)' }}>
        {children}
      </div>

      <div className="hidden" data-destino={destinoId} />
    </div>
  );
}
