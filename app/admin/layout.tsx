// app/admin/layout.tsx
import type { ReactNode } from 'react';

import AdminShell from './_components/AdminShell';
import AdminToastProvider from './_components/AdminToastProvider';
import AdminToastHost from './_components/AdminToastHost';
import { AdminDataProvider } from './_components/AdminDataProvider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminToastProvider>
      <AdminDataProvider>
        <AdminShell>{children}</AdminShell>
        <AdminToastHost />
      </AdminDataProvider>
    </AdminToastProvider>
  );
}
