'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  OfferStatus,
  AffiliateStatus,
  PartnerStatus,
  AmbassadorStatus,
  FranchiseeStatus,
  AdminPartnerRow as MappedPartnerRow,
  AdminAffiliateRow as MappedAffiliateRow,
  AdminAmbassadorRow as MappedAmbassadorRow,
  AdminFranchiseeRow as MappedFranchiseeRow,
} from '../_data/adminMappers';

import { mapPartner, mapAffiliate, mapAmbassador, mapFranchisee, mapDbOfferToAdminRow } from '../_data/adminMappers';

type AdminStatus = 'rascunho' | 'publicado' | 'pausado' | 'arquivado' | 'lixeira';

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
type AdminAmbassadorRow = MappedAmbassadorRow;
type AdminFranchiseeRow = MappedFranchiseeRow;

type AdminDestinoRow = {
  id: string;
  nome: string;
  slug: string;
  status: AdminStatus;
  criadoEm: string;
  atualizadoEm: string;
};

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

// ✅ Embaixadores
type CreateAmbassadorInput = {
  nome: string;
  email: string;
  whatsapp: string;
  codigo: string;
  imageUrl?: string | null;
  status: AmbassadorStatus;
};

type UpdateAmbassadorInput = CreateAmbassadorInput & { id: string };

// ✅ Franquiados
type CreateFranchiseeInput = {
  nome: string;
  cidade: string;
  whatsapp: string;
  imageUrl?: string | null;
  status: FranchiseeStatus;
};

type UpdateFranchiseeInput = CreateFranchiseeInput & { id: string };

type AdminDataContextValue = {
  session: Session | null;

  offers: AdminOfferRow[];
  partners: AdminPartnerRow[];
  affiliates: AdminAffiliateRow[];

  // ✅ novos
  ambassadors: AdminAmbassadorRow[];
  franchisees: AdminFranchiseeRow[];

  // ✅ config
  destinos: AdminDestinoRow[];
  refreshDestinos: () => Promise<void>;

  refreshOffers: () => Promise<void>;
  refreshSession: () => Promise<void>;

  setOfferStatus: (id: string, status: OfferStatus) => Promise<void>;
  deleteOfferForever: (id: string) => Promise<void>;
  emptyOffersTrash: () => Promise<void>;

  setAffiliateStatus: (id: string, status: AffiliateStatus) => void;
  setPartnerStatus: (id: string, status: PartnerStatus) => void;

  emptyPartnersTrash: () => void;
  emptyAffiliatesTrash: () => void;

  // ✅ novos (status + lixeira)
  setAmbassadorStatus: (id: string, status: AmbassadorStatus) => void;
  emptyAmbassadorsTrash: () => void;
  deleteAmbassadorForever: (id: string) => void;

  setFranchiseeStatus: (id: string, status: FranchiseeStatus) => void;
  emptyFranchiseesTrash: () => void;
  deleteFranchiseeForever: (id: string) => void;

  /** Recarrega listas locais (sem mock) */
  refreshMockLists: () => void;

  createPartner: (input: CreatePartnerInput) => AdminPartnerRow;
  updatePartner: (input: UpdatePartnerInput) => AdminPartnerRow | null;
  deletePartnerForever: (id: string) => void;

  // ✅ novos (CRUD)
  createAmbassador: (input: CreateAmbassadorInput) => AdminAmbassadorRow;
  updateAmbassador: (input: UpdateAmbassadorInput) => AdminAmbassadorRow | null;

  createFranchisee: (input: CreateFranchiseeInput) => AdminFranchiseeRow;
  updateFranchisee: (input: UpdateFranchiseeInput) => AdminFranchiseeRow | null;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: 'no-store', ...init });
  const data = await res.json().catch(() => null);
  return { res, data };
}

const LS_PARTNERS_KEY = 'pd_admin_partners_v1';
const LS_AFFILIATES_KEY = 'pd_admin_affiliates_v1';

// ✅ novos
const LS_AMBASSADORS_KEY = 'pd_admin_ambassadors_v1';
const LS_FRANCHISEES_KEY = 'pd_admin_franchisees_v1';

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

