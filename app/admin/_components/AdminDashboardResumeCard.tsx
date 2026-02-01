'use client';

type ResumeCardProps = {
  totalDownloads: number;
  activeDownloads: number;
  revenueLabel?: string;
  revenueValue: string;
};

export default function AdminDashboardResumeCard({
  totalDownloads,
  activeDownloads,
  revenueLabel = 'Receita estimada',
  revenueValue,
}: ResumeCardProps) {
  const intBR = new Intl.NumberFormat('pt-BR');

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total de downloads</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {intBR.format(totalDownloads)}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Downloads ativos</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {intBR.format(activeDownloads)}
          </p>
        </div>

        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{revenueLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{revenueValue}</p>
        </div>
      </div>
    </div>
  );
}
