'use client';

// app/entrar/EntrarClient.tsx
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type LoginRole = 'master' | 'partner' | 'affiliate' | 'user' | 'guest';

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : '{}',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error ? String(data.error) : `Erro ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export default function EntrarClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextFromQuery = useMemo(() => (sp.get('next') || '').trim(), [sp]);

  const [loading, setLoading] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const safeNextForRole = (role: LoginRole) => {
    // ✅ só o master pode usar next=/admin
    if (nextFromQuery) {
      const isAdminNext = nextFromQuery.startsWith('/admin');
      if (isAdminNext && role !== 'master') return ''; // ignora
      return nextFromQuery;
    }
    return '';
  };

  const getNextByRole = (role: LoginRole) => {
    const safeNext = safeNextForRole(role);
    if (safeNext) return safeNext;

    if (role === 'master') return '/admin';
    if (role === 'affiliate') return '/afiliado';
    return '/';
  };

  const doLogin = async (role: LoginRole, planActive: boolean, userName: string) => {
    setError(null);
    setLoading(role);

    try {
      await postJson('/api/auth/login', { role, planActive, userName });

      const nextPath = getNextByRole(role);
      router.push(nextPath);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao entrar');
    } finally {
      setLoading(null);
    }
  };

  const doLogout = async () => {
    setError(null);
    setLoading('logout');

    try {
      await postJson('/api/auth/logout');
      router.push('/');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao sair');
    } finally {
      setLoading(null);
    }
  };

  const previewNext = (role: LoginRole) => getNextByRole(role);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Tela simples para testes de acesso.</p>
          {nextFromQuery && (
            <p className="text-xs text-zinc-500">
              next da URL: <span className="font-medium text-zinc-700 dark:text-zinc-300">{nextFromQuery}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => doLogin('master', true, 'Admin Master')}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading === 'master' ? 'Entrando…' : `Entrar como Master (vai para ${previewNext('master')})`}
          </button>

          <button
            type="button"
            disabled={!!loading}
            // ✅ aqui vai um email válido pra bater no cadastro do afiliado
            onClick={() => doLogin('affiliate', true, 'afiliado@teste.com')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
          >
            {loading === 'affiliate'
              ? 'Entrando…'
              : `Entrar como Afiliado (vai para ${previewNext('affiliate')})`}
          </button>

          <button
            type="button"
            disabled={!!loading}
            onClick={() => doLogin('user', true, 'Usuário Teste')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
          >
            {loading === 'user' ? 'Entrando…' : 'Entrar como Usuário (deve negar /admin)'}
          </button>

          <button
            type="button"
            disabled={!!loading}
            onClick={() => doLogin('partner', true, 'Parceiro Teste')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
          >
            {loading === 'partner' ? 'Entrando…' : 'Entrar como Parceiro (deve negar /admin)'}
          </button>

          <div className="pt-2">
            <button
              type="button"
              disabled={!!loading}
              onClick={doLogout}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {loading === 'logout' ? 'Saindo…' : 'Sair (logout)'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
