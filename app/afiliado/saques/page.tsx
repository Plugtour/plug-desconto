// caminho: app/afiliado/saques/page.tsx

import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SaquesClient from './SaquesClient';

export default async function AfiliadoSaquesPage() {
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
        <h1 className="text-2xl font-bold">Saques</h1>
        <div className="text-sm text-zinc-400">Solicite seu saque total, parcial ou por venda.</div>
      </div>

      <SaquesClient />
    </div>
  );
}
