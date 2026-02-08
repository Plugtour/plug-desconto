// caminho: app/afiliado/extrato/page.tsx

import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExtratoClient from './ExtratoClient';

export default async function AfiliadoExtratoPage() {
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
      <div>
        <h1 className="text-2xl font-bold">Extrato</h1>
        <div className="text-sm text-zinc-400">
          Lançamentos do saldo e vendas atribuídas ao seu afiliado
        </div>
      </div>

      <ExtratoClient />
    </div>
  );
}
