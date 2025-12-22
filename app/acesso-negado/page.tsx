import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acesso negado | Plug Desconto',
  description:
    'Para liberar vouchers e usar os benefícios, você precisa estar logado como usuário com plano ativo.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AcessoNegadoPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="space-y-4">
        <div className="text-5xl font-extrabold text-zinc-600">Acesso negado</div>

        <h1 className="text-xl font-bold text-zinc-50">
          Você precisa de um plano ativo para ver o voucher
        </h1>

        <p className="max-w-md text-sm leading-relaxed text-zinc-300">
          Este benefício pode ser visualizado, mas o voucher só aparece para usuários com plano ativo.
          Entre com sua conta (modo usuário) e ative o plano para liberar o código.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/entrar"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
          >
            Entrar / Ativar plano
          </Link>

          <Link
            href="/ofertas"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-900"
          >
            Ver outras ofertas
          </Link>
        </div>
      </div>
    </main>
  );
}
