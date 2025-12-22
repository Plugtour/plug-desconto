import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/session';
import { generateVoucherCode } from '@/lib/vouchers';
import { apiGetOffer } from '@/lib/api';
import {
  benefitUrl,
  benefitCanonicalUrl,
  benefitPath,
} from '@/lib/urls';

import CopyButton from './CopyButton';

type PageParams = Promise<{ id: string }>;

/* =========================
   Utils
========================= */

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSlugOrId(value: string) {
  return safeDecode(value).trim();
}

function buildSeoDescription(offer: {
  benefit: string;
  partner: string;
  description?: string;
}) {
  const base = `${offer.benefit} em ${offer.partner}.`;
  const extra = (offer.description || '').replace(/\s+/g, ' ').trim();
  const combined = extra ? `${base} ${extra}` : base;
  return combined.length > 160
    ? combined.slice(0, 157).trimEnd() + '...'
    : combined;
}

/* =========================
   SEO
========================= */

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const raw = normalizeSlugOrId(id);

  const offer = await apiGetOffer(raw);

  // ⚠️ não define metadata aqui para deixar o not-found.tsx assumir
  if (!offer) {
    return {};
  }

  const title = `${offer.title} | Plug Desconto`;
  const description = buildSeoDescription(offer);

  const canonicalPath = benefitCanonicalUrl(offer);

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title,
      description,
      siteName: 'Plug Desconto',
      images: [
        { url: '/og.png', width: 1200, height: 630, alt: 'Plug Desconto' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
    robots: { index: true, follow: true },
  };
}

/* =========================
   UI helpers
========================= */

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'available' | 'used';
}) {
  const cls =
    variant === 'used'
      ? 'bg-rose-950/40 text-rose-200 border-rose-900/60'
      : 'bg-emerald-950/40 text-emerald-200 border-emerald-900/60';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          variant === 'used' ? 'bg-rose-400' : 'bg-emerald-400'
        }`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-800 bg-zinc-950 ${className}`}>
      {children}
    </section>
  );
}

/* =========================
   Page
========================= */

export default async function BenefitPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const raw = normalizeSlugOrId(id);
  const rawLower = raw.toLowerCase();

  // oferta vem da API (aceita slug OU id)
  const offer = await apiGetOffer(raw);
  if (!offer) return notFound();

  const safeOffer = offer;

  /* =========================
     Redirect ID antigo → slug
  ========================= */

  const slugLower = (safeOffer.slug || '').toLowerCase().trim();
  const idLower = (safeOffer.id || '').toLowerCase().trim();
  const hasSlug = !!safeOffer.slug;

  const accessedByOldId =
    hasSlug && rawLower === idLower && rawLower !== slugLower;

  if (accessedByOldId) {
    redirect(benefitUrl(safeOffer));
  }

  /* =========================
     Sessão / permissão
  ========================= */

  const session = await getSession();
  const canUseBenefits = session.role === 'user' && session.planActive;

  /* =========================
     Cookie / status
  ========================= */

  const cookieStore = await cookies();
  const usedCookieKey = `pd_offer_used_${safeOffer.id}`;
  const isUsed =
    canUseBenefits && cookieStore.get(usedCookieKey)?.value === '1';

  const voucher = canUseBenefits
    ? generateVoucherCode({
        offerId: safeOffer.id,
        userId: 'user',
      })
    : null;

  async function toggleUsedAction() {
    'use server';

    const s = await getSession();
    if (!(s.role === 'user' && s.planActive)) return;

    const store = await cookies();
    const current = store.get(usedCookieKey)?.value === '1';

    store.set(usedCookieKey, current ? '0' : '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath(benefitPath(safeOffer));
  }

  const canonicalPath = benefitCanonicalUrl(safeOffer);
  const nextUrl = encodeURIComponent(canonicalPath);

  /* =========================
     Render
  ========================= */

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-zinc-400">{safeOffer.category}</div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-zinc-50">
                {safeOffer.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-300">
                Parceiro:{' '}
                <strong className="text-zinc-100">
                  {safeOffer.partner}
                </strong>
              </p>
            </div>

            <Badge variant={isUsed ? 'used' : 'available'}>
              {isUsed ? 'Utilizado' : 'Disponível'}
            </Badge>
          </div>
        </div>

        <Card className="p-4">
          <div className="text-xs text-zinc-400">Benefício</div>
          <div className="mt-1 text-lg font-semibold text-zinc-50">
            {safeOffer.benefit}
          </div>

          {safeOffer.description && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {safeOffer.description}
            </p>
          )}
        </Card>

        {/* =========================
           BLOCO VOUCHER
        ========================= */}

        <Card className="p-4">
          {!canUseBenefits ? (
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                Você pode visualizar este benefício, mas o voucher fica
                disponível apenas para{' '}
                <strong className="text-zinc-100">
                  usuários com plano ativo
                </strong>
                .
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="absolute inset-0 bg-zinc-950/60" />
                <div className="relative">
                  <div className="text-xs text-zinc-400">Código</div>
                  <div className="mt-1 select-none break-all text-2xl font-extrabold tracking-wider text-zinc-50 blur-[6px]">
                    PD-XXXX-XXXX-XXXX
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/entrar?next=${nextUrl}`}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  Entrar para liberar voucher
                </Link>

                <Link
                  href="/ofertas"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
                >
                  Ver outras ofertas
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-zinc-400">Seu voucher</div>
                  <p className="mt-1 text-sm text-zinc-300">
                    Mostre este código ao parceiro.
                  </p>
                </div>
                <Badge variant={isUsed ? 'used' : 'available'}>
                  {isUsed ? 'Utilizado' : 'Disponível'}
                </Badge>
              </div>

              <div className="relative overflow-hidden rounded-2xl border bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-extrabold tracking-wider text-zinc-50">
                    {voucher}
                  </div>
                  <CopyButton value={voucher ?? ''} disabled={isUsed} />
                </div>
              </div>

              <form action={toggleUsedAction}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-emerald-900/60 bg-emerald-950/25 px-4 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-950/40"
                >
                  {isUsed
                    ? 'Desmarcar como utilizado'
                    : 'Marcar como utilizado'}
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
