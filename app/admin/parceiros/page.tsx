// app/admin/parceiros/page.tsx
import { Suspense } from 'react';
import AdminParceirosClient from './AdminParceirosClient';

export const dynamic = 'force-dynamic';

export default function AdminParceirosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Carregando...</div>}>
      <AdminParceirosClient />
    </Suspense>
  );
}
