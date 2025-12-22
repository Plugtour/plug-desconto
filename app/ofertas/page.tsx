// app/ofertas/page.tsx
import Link from 'next/link';
import { getTenantFromRequest } from '@/lib/tenant';
import { getSession } from '@/lib/session';
import { apiGetOffers } from '@/lib/api';
import { benefitUrl } from '@/lib/urls';

type SearchParams = Promise<{ cat?: string }>;

export default async function OfertasPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const tenant = await getTenantFromRequest();
  const session = await getSession();

  const sp = (await searchParams) ?? {};
  const cat = typeof sp.cat === 'string' ? sp.cat : undefined;

  const canUseBenefits = session.role === 'user' && session.planActive;

  // ✅ vem da API
  const offers = await apiGetOffers(cat);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Ofertas disponíveis</h1>
        <p className="text-sm text-zinc-500">
          Benefícios exclusivos em {tenant?.name ?? 'sua região'}
          {cat ? ` • categoria: ${cat}` : ''}
        </p>
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-400">Perfil:</span>
          <strong className="text-zinc-50">{session.role}</strong>
          <span className="mx-2 text-zinc-700">•</span>
          <span className="text-zinc-400">Plano ativo:</span>
          <strong className="text-zinc-50">
            {session.planActive ? 'Sim' : 'Não'}
          </strong>
        </div>

        {!canUseBenefits && (
          <p className="mt-2 text-zinc-400">
            Para liberar os vouchers, acesse como usuário com plano ativo.
          </p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lista de ofertas</h2>

        <div className="grid gap-3">
          {offers.map((offer) => {
            // ✅ sempre pelo helper oficial
            const href = benefitUrl(offer);

            return (
              <Link
                key={offer.id}
                href={href}
                className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">{offer.partner}</p>
                    <h3 className="truncate text-base font-semibold text-zinc-50">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-300">{offer.benefit}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                      {offer.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
                      Ver
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
