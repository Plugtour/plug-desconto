'use client';

// app/admin/page.tsx
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import AdminStatusPill from './_components/AdminStatusPill';
import AdminTableShell from './_components/AdminTableShell';
import { useAdminData } from './_components/AdminDataProvider';
import { adminMock } from './_data/adminMock';

const StatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) => {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
};

const MiniBar = ({
  value,
  max,
  highlightMax,
  highlightCurrent,
}: {
  value: number;
  max: number;
  highlightMax?: boolean;
  highlightCurrent?: boolean;
}) => {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 6;

  const barClass = highlightCurrent ? 'bg-zinc-700' : highlightMax ? 'bg-zinc-600' : 'bg-zinc-800';

  return (
    <div className="flex h-24 items-end">
      <div className={`w-full rounded-md transition-all ${barClass}`} style={{ height: `${pct}%` }} />
    </div>
  );
};

const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AdminDashboardPage() {
  const { offers, partners, affiliates } = useAdminData();

  // ===== métricas dinâmicas (refletem mudanças nas telas) =====
  const offersPublished = offers.filter((o) => o.status === 'publicado').length;
  const partnersPublished = partners.filter((p) => p.status === 'publicado').length;
  const affiliatesPublished = affiliates.filter((a) => a.status === 'publicado').length;

  // ===== Downloads (mock calculado, mas consistente) =====
  const totalDownloads = offers.length * 220 + partners.length * 90 + affiliates.length * 45 + offersPublished * 180;

  const activeDownloads = Math.max(0, Math.round(totalDownloads * 0.22)); // ~22% ativos (mock)

  // ===== gráfico 12 meses =====
  const chartMonths = adminMock.dashboard.months;
  const filledMonths = (() => {
    const months = chartMonths.slice(0, 12).map((m) => ({ ...m, placeholder: false }));
    if (months.length >= 12) return months;

    const base = months[0]?.value ?? 100;
    const missing = 12 - months.length;

    const placeholders = Array.from({ length: missing }).map((_, i) => {
      const decay = Math.pow(0.85, missing - i);
      return { label: monthOrder[i], value: Math.round(base * decay), placeholder: true };
    });

    return [...placeholders, ...months];
  })();

  const values = filledMonths.map((m) => m.value);
  const maxValue = Math.max(...values);

  // ===== comparativo (último vs anterior do mock) =====
  const lastReal = chartMonths.at(-1);
  const prevReal = chartMonths.at(-2);

  const compare = (() => {
    if (!lastReal || !prevReal) return { trend: 'flat' as const, pct: 0, delta: 0 };
    const delta = lastReal.value - prevReal.value;
    const pct = prevReal.value === 0 ? 0 : (delta / prevReal.value) * 100;
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    return { trend, pct, delta };
  })();

  const TrendIcon = compare.trend === 'up' ? ArrowUpRight : compare.trend === 'down' ? ArrowDownRight : Minus;

  const trendColor =
    compare.trend === 'up' ? 'text-emerald-300' : compare.trend === 'down' ? 'text-rose-300' : 'text-zinc-400';

  // ===== previews (recentes de verdade) =====
  const parseDDMMYY = (s: string) => {
    // aceita "DD/MM/AA" ou "DD-MM-AA"
    const clean = (s || '').trim().replace(/-/g, '/');
    const [dd, mm, yy] = clean.split('/').map((x) => parseInt(x, 10));

    if (!dd || !mm || yy === undefined || Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yy)) {
      return 0;
    }

    // 20xx (AA)
    const yyyy = 2000 + yy;
    return new Date(yyyy, mm - 1, dd).getTime();
  };

  const topPartners = [...partners]
    .sort((a, b) => parseDDMMYY(b.atualizadoEm ?? '') - parseDDMMYY(a.atualizadoEm ?? ''))
    .slice(0, 3);

  const topAffiliates = [...affiliates]
    .sort((a, b) => parseDDMMYY(b.atualizadoEm ?? '') - parseDDMMYY(a.atualizadoEm ?? ''))
    .slice(0, 3);

  // ===== row inteiro clicável (nova aba) =====
  const openSearchInNewTab = (path: string, q: string) => {
    const url = `${path}?q=${encodeURIComponent(q)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const rowLinkHandlers = (path: string, q: string) => ({
    role: 'link' as const,
    tabIndex: 0,
    onClick: () => openSearchInNewTab(path, q),
    onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSearchInNewTab(path, q);
      }
    },
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Visão rápida do painel (dados do Admin em memória).</p>
      </div>

      {/* agora com 6 cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <StatCard label="Ofertas publicadas" value={String(offersPublished)} hint="Atualiza em tempo real" />
        <StatCard label="Parceiros ativos" value={String(partnersPublished)} hint="Status publicado" />
        <StatCard label="Afiliados ativos" value={String(affiliatesPublished)} hint="Status publicado" />
        <StatCard label="Downloads ativos" value={String(activeDownloads)} hint="Mock (MVP)" />
        <StatCard label="Total de downloads" value={String(totalDownloads)} hint="Mock (MVP)" />
        <StatCard label="Receita estimada" value="R$ 18.420" hint="Simulação (MVP)" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* GRÁFICO */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">Utilizações por mês</p>
              <p className="mt-1 text-lg font-semibold">2026</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="rounded-lg bg-zinc-900 px-3 py-1 text-xs text-zinc-400">mock</div>

              <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-1.5">
                <TrendIcon size={14} className={trendColor} />
                <span className={`text-xs font-medium ${trendColor}`}>
                  {compare.pct >= 0 ? '+' : ''}
                  {compare.pct.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-500">
                  ({compare.delta >= 0 ? '+' : ''}
                  {compare.delta})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-2">
            {filledMonths.map((m, i) => {
              const isMax = m.value === maxValue;
              const isCurrent = i === filledMonths.length - 1;

              return (
                <div
                  key={`${m.label}-${i}`}
                  className="group relative rounded-lg bg-zinc-900 p-2"
                  title={`${m.label}: ${m.value}`}
                >
                  <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-200 shadow-sm">
                      {m.label}: <span className="text-zinc-100">{m.value}</span>
                    </div>
                  </div>

                  <MiniBar value={m.value} max={maxValue} highlightMax={isMax} highlightCurrent={isCurrent} />
                  <div className="mt-2 text-center text-[10px] text-zinc-500">{m.label}</div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-zinc-500">Passe o mouse nas barras para ver o volume do mês.</p>
        </div>

        {/* ATALHOS */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">Atalhos</p>

          <div className="mt-3 space-y-2">
            <Link href="/admin/ofertas" className="block rounded-lg bg-zinc-900 px-3 py-3 text-sm hover:bg-zinc-800">
              Gerenciar ofertas
            </Link>
            <Link href="/admin/parceiros" className="block rounded-lg bg-zinc-900 px-3 py-3 text-sm hover:bg-zinc-800">
              Gerenciar parceiros
            </Link>
            <Link href="/admin/afiliados" className="block rounded-lg bg-zinc-900 px-3 py-3 text-sm hover:bg-zinc-800">
              Gerenciar afiliados
            </Link>
          </div>
        </div>
      </section>

      {/* PREVIEW LISTAS NO DASHBOARD */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AdminTableShell
          footer={
            <>
              Exibindo <span className="text-zinc-300">{topPartners.length}</span> de{' '}
              <span className="text-zinc-300">{partners.length}</span> parceiros.
            </>
          }
        >
          <div className="px-4 py-3 text-xs text-zinc-400">Parceiros recentes</div>
          <table className="w-full min-w-[520px] text-left">
            <thead className="border-b border-zinc-900 bg-zinc-950">
              <tr className="text-xs text-zinc-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {topPartners.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer text-sm hover:bg-zinc-900/40 focus:bg-zinc-900/50 focus:outline-none"
                  {...rowLinkHandlers('/admin/parceiros', p.nome)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-100">{p.nome}</span>
                    <div className="mt-0.5 text-xs text-zinc-500">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{p.cidade}</td>
                  <td className="px-4 py-3">
                    <AdminStatusPill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>

        <AdminTableShell
          footer={
            <>
              Exibindo <span className="text-zinc-300">{topAffiliates.length}</span> de{' '}
              <span className="text-zinc-300">{affiliates.length}</span> afiliados.
            </>
          }
        >
          <div className="px-4 py-3 text-xs text-zinc-400">Afiliados recentes</div>
          <table className="w-full min-w-[520px] text-left">
            <thead className="border-b border-zinc-900 bg-zinc-950">
              <tr className="text-xs text-zinc-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cupom</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {topAffiliates.map((a) => (
                <tr
                  key={a.id}
                  className="cursor-pointer text-sm hover:bg-zinc-900/40 focus:bg-zinc-900/50 focus:outline-none"
                  {...rowLinkHandlers('/admin/afiliados', a.nome)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-100">{a.nome}</span>
                    <div className="mt-0.5 text-xs text-zinc-500">{a.id}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{a.cupom}</td>
                  <td className="px-4 py-3">
                    <AdminStatusPill status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </section>
    </main>
  );
}
