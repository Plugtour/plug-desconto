// app/_data/usedMock.ts
export type UsedItem = {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogoUrl?: string | null;
  categoryLabel?: string | null;

  benefitTitle: string;
  usedAt: string; // ISO
  savedCents: number;

  rating?: number | null; // 1..5
  reviewId?: string | null;
};

export const USED_MOCK: UsedItem[] = [
  {
    id: 'u1',
    partnerId: 'p1',
    partnerName: 'Garfo e Bombacha',
    partnerLogoUrl: '/logos/garfo-bombacha.png',
    categoryLabel: 'Gastronomia',
    benefitTitle: 'Jantar com Show',
    usedAt: '2026-01-10T21:15:00-03:00',
    savedCents: 20000,
    rating: 5,
    reviewId: 'r1',
  },
  {
    id: 'u2',
    partnerId: 'p2',
    partnerName: 'Lunkes',
    partnerLogoUrl: '/logos/lunkes.png',
    categoryLabel: 'Serviços',
    benefitTitle: 'Transfer (ida e volta) Porto Alegre x Gramado',
    usedAt: '2026-01-08T10:30:00-03:00',
    savedCents: 13000,
    rating: 4,
    reviewId: 'r2',
  },
  {
    id: 'u3',
    partnerId: 'p2',
    partnerName: 'Lunkes',
    partnerLogoUrl: '/logos/lunkes.png',
    categoryLabel: 'Serviços',
    benefitTitle: 'Tour Itaimbézinho',
    usedAt: '2026-01-05T09:10:00-03:00',
    savedCents: 20000,
    rating: null,
    reviewId: null,
  },
];
