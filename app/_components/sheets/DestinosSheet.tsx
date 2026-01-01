'use client';

import React from 'react';
import BottomSheet from './BottomSheet';

type Destination = {
  id: string;
  title: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
};

const DESTINOS: Destination[] = [
  { id: 'serra-gaucha', title: 'Serra Gaúcha' },
  { id: 'gramado', title: 'Gramado' },
  { id: 'canela', title: 'Canela' },
];

export default function DestinosSheet({ open, onClose, onSelect }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Destinos">
      <div className="mt-2 space-y-2">
        {DESTINOS.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              onSelect?.(d.id);
              onClose();
            }}
            className="
              w-full rounded-xl border border-black/10 bg-white
              px-4 py-3 text-left
              active:scale-[0.99]
            "
          >
            <div className="text-sm font-semibold">{d.title}</div>
            <div className="mt-0.5 text-xs text-black/60">
              Toque para selecionar
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
