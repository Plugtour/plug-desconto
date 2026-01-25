'use client';

// app/admin/_components/AdminDataProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { OfferStatus } from '../_data/adminMappers';

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
  status: 'publicado' | 'rascunho' | 'pausado' | 'arquivado';
  atualizadoEm?: string;
};

type AdminAffiliateRow = {
  id: string;
  nome: string;
  status: 'publicado' | 'rascunho' | 'pausado' | 'arquivado';
  atualizadoEm?: string;
};

type AdminDataContextValue = {
  offers: AdminOfferRow[];
  partners: AdminPartnerRow[];
  affiliates: AdminAffiliateRow[];
  refreshOffers: () => Promise<void>;
  setOfferStatus: (id: string, status: OfferStatus) => void; // mantém compatível com sua tela
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
  // IMPORTANTE: manter arrays para o dashboard não quebrar (partners/affiliates)
  const [partners] = useState<AdminPartnerRow[]>([]);
  const [affiliates] = useState<AdminAffiliateRow[]>([]);

  const [loaded, setLoaded] = useState(false);

  const refreshOffers = async () => {
    const res = await fetch('/api/admin/offers', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || 'Falha ao carregar ofertas');
    }

    const items = Array.isArray(data?.items) ? data.items : [];
    setOffers(items.map(mapDbOfferToRow));
  };

  useEffect(() => {
    if (loaded) return;
    setLoaded(true);
    refreshOffers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Mantém assinatura SEM async pra não quebrar sua página atual
  const setOfferStatus = (id: string, status: OfferStatus) => {
    // otimista
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    // persiste no banco
    (async () => {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      // se falhar ou sucesso, garante sincronizar
      await refreshOffers().catch(() => {});
      if (!res.ok) {
        // opcional: aqui você pode disparar toast se quiser (mas não mexo no layout)
      }
    })();
  };

  const value = useMemo(
    () => ({ offers, partners, affiliates, refreshOffers, setOfferStatus }),
    [offers, partners, affiliates]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData deve ser usado dentro de AdminDataProvider');
  return ctx;
}
