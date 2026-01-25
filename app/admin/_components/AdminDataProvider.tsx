'use client';

// app/admin/_components/AdminDataProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { OfferStatus, AffiliateStatus } from '../_data/adminMappers';
import { adminMock } from '../_data/adminMock';
import { mapPartner, mapAffiliate } from '../_data/adminMappers';

type PartnerStatus = 'publicado' | 'rascunho' | 'pausado' | 'arquivado';

type AdminOfferRow = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
};

type AdminPartnerRow = {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  status: PartnerStatus;
  ofertasAtivas: number;
  atualizadoEm: string;
};

type AdminAffiliateRow = {
  id: string;
  nome: string;
  status: PartnerStatus;
  atualizadoEm: string;
  email: string;
  whatsapp: string;
  cupom: string;
  whatsappHref?: string;
  canal?: string;
  leadsMes?: number;
  vendasMes?: number;
};

type AdminDataContextValue = {
  offers: AdminOfferRow[];
  partners: AdminPartnerRow[];
  affiliates: AdminAffiliateRow[];
  refreshOffers: () => Promise<void>;
  setOfferStatus: (id: string, status: OfferStatus) => void;

  // ✅ usado em /admin/afiliados
  setAffiliateStatus: (id: string, status: AffiliateStatus) => void;

  // ✅ usado em /admin/parceiros
  setPartnerStatus: (id: string, status: PartnerStatus) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function formatDateBR(value: string | Date | null | undefined) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function mapDbOfferToRow(db: any): AdminOfferRow {
  return {
    id: String(db?.id ?? ''),
    titulo: String(db?.title ?? ''),
    parceiro: String(db?.partnerName ?? ''),
    categoria: String(db?.categoryId ?? ''),
    status: (db?.status ?? 'rascunho') as OfferStatus,
    atualizadoEm: formatDateBR(db?.updatedAt ?? db?.createdAt),
  };
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [offers, setOffers] = useState<AdminOfferRow[]>([]);
  const [partners, setPartners] = useState<AdminPartnerRow[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateRow[]>([]);

  const [loaded, setLoaded] = useState(false);

  // Ofertas continuam vindo da API (banco)
  const refreshOffers = async () => {
    const res = await fetch('/api/admin/offers', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || 'Falha ao carregar ofertas');
    }

    const items = Array.isArray(data?.items) ? data.items : [];
    setOffers(items.map(mapDbOfferToRow));
  };

  // Partners/Affiliates por enquanto vêm do mock (para não ficar vazio)
  const refreshMockLists = () => {
    const nextPartners = (adminMock.partners || []).map((p) => {
      const m = mapPartner(p) as any;
      return {
        id: String(m.id ?? ''),
        nome: String(m.nome ?? ''),
        categoria: String(m.categoria ?? ''),
        cidade: String(m.cidade ?? ''),
        status: (m.status ?? 'rascunho') as PartnerStatus,
        ofertasAtivas: Number(m.ofertasAtivas ?? 0),
        atualizadoEm: String(m.atualizadoEm ?? '-'),
      } satisfies AdminPartnerRow;
    });

    const nextAffiliates = (adminMock.affiliates || []).map((a) => {
      const m = mapAffiliate(a) as any;
      return {
        id: String(m.id ?? ''),
        nome: String(m.nome ?? ''),
        status: (m.status ?? 'rascunho') as PartnerStatus,
        atualizadoEm: String(m.atualizadoEm ?? '-'),
        email: String(m.email ?? ''),
        whatsapp: String(m.whatsapp ?? ''),
        cupom: String(m.cupom ?? ''),
        whatsappHref: m.whatsappHref ? String(m.whatsappHref) : undefined,
        canal: m.canal ? String(m.canal) : undefined,
        leadsMes: typeof m.leadsMes === 'number' ? m.leadsMes : undefined,
        vendasMes: typeof m.vendasMes === 'number' ? m.vendasMes : undefined,
      } satisfies AdminAffiliateRow;
    });

    setPartners(nextPartners);
    setAffiliates(nextAffiliates);
  };

  useEffect(() => {
    if (loaded) return;
    setLoaded(true);

    refreshMockLists();
    refreshOffers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const setOfferStatus = (id: string, status: OfferStatus) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    (async () => {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      await refreshOffers().catch(() => {});
      if (!res.ok) {
        // opcional: toast
      }
    })();
  };

  // Atualiza status do afiliado (mock/state)
  const setAffiliateStatus = (id: string, status: AffiliateStatus) => {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // ✅ NOVO: atualiza status do parceiro (mock/state)
  const setPartnerStatus = (id: string, status: PartnerStatus) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const value = useMemo(
    () => ({
      offers,
      partners,
      affiliates,
      refreshOffers,
      setOfferStatus,
      setAffiliateStatus,
      setPartnerStatus,
    }),
    [offers, partners, affiliates]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData deve ser usado dentro de AdminDataProvider');
  return ctx;
}
