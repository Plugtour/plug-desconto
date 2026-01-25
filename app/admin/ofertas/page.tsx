// app/admin/ofertas/page.tsx
import { Suspense } from 'react';
import AdminOfertasClient from './AdminOfertasClient';

export const dynamic = 'force-dynamic';

export default function AdminOfertasPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Carregando...</div>}>
      <AdminOfertasClient />
    </Suspense>
  );
}
