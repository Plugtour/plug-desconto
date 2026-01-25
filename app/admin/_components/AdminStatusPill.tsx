// app/admin/_components/AdminStatusPill.tsx

export type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado';

const BASE_CLASS =
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs';

const MAP: Record<AdminStatus, { label: string; cls: string }> = {
  rascunho: {
    label: 'Rascunho',
    cls: 'bg-zinc-900 text-zinc-200 border-zinc-800',
  },
  publicado: {
    label: 'Publicado',
    cls: 'bg-emerald-950 text-emerald-200 border-emerald-900',
  },
  pausado: {
    label: 'Pausado',
    cls: 'bg-amber-950 text-amber-200 border-amber-900',
  },
  arquivado: {
    label: 'Arquivado',
    cls: 'bg-red-950 text-red-200 border-red-900',
  },
};

export default function AdminStatusPill({
  status,
}: {
  status: AdminStatus;
}) {
  const it = MAP[status] ?? MAP.rascunho;

  return <span className={`${BASE_CLASS} ${it.cls}`}>{it.label}</span>;
}
