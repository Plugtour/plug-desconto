import { Settings } from 'lucide-react';
import { Header, Box } from '../_components/AdminPageUI';

export default function AdminConfiguracoesPage() {
  return (
    <div className="w-full space-y-6">
      <Header title="Configurações" description="Controle estrutural da plataforma." />

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="Destinos" desc="Gerenciar cidades e regiões disponíveis." />
        <Box title="Categorias" desc="Tipos de ofertas e serviços." />
        <Box title="Regras e comissões" desc="Percentuais, repasses e regras de exibição." />
        <Box title="Acessos" desc="Perfis e permissões do painel administrativo." />
      </div>
    </div>
  );
}
