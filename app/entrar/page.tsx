// app/entrar/page.tsx
import { Suspense } from 'react';
import EntrarClient from './EntrarClient';

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-4 py-10">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Carregando…</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-11 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/50" />
              <div className="h-11 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/50" />
              <div className="h-11 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/50" />
              <div className="pt-2">
                <div className="h-11 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/50" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <EntrarClient />
    </Suspense>
  );
}
