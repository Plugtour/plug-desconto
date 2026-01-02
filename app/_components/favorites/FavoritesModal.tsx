'use client';

import React, { useEffect, useState } from 'react';
import MenuCarouselModal from '../menu/MenuCarouselModal';
import {
  getFavorites,
  onFavoritesChange,
  removeFavorite,
  FavoriteItem,
} from './favoritesStore';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FavoritesModal({ open, onClose }: Props) {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    if (!open) return;

    const sync = () => {
      setItems(getFavorites());
    };

    sync();
    const off = onFavoritesChange(sync);
    return () => off();
  }, [open]);

  return (
    <MenuCarouselModal open={open} onClose={onClose} hideHeader>
      <div className="h-full flex flex-col">
        {/* topo */}
        <div className="px-4 pt-3 pb-3">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/15" />
          <div className="text-[14px] font-semibold text-black">Favoritos</div>
          <div className="mt-1 text-[13px] text-black/60">
            {items.length === 0
              ? 'Você ainda não favoritou nenhum item.'
              : `Você tem ${items.length} favorito${items.length > 1 ? 's' : ''}.`}
          </div>
        </div>

        {/* lista */}
        <div className="px-4 pb-5 flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="mt-6 text-center text-[13px] text-black/50">
              Toque no ❤️ dos cards para salvar seus favoritos.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center rounded-lg bg-white/90 ring-1 ring-black/10 px-3 py-3"
                >
                  {/* imagem */}
                  <div className="h-14 w-14 flex-none overflow-hidden rounded-md bg-zinc-200">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  {/* texto */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-black">
                      {item.title}
                    </div>

                    {item.subtitle ? (
                      <div className="truncate text-[12px] text-black/60">
                        {item.subtitle}
                      </div>
                    ) : null}

                    {item.priceText ? (
                      <div className="text-[12px] font-medium text-emerald-700">
                        {item.priceText}
                      </div>
                    ) : null}
                  </div>

                  {/* remover */}
                  <button
                    type="button"
                    aria-label="Remover dos favoritos"
                    onClick={() => removeFavorite(item.id)}
                    className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 21C12 21 4 15.36 4 9.5C4 7.02 6.02 5 8.5 5C10.04 5 11.4 5.81 12 7C12.6 5.81 13.96 5 15.5 5C17.98 5 20 7.02 20 9.5C20 15.36 12 21 12 21Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MenuCarouselModal>
  );
}
