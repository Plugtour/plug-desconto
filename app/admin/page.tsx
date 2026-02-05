// app/admin/page.tsx
'use client';

import React, { useMemo } from 'react';

import { useAdminData } from './_components/AdminDataProvider';
import AdminDashboardSummary, { type SummaryCard } from './_components/AdminDashboardSummary';
import AdminDashboardChart from './_components/AdminDashboardChart';
import AdminRecentCardsRow from './_components/AdminRecentCardsRow';

const intBR = new Intl.NumberFormat('pt-BR');

type AnyRow = { status?: string };

type RecentRow = {
  id: string;
  primary: string;
  secondary?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  rightMeta?: string | null;
};

function buildStats(list: AnyRow[]) {
  return {
    rascunho: list.filter((x) => x.status === 'rascunho').length,
    arquivado: list.filter((x) => x.status === 'arquivado').length,
    pausado: list.filter((x) => x.status === 'pausado').length,
    publicado: list.filter((x) => x.status === 'publicado').length,
    lixeira: list.filter((x) => x.status === 'lixeira').length,
    total: list.length,
  };
}

function pickStatus(v: string | null | undefined) {
  const s = (v || '').toLowerCase();
  if (s === 'rascunho' || s === 'publicado' || s === 'pausado' || s === 'arquivado' || s === 'lixeira') return s;
  return null;
}

function safeString(v: any) {
  return typeof v === 'string' ? v : '';
}

function getTime(v: any) {
  const raw = v?.atualizadoEm || v?.updatedAt || v?.criadoEm || v?.createdAt || 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function mapRecent(
  list: any[],
  fallbackLabel: string,
  rightMetaBuilder?: (row: any) => string | null,
): RecentRow[] {
  return [...(list || [])]
    .sort((a, b) => getTime(b) - getTime(a))
    .slice(0, 6)
    .map((row) => ({
      id: String(row?.id ?? row?.email ?? row?.slug ?? Math.random()),
      primary: safeString(row?.nome || row?.name || row?.razaoSocial || row?.fantasia || fallbackLabel),
      secondary: safeString(row?.email || row?.whatsapp || row?.telefone || row?.phone || ''),
      status: pickStatus(row?.status),
      updatedAt: safeString(row?.atualizadoEm || row?.updatedAt || row?.criadoEm || row?.createdAt || ''),
      rightMeta: rightMetaBuilder ? rightMetaBuilder(row) : null,
    }));
}

export default function AdminDashboardPage() {
  const adminAny = useAdminData() as any;

  const offers = (adminAny?.offers ?? []) as AnyRow[];
  const destinos = (adminAny?.destinos ?? []) as AnyRow[];
  const partners = (adminAny?.partners ?? []) as AnyRow[];
  const affiliates = (adminAny?.affiliates ?? []) as AnyRow[];
  const ambassadors = (adminAny?.ambassadors ?? adminAny?.embaixadores ?? []) as AnyRow[];
  const patrocinados = (adminAny?.patrocinados ?? []) as AnyRow[];

  const offersStats = useMemo(() => buildStats(offers), [offers]);
  const destinosStats = useMemo(() => buildStats(destinos), [destinos]);
  const partnersStats = useMemo(() => buildStats(partners), [partners]);
  const affiliatesStats = useMemo(() => buildStats(affiliates), [affiliates]);
  const ambassadorsStats = useMemo(() => buildStats(ambassadors), [ambassadors]);
  const patrocinadosStats = useMemo(() => buildStats(patrocinados), [patrocinados]);

  const totalDownloads = offers.length * 220 + partners.length * 90 + affiliates.length * 45;
  const activeDownloads = Math.round(totalDownloads * 0.22);

  const cards: SummaryCard[] = [
    {
      title: 'Ofertas',
      total: offersStats.total,
      href: '/admin/ofertas',
      items: [
        { label: 'Rascunho', count: offersStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: offersStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: offersStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: offersStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: offersStats.lixeira, tone: 'zinc' },
      ],
    },
    {
      title: 'Destinos',
      total: destinosStats.total,
      href: '/admin/configuracoes/destinos',
      items: [
        { label: 'Rascunho', count: destinosStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: destinosStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: destinosStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: destinosStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: destinosStats.lixeira, tone: 'zinc' },
      ],
    },
    {
      title: 'Parceiros',
      total: partnersStats.total,
      href: '/admin/parceiros',
      items: [
        { label: 'Rascunho', count: partnersStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: partnersStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: partnersStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: partnersStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: partnersStats.lixeira, tone: 'zinc' },
      ],
    },
    {
      title: 'Afiliados',
      total: affiliatesStats.total,
      href: '/admin/afiliados',
      items: [
        { label: 'Rascunho', count: affiliatesStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: affiliatesStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: affiliatesStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: affiliatesStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: affiliatesStats.lixeira, tone: 'zinc' },
      ],
    },
    {
      title: 'Embaixadores',
      total: ambassadorsStats.total,
      href: '/admin/embaixadores',
      items: [
        { label: 'Rascunho', count: ambassadorsStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: ambassadorsStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: ambassadorsStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: ambassadorsStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: ambassadorsStats.lixeira, tone: 'zinc' },
      ],
    },
    {
      title: 'Patrocínios',
      total: patrocinadosStats.total,
      href: '/admin/patrocinados',
      items: [
        { label: 'Rascunho', count: patrocinadosStats.rascunho, tone: 'blue' },
        { label: 'Arquivado', count: patrocinadosStats.arquivado, tone: 'red' },
        { label: 'Pausado', count: patrocinadosStats.pausado, tone: 'amber' },
        { label: 'Publicado', count: patrocinadosStats.publicado, tone: 'green' },
        { label: 'Lixeira', count: patrocinadosStats.lixeira, tone: 'zinc' },
      ],
    },
  ];

  const recentCards = useMemo(() => {
    const clients = (adminAny?.clients ?? adminAny?.clientes ?? []) as any[];

    const lastClients = mapRecent(clients, 'Cliente');
    const lastAffiliates = mapRecent(affiliates as any[], 'Afiliado', (a) => (a?.comissao ? `${a.comissao}%` : ''));
    const lastAmbassadors = mapRecent(ambassadors as any[], 'Embaixador', (e) => (e?.cupom ? String(e.cupom) : ''));

    return [
      {
        key: 'recent_clients',
        title: 'Últimos clientes',
        href: '/admin/clientes',
        emptyText: 'Ainda não há clientes cadastrados.',
        rows: lastClients,
      },
      {
        key: 'recent_affiliates',
        title: 'Últimos afiliados',
        href: '/admin/afiliados',
        emptyText: 'Ainda não há afiliados cadastrados.',
        rows: lastAffiliates,
      },
      {
        key: 'recent_ambassadors',
        title: 'Últimos embaixadores',
        href: '/admin/embaixadores',
        emptyText: 'Ainda não há embaixadores cadastrados.',
        rows: lastAmbassadors,
      },
    ];
  }, [adminAny, affiliates, ambassadors]);

  return (
    <main className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Visão rápida do painel (dados do Admin em memória).</p>
      </div>

      <AdminDashboardSummary cards={cards} />

      <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <AdminDashboardChart />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total de downloads</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{intBR.format(totalDownloads)}</p>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Downloads ativos</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{intBR.format(activeDownloads)}</p>
            </div>

            <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Receita estimada</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">R$ 18.420</p>
            </div>
          </div>
        </div>
      </section>

      <AdminRecentCardsRow cards={recentCards} columns={3} maxRows={4} />
    </main>
  );
}
