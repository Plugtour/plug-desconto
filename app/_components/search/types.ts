// app/_components/search/types.ts

export type SearchOffer = {
  id: string;
  slug?: string | null;
  title: string;
  subtitle?: string | null;
  categoryId?: string | null;
  city?: string | null;
  priceText?: string | null;
  imageUrl?: string | null;
};

export type SearchCategory = {
  id: string;
  title: string;
  count?: number | null;
};
