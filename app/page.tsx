// app/page.tsx
import { apiGetOffers } from '@/lib/api';
import HomeScreenClient from './_components/HomeScreenClient';

export default async function HomePage() {
  const offers = await apiGetOffers(); // usa sua API/lib atual

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="mx-auto w-full max-w-md px-0 py-0">
        <HomeScreenClient regionLabel="Serra Gaúcha" offers={offers} />
      </div>
    </div>
  );
}
