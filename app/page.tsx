// app/page.tsx
import { apiGetOffers } from '@/lib/api';
import HomeScreenClient from './_components/HomeScreenClient';

export default async function HomePage() {
  const offers = await apiGetOffers(); // usa sua API/lib atual

  return (
    <div className="min-h-dvh bg-zinc-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-md px-0 py-0 overflow-x-hidden">
        <HomeScreenClient regionLabel="Serra Gaúcha" offers={offers} />
      </div>
    </div>
  );
}
