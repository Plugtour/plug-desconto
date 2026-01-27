'use client';

// app/admin/_components/AdminDataProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { OfferStatus, AffiliateStatus } from '../_data/adminMappers';
import { adminMock } from '../_data/adminMock';
import { mapPartner, mapAffiliate, mapDbOfferToAdminRow } from '../_data/adminMappers';

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
  whatsapp: string;
  whatsappHref: string;
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
  whatsappHref: string;
  cupom: string;
  canal?: string;
  leadsMes?: number;
  vendasMes?: number;
};

// ✅ sessão para o AdminShell mostrar "Logado como"
type SessionRole = 'guest' | 'user' | 'affiliate' | 'partner' | 'master';
type Session = {
  role: SessionRole;
  planActive: boolean;
  userName?: string;
};

type AdminDataContextValue = {
  session: Session | null;

  offers: AdminOfferRow[];
  partners: AdminPartnerRow[];
  affiliates: AdminAffiliateRow[];

  refreshOffers: () => Promise<void>;
  refreshSession: () => Promise<void>;

  setOfferStatus: (id: string, status: OfferStatus) => void;
  setAffiliateStatus: (id: string, status: AffiliateStatus) => void;
  setPartnerStatus: (id: string, status: PartnerStatus) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json().catch(() => null);
  return { res, data };
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const [offers, setOffers] = useState<AdminOfferRow[]>([]);
  const [partners, setPartners] = useState<AdminPartnerRow[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshSession = async () => {
    const { res, data } = await fetchJson('/api/auth/me');
    if (!res.ok) {
      setSession(null);
      return;
    }
    setSession((data?.session ?? null) as Session | null);
  };

  // Ofertas vêm da API (banco)
  const refreshOffers = async () => {
    const { res, data } = await fetchJson('/api/admin/offers');

    if (!res.ok) {
      const msg = data?.error ? String(data.error) : 'Falha ao carregar ofertas';
      throw new Error(msg);
    }

    const items = Array.isArray(data?.items) ? data.items : [];
    setOffers(items.map(mapDbOfferToAdminRow));
  };

  // Partners/Affiliates vêm do mock (por enquanto)
  const refreshMockLists = () => {
    const nextPartners = (adminMock.partners || []).map((p) => mapPartner(p)) as AdminPartnerRow[];
    const nextAffiliates = (adminMock.affiliates || []).map((a) => mapAffiliate(a)) as AdminAffiliateRow[];

    setPartners(nextPartners);
    setAffiliates(nextAffiliates);
  };

  useEffect(() => {
    if (loaded) return;
    setLoaded(true);

    refreshMockLists();
    refreshSession().catch(() => {});
    refreshOffers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const setOfferStatus = (id: string, status: OfferStatus) => {
    // otimista
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    (async () => {
      try {
        await fetch(`/api/admin/offers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } finally {
        await refreshOffers().catch(() => {});
      }
    })();
  };

  const setAffiliateStatus = (id: string, status: AffiliateStatus) => {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const setPartnerStatus = (id: string, status: PartnerStatus) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const value = useMemo(
    () => ({
      session,

      offers,
      partners,
      affiliates,

      refreshOffers,
      refreshSession,

      setOfferStatus,
      setAffiliateStatus,
      setPartnerStatus,
    }),
    [session, offers, partners, affiliates]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData deve ser usado dentro de AdminDataProvider');
  return ctx;
}
