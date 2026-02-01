import Link from 'next/link';

export default function AdminConfiguracoesPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Controle estrutural da plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConfigCard href="/admin/configuracoes/destinos" title="Destinos" desc="Cadastrar e gerenciar cidades/regiões." />
        <ConfigCard href="/admin/configuracoes/categorias" title="Categorias" desc="Cadastrar e gerenciar tipos de oferta." />
        <ConfigCard href="#" title="Regras e comissões" desc="Percentuais, repasses e regras de exibição." disabled />
        <ConfigCard href="#" title="Acessos" desc="Perfis e permissões do painel administrativo." disabled />
      </div>
    </div>
  );
}

function ConfigCard({
  href,
  title,
  desc,
  disabled,
}: {
  href: string;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  const base =
    'rounded-2xl border bg-white p-4 transition dark:bg-zinc-950 ' +
    'border-zinc-200 dark:border-zinc-800';

  if (disabled) {
    return (
      <div className={base + ' opacity-60'}>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-sm text-zinc-500">{desc}</div>
      </div>
    );
  }

  return (
    <Link href={href} className={base + ' hover:bg-zinc-50 dark:hover:bg-zinc-900'}>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-zinc-500">{desc}</div>
    </Link>
  );
}
