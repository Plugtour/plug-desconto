// app/admin/afiliados/page.tsx
import { Suspense } from 'react';
import AdminAfiliadosClient from './AdminAfiliadosClient';

export const dynamic = 'force-dynamic';

export default function AdminAfiliadosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Carregando...</div>}>
      <AdminAfiliadosClient />
    </Suspense>
  );
}
