import { headers } from 'next/headers';
import { getDefaultTenant, listTenants, resolveTenantByHost, type Tenant } from '@/config/tenants';

export async function getTenantFromRequest(): Promise<Tenant> {
  const h = await headers();

  const id = h.get('x-tenant-id');
  if (id) {
    const found = listTenants().find((t) => t.id === id);
    if (found) return found;
  }

  const host = h.get('host') || '';
  if (host) return resolveTenantByHost(host);

  return getDefaultTenant();
}
