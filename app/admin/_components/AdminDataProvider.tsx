'use client';

// app/admin/_components/AdminDataProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  OfferStatus,
  AffiliateStatus,
  PartnerStatus,
  AdminPartnerRow as MappedPartnerRow,
  AdminAffiliateRow as MappedAffiliateRow,
} from '../_data/adminMappers';
import { mapPartner, mapAffiliate, mapDbOfferToAdminRow } from '../_data/adminMappers';

type AdminOfferRow = {
  id: string;
  titulo: string;
  parceiro: string;
  categoria: string;
  status: OfferStatus;
  atualizadoEm: string;
  imageUrl?: string | null;
};

type AdminPartnerRow = MappedPartnerRow;
type AdminAffiliateRow = MappedAffiliateRow;

// ✅ sessão para o AdminShell mostrar "Logado como"
type SessionRole = 'guest' | 'user' | 'affiliate' | 'partner' | 'master';
type Session = {
  role: SessionRole;
  planActive: boolean;
  userName?: string;
};

type CreatePartnerInput = {
  nome: string;
  categoria: string;
  cidade: string;
  whatsapp: string;
  instagram?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  status: PartnerStatus;
  observacoes?: string | null;
};

type UpdatePartnerInput = {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  whatsapp: string;
  instagram?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  status: PartnerStatus;
  observacoes?: string | null;
};

type AdminDataContextValue = {
  session: Session | null;

  offers: AdminOfferRow[];
  partners: AdminPartnerRow[];
  affiliates: AdminAffiliateRow[];

  refreshOffers: () => Promise<void>;
  refreshSession: () => Promise<void>;

  setOfferStatus: (id: string, status: OfferStatus) => Promise<void>;
  deleteOfferForever: (id: string) => Promise<void>;
  emptyOffersTrash: () => Promise<void>;

  setAffiliateStatus: (id: string, status: AffiliateStatus) => void;
  setPartnerStatus: (id: string, status: PartnerStatus) => void;

  emptyPartnersTrash: () => void;
  emptyAffiliatesTrash: () => void;

  /** Recarrega listas locais (sem mock) */
  refreshMockLists: () => void;

  createPartner: (input: CreatePartnerInput) => AdminPartnerRow;

  /** ✅ editar parceiro (persistente) */
  updatePartner: (input: UpdatePartnerInput) => AdminPartnerRow | null;

  /** ✅ excluir definitivo (remove do localStorage) */
  deletePartnerForever: (id: string) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: 'no-store', ...init });
  const data = await res.json().catch(() => null);
  return { res, data };
}

const LS_PARTNERS_KEY = 'pd_admin_partners_v1';
const LS_AFFILIATES_KEY = 'pd_admin_affiliates_v1';

function safeParseArray(raw: string | null) {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function writeLsArray(key: string, arr: any[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(arr));
}

function updateLsRowStatus(key: string, id: string, status: string) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(key);
  const arr = safeParseArray(raw);

  let changed = false;
  const next = arr.map((p: any) => {
    if (String(p?.id ?? '') !== id) return p;
    changed = true;
    return { ...p, status, updatedAt: new Date().toISOString() };
  });

  if (changed) window.localStorage.setItem(key, JSON.stringify(next));
}

function removeFromLsByStatus(key: string, status: string) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(key);
  const arr = safeParseArray(raw);
  const next = arr.filter((x: any) => String(x?.status ?? '').toLowerCase() !== String(status).toLowerCase());
  window.localStorage.setItem(key, JSON.stringify(next));
}

