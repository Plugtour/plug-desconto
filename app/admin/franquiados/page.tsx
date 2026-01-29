import { Store } from 'lucide-react';
import { Header, Kpi, Placeholder } from '../_components/AdminPageUI';

export default function AdminFranquiadosPage() {
  return (
    <div className="w-full space-y-6">
      <Header title="Franquiados" description="Gestão de unidades e operação regional." />

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi title="Unidades ativas" value="—" />
        <Kpi title="Faturamento total" value="R$ —" />
        <Kpi title="Performance média" value="—" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-medium">Unidades cadastradas</div>
        <Placeholder height={240} />
      </div>
    </div>
  );
}
