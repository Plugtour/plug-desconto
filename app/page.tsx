// app/page.tsx
import Link from 'next/link';
import { getTenantFromRequest } from '@/lib/tenant';
import { getSession } from '@/lib/session';
import { apiGetOffers } from '@/lib/api';
import { benefitUrl } from '@/lib/urls';

export default async function HomePage() {
  const tenant = await getTenantFromRequest();
  const session = await getSession();

  // Pega algumas ofertas para mostrar na Home (destaques)
  const offers = await apiGetOffers();

  // Ajuste simples: mostra só as primeiras
  const featured = offers.slice(0, 6);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-50">Plug Desconto</h1>
        <p className="text-sm text-zinc-400">
          Benefícios e descontos em {tenant?.name ?? 'sua região'}
        </p>

        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400">Perfil:</span>
            <strong className="text-zinc-50">{session.role}</strong>
            <span className="mx-2 text-zinc-700">•</span>
            <span className="text-zinc-400">Plano ativo:</span>
            <strong className="text-zinc-50">
              {session.planActive ? 'Sim' : 'Não'}
            </strong>
          </div>

          {!(session.role === 'user' && session.planActive) && (
            <p className="mt-2 text-zinc-400">
              Para liberar vouchers, acesse como usuário com plano ativo.
            </p>
          )}
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-50">Destaques</h2>

          <Link
            href="/ofertas"
            className="text-sm font-semibold text-zinc-200 hover:text-zinc-50"
          >
            Ver todas
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            Nenhuma oferta disponível no momento.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {featured.map((offer) => {
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
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-base font-semibold text-zinc-50">Categorias</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Você pode filtrar as ofertas por categoria na página de ofertas.
        </p>

        <div className="mt-4">
          <Link
            href="/ofertas"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Ir para ofertas
          </Link>
        </div>
      </section>
    </div>
  );
}
