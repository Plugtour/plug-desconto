import { BarChart3 } from 'lucide-react';
import { Header, Box, Placeholder } from '../_components/AdminPageUI';

export default function AdminRelatoriosPage() {
  return (
    <div className="w-full space-y-6">
      <Header title="Relatórios" description="Análises para decisões e acompanhamento de performance." />

      <div className="grid gap-4 md:grid-cols-3">
        <Box title="Vendas por período" desc="Comparação diária, semanal e mensal." />
        <Box title="Desempenho por parceiro" desc="Ranking e participação no faturamento." />
        <Box title="Conversões" desc="Visitas x cliques x compras." />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Área de gráficos</div>
        <Placeholder height={260} />
      </div>
    </div>
  );
}
