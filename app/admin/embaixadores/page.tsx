import { UserCircle2 } from 'lucide-react';
import { Header, Kpi, Placeholder } from '../_components/AdminPageUI';

export default function AdminEmbaixadoresPage() {
  return (
    <div className="w-full space-y-6">
      <Header title="Embaixadores" description="Códigos, indicações e comissões." />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Ativos" value="—" />
        <Kpi title="Vendas geradas" value="—" />
        <Kpi title="Comissões" value="R$ —" />
        <Kpi title="Conversão" value="— %" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Embaixadores cadastrados</div>
        <Placeholder height={240} />
      </div>
    </div>
  );
}