function removeFromLsById(key: string, id: string) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(key);
  const arr = safeParseArray(raw);
  const next = arr.filter((x: any) => String(x?.id ?? '') !== id);
  window.localStorage.setItem(key, JSON.stringify(next));
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

  const refreshOffers = async () => {
    const { res, data } = await fetchJson('/api/admin/offers');

    if (!res.ok) {
      const msg = data?.error ? String(data.error) : 'Falha ao carregar ofertas';
      throw new Error(msg);
    }

    const items = Array.isArray(data?.items) ? data.items : [];
    setOffers(items.map(mapDbOfferToAdminRow));
  };

  /**
   * ✅ IMPORTANTE:
   * Parceiros e afiliados vêm SOMENTE do localStorage.
   */
  const refreshMockLists = () => {
    let lsPartners: AdminPartnerRow[] = [];
    let lsAffiliates: AdminAffiliateRow[] = [];

    if (typeof window !== 'undefined') {
      const rawP = window.localStorage.getItem(LS_PARTNERS_KEY);
      const rawA = window.localStorage.getItem(LS_AFFILIATES_KEY);

      lsPartners = safeParseArray(rawP).map((p) => mapPartner(p)) as AdminPartnerRow[];
      lsAffiliates = safeParseArray(rawA).map((a) => mapAffiliate(a)) as AdminAffiliateRow[];
    }

    setPartners(lsPartners);
    setAffiliates(lsAffiliates);
  };

  useEffect(() => {
    if (loaded) return;
    setLoaded(true);

    refreshMockLists();
    refreshSession().catch(() => {});
    refreshOffers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // ✅ Soft delete / status update no banco
  const setOfferStatus = async (id: string, status: OfferStatus) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    try {
      const { res, data } = await fetchJson(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const msg = data?.error ? String(data.error) : 'Falha ao atualizar status';
        throw new Error(msg);
      }
    } finally {
      await refreshOffers().catch(() => {});
    }
  };

  // ✅ Delete definitivo (só para status=lixeira)
  const deleteOfferForever = async (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));

    try {
      const { res, data } = await fetchJson(`/api/admin/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const msg = data?.error ? String(data.error) : 'Falha ao excluir definitivamente';
        throw new Error(msg);
      }
    } finally {
      await refreshOffers().catch(() => {});
    }
  };

  // ✅ Esvaziar lixeira (deleteMany no backend)
  const emptyOffersTrash = async () => {
    try {
      const { res, data } = await fetchJson('/api/admin/offers/empty-trash', { method: 'DELETE' });
      if (!res.ok) {
        const msg = data?.error ? String(data.error) : 'Falha ao esvaziar lixeira';
        throw new Error(msg);
      }
    } finally {
      await refreshOffers().catch(() => {});
    }
  };

  const setAffiliateStatus = (id: string, status: AffiliateStatus) => {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    updateLsRowStatus(LS_AFFILIATES_KEY, id, status);
  };

  const setPartnerStatus = (id: string, status: PartnerStatus) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    updateLsRowStatus(LS_PARTNERS_KEY, id, status);
  };

  const emptyPartnersTrash = () => {
    setPartners((prev) => prev.filter((p) => p.status !== 'lixeira'));
    removeFromLsByStatus(LS_PARTNERS_KEY, 'lixeira');
  };

  const emptyAffiliatesTrash = () => {
    setAffiliates((prev) => prev.filter((a) => a.status !== 'lixeira'));
    removeFromLsByStatus(LS_AFFILIATES_KEY, 'lixeira');
  };

  const createPartner = (input: CreatePartnerInput) => {
    const id = makeId('partner');
    const now = new Date().toISOString();

    const payload: any = {
      id,
      nome: String(input.nome ?? '').trim(),
      categoria: String(input.categoria ?? '').trim(),
      cidade: String(input.cidade ?? '').trim(),
      whatsapp: String(input.whatsapp ?? '').trim(),
      instagram: (input.instagram ?? '').toString().trim() || null,

      imageUrl: (input.imageUrl ?? '').toString().trim() || null,
      images: Array.isArray(input.images) && input.images.length ? input.images : null,

      status: input.status ?? 'rascunho',
      observacoes: (input.observacoes ?? '').toString().trim() || null,

      ofertasAtivas: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_PARTNERS_KEY);
      const arr = safeParseArray(raw);
      writeLsArray(LS_PARTNERS_KEY, [payload, ...arr]);
    }

    const mapped = mapPartner(payload) as AdminPartnerRow;
    setPartners((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);

    return mapped;
  };

  const updatePartner = (input: UpdatePartnerInput) => {
    const id = String(input.id ?? '').trim();
    if (!id) return null;

    const now = new Date().toISOString();

    // atualiza LS (fonte de verdade)
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_PARTNERS_KEY);
      const arr = safeParseArray(raw);

      const next = arr.map((p: any) => {
        if (String(p?.id ?? '') !== id) return p;

        return {
          ...p,
          nome: String(input.nome ?? '').trim(),
          categoria: String(input.categoria ?? '').trim(),
          cidade: String(input.cidade ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          instagram: (input.instagram ?? '').toString().trim() || null,
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          images: Array.isArray(input.images) && input.images.length ? input.images : null,
          status: input.status ?? p?.status ?? 'rascunho',
          observacoes: (input.observacoes ?? '').toString().trim() || null,
          updatedAt: now,
        };
      });

      writeLsArray(LS_PARTNERS_KEY, next);
    }

    // atualiza UI sem esperar reload
    let mapped: AdminPartnerRow | null = null;
    setPartners((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const payload: any = {
          ...p,
          nome: String(input.nome ?? '').trim(),
          categoria: String(input.categoria ?? '').trim(),
          cidade: String(input.cidade ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          instagram: (input.instagram ?? '').toString().trim() || null,
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          images: Array.isArray(input.images) && input.images.length ? input.images : null,
          status: input.status ?? p.status,
          observacoes: (input.observacoes ?? '').toString().trim() || null,
          updatedAt: now,
        };
        const m = mapPartner(payload) as AdminPartnerRow;
        mapped = m;
        return m;
      });
      return next;
    });

    return mapped;
  };

  const deletePartnerForever = (id: string) => {
    const rid = String(id ?? '').trim();
    if (!rid) return;

    setPartners((prev) => prev.filter((p) => p.id !== rid));
    removeFromLsById(LS_PARTNERS_KEY, rid);
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
      deleteOfferForever,
      emptyOffersTrash,

      setAffiliateStatus,
      setPartnerStatus,

      emptyPartnersTrash,
      emptyAffiliatesTrash,

      refreshMockLists,

      createPartner,
      updatePartner,
      deletePartnerForever,
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
