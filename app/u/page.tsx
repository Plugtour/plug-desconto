import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function UserPanel() {
  let session: Awaited<ReturnType<typeof requireRole>>;

  try {
    session = await requireRole(['user']);
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      redirect('/acesso-negado');
    }
    throw err;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Painel do Usuário</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
        <div>
          <span className="text-zinc-400">Nome:</span> {session.userName ?? '—'}
        </div>
        <div>
          <span className="text-zinc-400">Plano ativo:</span> {session.planActive ? 'Sim' : 'Não'}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        Aqui vão entrar: histórico, economia, favoritos, validade do plano.
      </div>
    </div>
  );
}
