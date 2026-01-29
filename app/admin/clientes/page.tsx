import { Users2 } from 'lucide-react';
import { Header, Kpi, Placeholder } from '../_components/AdminPageUI';

export default function AdminClientesPage() {
  return (
    <div className="w-full space-y-6">
      <Header  title="Clientes" description="Base de usuários e histórico de consumo." />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Clientes ativos" value="—" />
        <Kpi title="Novos clientes" value="—" />
        <Kpi title="Recorrência" value="— %" />
        <Kpi title="Avaliações" value="—" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Lista de clientes</div>
        <Placeholder height={240} />
      </div>
    </div>
  );
}
