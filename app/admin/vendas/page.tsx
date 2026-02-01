import { Header, Kpi, Placeholder } from '../_components/AdminPageUI';

export default function AdminVendasPage() {
  return (
    <div className="w-full space-y-6">
      <Header title="Vendas" description="Acompanhe pedidos, faturamento e conversão." />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi title="Faturamento" value="R$ —" />
        <Kpi title="Pedidos" value="—" />
        <Kpi title="Ticket médio" value="R$ —" />
        <Kpi title="Conversão" value="— %" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Últimas vendas</div>
        <Placeholder height={220} />
      </div>
    </div>
  );
}
