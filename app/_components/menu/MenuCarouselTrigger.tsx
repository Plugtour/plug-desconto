'use client';

import React, { useMemo, useState } from 'react';
import MenuCarouselModal from './MenuCarouselModal';

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star'
  | 'food'
  | 'service'
  | 'shopping'
  | 'hotel'
  | 'transfer'
  | 'attraction';

type CategoryItem = {
  id: string;
  title: string;
  count: number;
  iconKey: IconKey;
};

type Props = {
  categories: CategoryItem[];
};

export default function MenuCarouselTrigger({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');

  const first = useMemo(() => categories?.[0] ?? null, [categories]);

  function handleOpen(cat?: CategoryItem | null) {
    if (!cat) return;
    setCategoryName(cat.title);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpen(first)}
        disabled={!first}
        className={[
          'rounded-xl px-4 py-2 text-sm font-semibold',
          first ? 'bg-zinc-900 text-white' : 'bg-zinc-300 text-zinc-600 cursor-not-allowed',
        ].join(' ')}
      >
        Abrir menu
      </button>

      <MenuCarouselModal
        open={open}
        onClose={() => setOpen(false)}
        title="Categoria"
        categoryName={categoryName}
      />
    </>
  );
}
