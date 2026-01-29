'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function AdminSimplePage({
  title,
  description,
  icon,
  backHref = '/admin',
  backLabel = 'Dashboard',
}: {
  title: string;
  description: string;
  icon: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {icon}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>

        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          title={`Voltar para ${backLabel}`}
        >
          {backLabel} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Total no período" value="—" />
        <Card title="Itens" value="—" />
        <Card title="Status" value="—" />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Conteúdo</div>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Esta tela será implementada na próxima etapa.
        </div>

        <div className="mt-4 h-40 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30" />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">Em breve</div>
    </div>
  );
}
