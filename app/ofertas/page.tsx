// app/ofertas/page.tsx
import Link from 'next/link';
import { getTenantFromRequest } from '@/lib/tenant';
import { getSession } from '@/lib/session';
import { apiGetOffers } from '@/lib/api';
import { benefitUrl } from '@/lib/urls';

type SearchParams = Promise<{ cat?: string; city?: string }>;

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'restaurante', label: 'Restaurantes' },
  { id: 'atracao', label: 'Atrações' },
  { id: 'passeio', label: 'Passeios' },
  { id: 'servico', label: 'Serviços' },
];

const CITIES: { id: string; label: string }[] = [
  { id: 'gramado', label: 'Gramado' },
  { id: 'canela', label: 'Canela' },
  { id: 'nova-petropolis', label: 'Nova Petrópolis' },
  { id: 'bento-goncalves', label: 'Bento Gonçalves' },
];

function normalizeText(v?: string | null) {
  return (v ?? '').toString().trim();
}

function buildQuery(params: { cat?: string; city?: string }) {
  const qs = new URLSearchParams();
  if (params.cat) qs.set('cat', params.cat);
  if (params.city) qs.set('city', params.city);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export default async function OfertasPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const tenant = await getTenantFromRequest();
  const session = await getSession();

  const sp = (await searchParams) ?? {};
  const cat = typeof sp.cat === 'string' ? sp.cat : undefined;
  const city = typeof sp.city === 'string' ? sp.city : undefined;

  const canUseBenefits = session.role === 'user' && session.planActive;

  // ✅ vem da API (mantém como você já tinha)
  // Observação: como não sabemos se apiGetOffers aceita city,
  // filtramos city aqui no front com base no campo offer.city.
  const offersFromApi = await apiGetOffers(cat);

  const offers = offersFromApi.filter((offer: any) => {
    if (!city) return true;
    const offerCity = normalizeText(offer?.city).toLowerCase();
    return offerCity === city.toLowerCase();
  });

  const catLabel =
    cat ? CATEGORIES.find((c) => c.id === cat)?.label ?? cat : undefined;
  const cityLabel =
    city ? CITIES.find((c) => c.id === city)?.label ?? city : undefined;

  const hasFilters = Boolean(cat || city);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">
              Ofertas disponíveis
            </h1>
            <p className="text-sm text-zinc-400">
              Benefícios exclusivos em {tenant?.name ?? 'sua região'}
              {catLabel ? ` • categoria: ${catLabel}` : ''}
              {cityLabel ? ` • cidade: ${cityLabel}` : ''}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Voltar
          </Link>
        </div>
      </header>

      {/* Sessão / Plano (mantido) */}
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

      {/* Filtros */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-50">Filtros</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Selecione categoria e cidade para refinar a lista.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">
                Categorias
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/ofertas${buildQuery({ city })}`}
                  className={[
                    'h-10 rounded-full border px-4 text-sm transition',
                    !cat
                      ? 'border-zinc-200 bg-zinc-200 text-zinc-950'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800',
                  ].join(' ')}
                >
                  Todas
                </Link>

                {CATEGORIES.map((c) => {
                  const active = cat === c.id;
                  return (
                    <Link
                      key={c.id}
                      href={`/ofertas${buildQuery({ cat: c.id, city })}`}
                      className={[
                        'h-10 rounded-full border px-4 text-sm transition',
                        active
                          ? 'border-zinc-200 bg-zinc-200 text-zinc-950'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800',
                      ].join(' ')}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Cidades</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/ofertas${buildQuery({ cat })}`}
                  className={[
                    'h-10 rounded-full border px-4 text-sm transition',
                    !city
                      ? 'border-zinc-200 bg-zinc-200 text-zinc-950'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800',
                  ].join(' ')}
                >
                  Todas
                </Link>

                {CITIES.map((c) => {
                  const active = city === c.id;
                  return (
                    <Link
                      key={c.id}
                      href={`/ofertas${buildQuery({ cat, city: c.id })}`}
                      className={[
                        'h-10 rounded-full border px-4 text-sm transition',
                        active
                          ? 'border-zinc-200 bg-zinc-200 text-zinc-950'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800',
                      ].join(' ')}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {hasFilters ? (
              <div className="pt-1">
                <Link
                  href="/ofertas"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  Limpar filtros
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-50">Lista de ofertas</h2>
          <span className="text-sm text-zinc-400">
            {offers.length} resultado(s)
          </span>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            Nenhuma oferta encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-3">
            {offers.map((offer: any) => {
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
    </div>
  );
}