function pickDestinoStatus(d: any): AdminStatus {
  const s = String(d?.status ?? '').toLowerCase();
  if (s === 'rascunho' || s === 'publicado' || s === 'pausado' || s === 'arquivado' || s === 'lixeira') return s;
  return d?.ativo ? 'publicado' : 'pausado';
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const [offers, setOffers] = useState<AdminOfferRow[]>([]);
  const [partners, setPartners] = useState<AdminPartnerRow[]>([]);
  const [affiliates, setAffiliates] = useState<AdminAffiliateRow[]>([]);

  // ✅ novos
  const [ambassadors, setAmbassadors] = useState<AdminAmbassadorRow[]>([]);
  const [franchisees, setFranchisees] = useState<AdminFranchiseeRow[]>([]);

  // ✅ config
  const [destinos, setDestinos] = useState<AdminDestinoRow[]>([]);

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

  const refreshDestinos = async () => {
    const { res, data } = await fetchJson('/api/admin/config/destinos');
    if (!res.ok) return;

    const list = Array.isArray(data?.destinos) ? data.destinos : [];
    const mapped = list.map((d: any) => ({
      id: String(d?.id ?? ''),
      nome: String(d?.nome ?? ''),
      slug: String(d?.slug ?? ''),
      status: pickDestinoStatus(d),
      criadoEm: String(d?.criadoEm ?? d?.createdAt ?? ''),
      atualizadoEm: String(d?.atualizadoEm ?? d?.updatedAt ?? ''),
    }));

    setDestinos(mapped);
  };

  /**
   * ✅ IMPORTANTE:
   * Parceiros, afiliados, embaixadores e franquiados vêm SOMENTE do localStorage.
   */
  const refreshMockLists = () => {
    let lsPartners: AdminPartnerRow[] = [];
    let lsAffiliates: AdminAffiliateRow[] = [];
    let lsAmbassadors: AdminAmbassadorRow[] = [];
    let lsFranchisees: AdminFranchiseeRow[] = [];

    if (typeof window !== 'undefined') {
      const rawP = window.localStorage.getItem(LS_PARTNERS_KEY);
      const rawA = window.localStorage.getItem(LS_AFFILIATES_KEY);
      const rawAm = window.localStorage.getItem(LS_AMBASSADORS_KEY);
      const rawF = window.localStorage.getItem(LS_FRANCHISEES_KEY);

      lsPartners = safeParseArray(rawP).map((p) => mapPartner(p)) as AdminPartnerRow[];
      lsAffiliates = safeParseArray(rawA).map((a) => mapAffiliate(a)) as AdminAffiliateRow[];
      lsAmbassadors = safeParseArray(rawAm).map((a) => mapAmbassador(a)) as AdminAmbassadorRow[];
      lsFranchisees = safeParseArray(rawF).map((f) => mapFranchisee(f)) as AdminFranchiseeRow[];
    }

    setPartners(lsPartners);
    setAffiliates(lsAffiliates);
    setAmbassadors(lsAmbassadors);
    setFranchisees(lsFranchisees);
  };

  useEffect(() => {
    if (loaded) return;
    setLoaded(true);

    refreshMockLists();
    refreshSession().catch(() => {});
    refreshOffers().catch(() => {});
    refreshDestinos().catch(() => {});
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

  // =========================
  // PARTNERS (CRUD)
  // =========================

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

  // =========================
  // AMBASSADORS (CRUD + status)
  // =========================

  const setAmbassadorStatus = (id: string, status: AmbassadorStatus) => {
    setAmbassadors((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    updateLsRowStatus(LS_AMBASSADORS_KEY, id, status);
  };

  const emptyAmbassadorsTrash = () => {
    setAmbassadors((prev) => prev.filter((a) => a.status !== 'lixeira'));
    removeFromLsByStatus(LS_AMBASSADORS_KEY, 'lixeira');
  };

  const deleteAmbassadorForever = (id: string) => {
    const rid = String(id ?? '').trim();
    if (!rid) return;

    setAmbassadors((prev) => prev.filter((a) => a.id !== rid));
    removeFromLsById(LS_AMBASSADORS_KEY, rid);
  };

  const createAmbassador = (input: CreateAmbassadorInput) => {
    const id = makeId('ambassador');
    const now = new Date().toISOString();

    const payload: any = {
      id,
      nome: String(input.nome ?? '').trim(),
      email: String(input.email ?? '').trim(),
      whatsapp: String(input.whatsapp ?? '').trim(),
      codigo: String(input.codigo ?? '').trim(),
      imageUrl: (input.imageUrl ?? '').toString().trim() || null,
      status: input.status ?? 'rascunho',
      createdAt: now,
      updatedAt: now,
    };

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_AMBASSADORS_KEY);
      const arr = safeParseArray(raw);
      writeLsArray(LS_AMBASSADORS_KEY, [payload, ...arr]);
    }

    const mapped = mapAmbassador(payload) as AdminAmbassadorRow;
    setAmbassadors((prev) => [mapped, ...prev.filter((a) => a.id !== mapped.id)]);
    return mapped;
  };

  const updateAmbassador = (input: UpdateAmbassadorInput) => {
    const id = String(input.id ?? '').trim();
    if (!id) return null;

    const now = new Date().toISOString();

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_AMBASSADORS_KEY);
      const arr = safeParseArray(raw);

      const next = arr.map((a: any) => {
        if (String(a?.id ?? '') !== id) return a;
        return {
          ...a,
          nome: String(input.nome ?? '').trim(),
          email: String(input.email ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          codigo: String(input.codigo ?? '').trim(),
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          status: input.status ?? a?.status ?? 'rascunho',
          updatedAt: now,
        };
      });

      writeLsArray(LS_AMBASSADORS_KEY, next);
    }

    let mapped: AdminAmbassadorRow | null = null;
    setAmbassadors((prev) => {
      const next = prev.map((a) => {
        if (a.id !== id) return a;
        const payload: any = {
          ...a,
          nome: String(input.nome ?? '').trim(),
          email: String(input.email ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          codigo: String(input.codigo ?? '').trim(),
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          status: input.status ?? a.status,
          updatedAt: now,
        };
        const m = mapAmbassador(payload) as AdminAmbassadorRow;
        mapped = m;
        return m;
      });
      return next;
    });

    return mapped;
  };

  // =========================
  // FRANCHISEES (CRUD + status)
  // =========================

  const setFranchiseeStatus = (id: string, status: FranchiseeStatus) => {
    setFranchisees((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    updateLsRowStatus(LS_FRANCHISEES_KEY, id, status);
  };

  const emptyFranchiseesTrash = () => {
    setFranchisees((prev) => prev.filter((f) => f.status !== 'lixeira'));
    removeFromLsByStatus(LS_FRANCHISEES_KEY, 'lixeira');
  };

  const deleteFranchiseeForever = (id: string) => {
    const rid = String(id ?? '').trim();
    if (!rid) return;

    setFranchisees((prev) => prev.filter((f) => f.id !== rid));
    removeFromLsById(LS_FRANCHISEES_KEY, rid);
  };

  const createFranchisee = (input: CreateFranchiseeInput) => {
    const id = makeId('franchisee');
    const now = new Date().toISOString();

    const payload: any = {
      id,
      nome: String(input.nome ?? '').trim(),
      cidade: String(input.cidade ?? '').trim(),
      whatsapp: String(input.whatsapp ?? '').trim(),
      imageUrl: (input.imageUrl ?? '').toString().trim() || null,
      status: input.status ?? 'rascunho',
      createdAt: now,
      updatedAt: now,
    };

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_FRANCHISEES_KEY);
      const arr = safeParseArray(raw);
      writeLsArray(LS_FRANCHISEES_KEY, [payload, ...arr]);
    }

    const mapped = mapFranchisee(payload) as AdminFranchiseeRow;
    setFranchisees((prev) => [mapped, ...prev.filter((f) => f.id !== mapped.id)]);
    return mapped;
  };

  const updateFranchisee = (input: UpdateFranchiseeInput) => {
    const id = String(input.id ?? '').trim();
    if (!id) return null;

    const now = new Date().toISOString();

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_FRANCHISEES_KEY);
      const arr = safeParseArray(raw);

      const next = arr.map((f: any) => {
        if (String(f?.id ?? '') !== id) return f;
        return {
          ...f,
          nome: String(input.nome ?? '').trim(),
          cidade: String(input.cidade ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          status: input.status ?? f?.status ?? 'rascunho',
          updatedAt: now,
        };
      });

      writeLsArray(LS_FRANCHISEES_KEY, next);
    }

    let mapped: AdminFranchiseeRow | null = null;
    setFranchisees((prev) => {
      const next = prev.map((f) => {
        if (f.id !== id) return f;
        const payload: any = {
          ...f,
          nome: String(input.nome ?? '').trim(),
          cidade: String(input.cidade ?? '').trim(),
          whatsapp: String(input.whatsapp ?? '').trim(),
          imageUrl: (input.imageUrl ?? '').toString().trim() || null,
          status: input.status ?? f.status,
          updatedAt: now,
        };
        const m = mapFranchisee(payload) as AdminFranchiseeRow;
        mapped = m;
        return m;
      });
      return next;
    });

    return mapped;
  };

  const value = useMemo(
    () => ({
      session,

      offers,
      partners,
      affiliates,

      ambassadors,
      franchisees,

      destinos,
      refreshDestinos,

      refreshOffers,
      refreshSession,

      setOfferStatus,
      deleteOfferForever,
      emptyOffersTrash,

      setAffiliateStatus,
      setPartnerStatus,

      emptyPartnersTrash,
      emptyAffiliatesTrash,

      setAmbassadorStatus,
      emptyAmbassadorsTrash,
      deleteAmbassadorForever,

      setFranchiseeStatus,
      emptyFranchiseesTrash,
      deleteFranchiseeForever,

      refreshMockLists,

      createPartner,
      updatePartner,
      deletePartnerForever,

      createAmbassador,
      updateAmbassador,

      createFranchisee,
      updateFranchisee,
    }),
    [session, offers, partners, affiliates, ambassadors, franchisees, destinos]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData deve ser usado dentro de AdminDataProvider');
  return ctx;
}
