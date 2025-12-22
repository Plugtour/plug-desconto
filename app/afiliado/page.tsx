import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AffiliatePanel() {
  try {
    await requireRole(['affiliate']);

    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Painel do Afiliado</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          Aqui vão entrar: links/códigos, vendas, comissões, recebíveis.
        </div>
      </div>
    );
  } catch (err) {
    if (err instanceof AccessDeniedError) redirect('/acesso-negado');
    throw err;
  }
}
