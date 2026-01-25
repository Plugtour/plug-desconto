// app/admin/_data/adminMock.ts
export type AdminStatus = "rascunho" | "publicado" | "pausado" | "arquivado";

export type AdminOffer = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  cidade: string;
  status: AdminStatus;
  destaque?: boolean;
  cliquesMes?: number;
  conversoesMes?: number;
  createdAt: string; // ISO
};

export type AdminPartner = {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  status: AdminStatus;
  ofertasAtivas: number;
  createdAt: string; // ISO
};

export type AdminAffiliate = {
  id: string;
  nome: string;
  canal: "Instagram" | "WhatsApp" | "Indicação" | "Tráfego" | "Outro";
  status: AdminStatus;
  leadsMes?: number;
  vendasMes?: number;
  createdAt: string; // ISO
};

export const adminMock = {
  meta: {
    updatedAt: new Date().toISOString(),
  },

  // =========================
  // DASHBOARD (mock mensal)
  // =========================
  dashboard: {
    months: [
      { label: "Ago", value: 1200 },
      { label: "Set", value: 1450 },
      { label: "Out", value: 1600 },
      { label: "Nov", value: 1750 },
      { label: "Dez", value: 2100 },
      { label: "Jan", value: 1950 },
    ],
  },

  // =========================
  // OFERTAS
  // =========================
  offers: [
    {
      id: "of_001",
      titulo: "Rodízio Premium com 20% OFF",
      parceiro: "Churrascaria Fogo & Brasa",
      categoria: "Gastronomia",
      cidade: "Gramado",
      status: "publicado",
      destaque: true,
      cliquesMes: 342,
      conversoesMes: 38,
      createdAt: "2025-12-03T14:10:00.000Z",
    },
    {
      id: "of_002",
      titulo: "Café Colonial com Reserva",
      parceiro: "Casa do Café Colonial",
      categoria: "Gastronomia",
      cidade: "Canela",
      status: "pausado",
      destaque: false,
      cliquesMes: 120,
      conversoesMes: 9,
      createdAt: "2025-12-10T10:30:00.000Z",
    },
    {
      id: "of_003",
      titulo: "Museu + Foto de Brinde",
      parceiro: "Museu Interativo",
      categoria: "Atrações",
      cidade: "Gramado",
      status: "rascunho",
      destaque: false,
      cliquesMes: 0,
      conversoesMes: 0,
      createdAt: "2026-01-05T09:05:00.000Z",
    },
    {
      id: "of_004",
      titulo: "Transfer Aeroporto (ida) com desconto",
      parceiro: "Transporte Serra",
      categoria: "Transfers",
      cidade: "Gramado",
      status: "arquivado",
      destaque: false,
      cliquesMes: 22,
      conversoesMes: 1,
      createdAt: "2025-11-18T18:40:00.000Z",
    },
  ] as AdminOffer[],

  // =========================
  // PARCEIROS
  // =========================
  partners: [
    {
      id: "pa_001",
      nome: "Churrascaria Fogo & Brasa",
      categoria: "Gastronomia",
      cidade: "Gramado",
      status: "publicado",
      ofertasAtivas: 2,
      createdAt: "2025-10-21T12:00:00.000Z",
    },
    {
      id: "pa_002",
      nome: "Museu Interativo",
      categoria: "Atrações",
      cidade: "Gramado",
      status: "pausado",
      ofertasAtivas: 1,
      createdAt: "2025-11-04T12:00:00.000Z",
    },
    {
      id: "pa_003",
      nome: "Casa do Café Colonial",
      categoria: "Gastronomia",
      cidade: "Canela",
      status: "publicado",
      ofertasAtivas: 1,
      createdAt: "2025-12-01T12:00:00.000Z",
    },
  ] as AdminPartner[],

  // =========================
  // AFILIADOS
  // =========================
  affiliates: [
    {
      id: "af_001",
      nome: "Vitória Almeida",
      canal: "Instagram",
      status: "publicado",
      leadsMes: 88,
      vendasMes: 14,
      createdAt: "2025-09-12T12:00:00.000Z",
    },
    {
      id: "af_002",
      nome: "Lucas Pereira",
      canal: "WhatsApp",
      status: "publicado",
      leadsMes: 54,
      vendasMes: 9,
      createdAt: "2025-10-08T12:00:00.000Z",
    },
    {
      id: "af_003",
      nome: "Agência Parceira X",
      canal: "Indicação",
      status: "rascunho",
      leadsMes: 0,
      vendasMes: 0,
      createdAt: "2026-01-11T12:00:00.000Z",
    },
  ] as AdminAffiliate[],
};

// =========================
// HELPERS (pra facilitar)
// =========================
export function countByStatus<T extends { status: AdminStatus }>(items: T[]) {
  return items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      rascunho: 0,
      publicado: 0,
      pausado: 0,
      arquivado: 0,
    } as Record<AdminStatus, number>
  );
}

export function filterByStatus<T extends { status: AdminStatus }>(
  items: T[],
  status: AdminStatus | "todos"
) {
  if (status === "todos") return items;
  return items.filter((i) => i.status === status);
}

export function searchIn<T>(items: T[], q: string, pick: (item: T) => string[]) {
  const query = q.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) =>
    pick(item)
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
}
