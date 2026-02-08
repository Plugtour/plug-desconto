// caminho: app/afiliado/cupons/page.tsx

import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CuponsClient from './CuponsClient';

export default async function AfiliadoCuponsPage() {
  try {
    await requireRole(['affiliate', 'master']);
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      redirect('/acesso-negado');
    }
    throw err;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cupons</h1>
          <div className="text-sm text-zinc-400">Crie e gerencie seus cupons de desconto</div>
        </div>

        <a
          href="#criar-cupom"
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition"
        >
          Criar cupom
        </a>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        Aqui você poderá:
        <ul className="mt-2 list-disc list-inside text-zinc-400 space-y-1">
          <li>Criar cupons personalizados para seus seguidores</li>
          <li>Acompanhar quantidade de usos</li>
          <li>Ativar ou pausar cupons</li>
          <li>Ver vendas associadas a cada cupom</li>
        </ul>
      </div>

      <CuponsClient />
    </div>
  );
}
