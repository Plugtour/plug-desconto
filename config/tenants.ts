export type Tenant = {
  id: string;
  name: string;
  shortName: string;
  themeColor: string;
  domains: string[];
  subdomains: string[];
  default?: boolean;
};

const TENANTS: Tenant[] = [
  {
    id: 'serra-gaucha',
    name: 'Plug Desconto Serra Gaúcha',
    shortName: 'Serra Gaúcha',
    themeColor: '#0ea5e9',
    domains: [],
    subdomains: ['serra', 'serragaucha'],
    default: true,
  },
  {
    id: 'gramado',
    name: 'Plug Desconto Gramado',
    shortName: 'Gramado',
    themeColor: '#22c55e',
    domains: [],
    subdomains: ['gramado'],
  },
  {
    id: 'canela',
    name: 'Plug Desconto Canela',
    shortName: 'Canela',
    themeColor: '#a855f7',
    domains: [],
    subdomains: ['canela'],
  },
];

export function getDefaultTenant() {
  return TENANTS.find(t => t.default) || TENANTS[0];
}

function stripPort(host: string) {
  return host.split(':')[0];
}

export function resolveTenantByHost(host: string) {
  const h = stripPort(host);

  for (const t of TENANTS) {
    if (t.domains.includes(h)) return t;
  }

  const parts = h.split('.');
  if (parts.length > 2) {
    const sub = parts[0];
    const found = TENANTS.find(t => t.subdomains.includes(sub));
    if (found) return found;
  }

  return getDefaultTenant();
}

export function listTenants() {
  return TENANTS;
}
