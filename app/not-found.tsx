import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Página não encontrada | Plug Desconto',
  },
  description:
    'A página que você tentou acessar não existe ou não está mais disponível no Plug Desconto.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="space-y-4">
        <div className="text-6xl font-extrabold text-zinc-600">404</div>

        <h1 className="text-2xl font-bold text-zinc-50">Página não encontrada</h1>

        <p className="max-w-md text-sm leading-relaxed text-zinc-300">
          O link que você acessou não existe ou o benefício não está mais disponível.
          Isso pode acontecer se o endereço estiver incorreto ou se a oferta foi removida.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
          >
            Voltar para a Home
          </Link>

          <Link
            href="/ofertas"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-900"
          >
            Ver ofertas disponíveis
          </Link>
        </div>
      </div>
    </main>
  );
}
