// caminho: app/admin/configuracoes/banners/page.tsx

'use client';

import Link from 'next/link';
import AdminBannersClient from './AdminBannersClient';

export default function AdminBannersPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Banners da Home</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Gerencie os banners exibidos na página inicial.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <AdminBannersClient />
      </div>

      <div>
        <Link href="/admin/configuracoes" className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300">
          ← Voltar para Configurações
        </Link>
      </div>
    </div>
  );
}
