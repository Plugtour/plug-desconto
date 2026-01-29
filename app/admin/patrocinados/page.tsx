import { BadgePercent } from 'lucide-react';
import { Header, Kpi, Placeholder } from '../_components/AdminPageUI';

export default function AdminPatrocinadosPage() {
  return (
    <div className="w-full space-y-6">
      <Header
        title="Patrocinados"
        description="Controle de destaque, prioridade e validade de ofertas."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi title="Ativos" value="—" />
        <Kpi title="Cliques" value="—" />
        <Kpi title="Receita" value="R$ —" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Ofertas patrocinadas</div>
        <Placeholder height={240} />
      </div>
    </div>
  );
}
