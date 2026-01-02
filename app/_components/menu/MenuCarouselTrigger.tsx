'use client';

import React, { useState } from 'react';
import MenuCarouselModal from './MenuCarouselModal';

type IconKey =
  | 'pin'
  | 'ticket'
  | 'spark'
  | 'fork'
  | 'bed'
  | 'bag'
  | 'car'
  | 'star';

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

  function handleOpen(cat: CategoryItem) {
    setCategoryName(cat.title);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpen(categories[0])}
        className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-semibold"
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
