'use client';

export default function EntrarPage() {
  async function login(role: string, planActive: boolean, userName?: string) {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role, planActive, userName }),
    });

    window.location.href = '/';
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="text-sm text-zinc-300">
        Login simples para testes (base técnica). Depois a gente troca por login real.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:bg-zinc-800"
          onClick={() => login('user', true, 'Assinante')}
          type="button"
        >
          <div className="font-semibold">Entrar como Usuário (plano ativo)</div>
          <div className="text-xs text-zinc-400">Pode usar benefícios</div>
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:bg-zinc-800"
          onClick={() => login('user', false, 'Usuário sem plano')}
          type="button"
        >
          <div className="font-semibold">Entrar como Usuário (sem plano)</div>
          <div className="text-xs text-zinc-400">Vê tudo, mas não usa</div>
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:bg-zinc-800"
          onClick={() => login('partner', true, 'Parceiro')}
          type="button"
        >
          <div className="font-semibold">Entrar como Parceiro</div>
          <div className="text-xs text-zinc-400">Painel do parceiro</div>
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:bg-zinc-800"
          onClick={() => login('affiliate', true, 'Afiliado')}
          type="button"
        >
          <div className="font-semibold">Entrar como Afiliado</div>
          <div className="text-xs text-zinc-400">Painel do afiliado</div>
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:bg-zinc-800"
          onClick={() => login('admin', true, 'Master')}
          type="button"
        >
          <div className="font-semibold">Entrar como Master</div>
          <div className="text-xs text-zinc-400">Admin geral</div>
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-left hover:bg-zinc-900"
          onClick={logout}
          type="button"
        >
          <div className="font-semibold">Sair (voltar para visitante)</div>
          <div className="text-xs text-zinc-400">Remove cookie</div>
        </button>
      </div>
    </div>
  );
}
