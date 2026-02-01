'use client';

// app/admin/_components/AdminDashboardChart.tsx
import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { adminMock } from '../_data/adminMock';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const intBR = new Intl.NumberFormat('pt-BR');

const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

// Mock determinístico
function stableValue(seed: number) {
  let x = seed >>> 0;
  x = (1664525 * x + 1013904223) >>> 0;
  return x;
}

type ChartMode = 'ano' | 'dia';

type ChartPoint = {
  label: string; // "Jan" ou "01"
  base: number;
  revenue: number;
  clients: number;
  dlTotal: number;
  dlNonClient: number;
  monthLabel?: string;
  day?: number;
};

function buildYearMonths(year: number, base: number): ChartPoint[] {
  return monthOrder.map((label, i) => {
    const s = stableValue(year * 1000 + i * 97 + base);

    const wobble = (s % 70) - 35;
    const trend = Math.round((i / 11) * 40);
    const baseVol = Math.max(20, base + trend + wobble);

    const dlTotal = Math.max(0, Math.round(baseVol * (18 + (s % 10))));
    const clientRate = 45 + (s % 41);
    const clients = Math.min(dlTotal, Math.round((dlTotal * clientRate) / 100));
    const dlNonClient = Math.max(0, dlTotal - clients);

    const ticket = 35 + (s % 35);
    const revenue = Math.max(0, Math.round(clients * ticket));

    return { label, base: baseVol, revenue, clients, dlTotal, dlNonClient };
  });
}

function buildMonthDays(year: number, monthIndex0: number, base: number): ChartPoint[] {
  const n = daysInMonth(year, monthIndex0);
  const mLabel = monthOrder[monthIndex0];

  return Array.from({ length: n }).map((_, d0) => {
    const day = d0 + 1;
    const s = stableValue(year * 100000 + monthIndex0 * 1000 + day * 37 + base);

    const wobble = (s % 30) - 15;
    const weekly = Math.round(Math.sin((day / 7) * Math.PI) * 8);
    const baseVol = Math.max(5, Math.round(base / 4) + wobble + weekly);

    const dlTotal = Math.max(0, Math.round(baseVol * (20 + (s % 10))));
    const clientRate = 35 + (s % 51);
    const clients = Math.min(dlTotal, Math.round((dlTotal * clientRate) / 100));
    const dlNonClient = Math.max(0, dlTotal - clients);

    const ticket = 35 + (s % 35);
    const revenue = Math.max(0, Math.round(clients * ticket));

    return {
      label: String(day).padStart(2, '0'),
      base: baseVol,
      revenue,
      clients,
      dlTotal,
      dlNonClient,
      monthLabel: mLabel,
      day,
    };
  });
}

function TripleBars({
  revenue,
  clients,
  dlNonClient,
  maxRevenue,
  maxClients,
  maxDlNonClient,
  isCurrent,
  compact,
}: {
  revenue: number;
  clients: number;
  dlNonClient: number;
  maxRevenue: number;
  maxClients: number;
  maxDlNonClient: number;
  isCurrent?: boolean;
  compact?: boolean;
}) {
  const pctRevenue = maxRevenue > 0 ? Math.max(4, Math.round((revenue / maxRevenue) * 100)) : 4;
  const pctClients = maxClients > 0 ? Math.max(4, Math.round((clients / maxClients) * 100)) : 4;
  const pctNon = maxDlNonClient > 0 ? Math.max(4, Math.round((dlNonClient / maxDlNonClient) * 100)) : 4;

  const barW = compact ? 'w-1' : 'w-2';
  const gap = compact ? 'gap-0.5' : 'gap-1';

  return (
    <div
      className={[
        'relative flex h-24 items-end justify-center',
        gap,
        isCurrent ? 'rounded-md ring-1 ring-zinc-300/60 dark:ring-zinc-700/60' : '',
      ].join(' ')}
    >
      <div className={['relative h-full rounded-sm bg-zinc-200/70 dark:bg-zinc-900/40', barW].join(' ')}>
        <div
          className="absolute bottom-0 left-0 w-full rounded-sm bg-emerald-500 transition-all"
          style={{ height: `${pctRevenue}%` }}
        />
      </div>

      <div className={['relative h-full rounded-sm bg-zinc-200/70 dark:bg-zinc-900/40', barW].join(' ')}>
        <div
          className="absolute bottom-0 left-0 w-full rounded-sm bg-sky-400 transition-all"
          style={{ height: `${pctClients}%` }}
        />
      </div>

      <div className={['relative h-full rounded-sm bg-zinc-200/70 dark:bg-zinc-900/40', barW].join(' ')}>
        <div
          className="absolute bottom-0 left-0 w-full rounded-sm bg-amber-400 transition-all"
          style={{ height: `${pctNon}%` }}
        />
      </div>
    </div>
  );
}

function TooltipCard({
  title,
  revenue,
  clients,
  dlNonClient,
  dlTotal,
}: {
  title: string;
  revenue: number;
  clients: number;
  dlNonClient: number;
  dlTotal: number;
}) {
  return (
    <div className="relative">
      <div
        className={[
          'min-w-[260px] rounded-md border px-3 py-2 text-[12px] shadow-sm',
          'border-zinc-200 bg-white text-zinc-900',
          'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100',
        ].join(' ')}
      >
        <div className="font-semibold">{title}</div>

        <div className="mt-1 flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-300">Receita</span>
            <span className="font-medium">{brl.format(revenue)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-300">Clientes convertidos</span>
            <span className="font-medium">{intBR.format(clients)}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-300">Downloads (não-clientes)</span>
            <span className="font-medium">{intBR.format(dlNonClient)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Downloads total</span>
            <span className="font-medium">{intBR.format(dlTotal)}</span>
          </div>
        </div>
      </div>

      <div
        className={[
          'absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border',
          'border-zinc-200 bg-white',
          'dark:border-zinc-800 dark:bg-zinc-950',
        ].join(' ')}
        aria-hidden="true"
      />
    </div>
  );
}

export default function AdminDashboardChart() {
  const now = new Date();
  const currentYear = now.getFullYear();

  const availableYears = useMemo(() => {
    const baseYear = 2026;
    const years = [baseYear - 3, baseYear - 2, baseYear - 1, baseYear, currentYear].filter((y, i, a) => a.indexOf(y) === i);
    years.sort((a, b) => a - b);
    return years;
  }, [currentYear]);

  const [chartMode, setChartMode] = useState<ChartMode>('ano');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthIndex0, setSelectedMonthIndex0] = useState<number>(now.getMonth());

  const baseFromMock = adminMock.dashboard.months?.[0]?.value ?? 120;

  const series: ChartPoint[] = useMemo(() => {
    if (chartMode === 'ano') return buildYearMonths(selectedYear, baseFromMock);
    return buildMonthDays(selectedYear, selectedMonthIndex0, baseFromMock);
  }, [chartMode, selectedYear, selectedMonthIndex0, baseFromMock]);

  const maxRevenue = useMemo(() => Math.max(...series.map((p) => p.revenue), 1), [series]);
  const maxClients = useMemo(() => Math.max(...series.map((p) => p.clients), 1), [series]);
  const maxDlNonClient = useMemo(() => Math.max(...series.map((p) => p.dlNonClient), 1), [series]);

  const compare = useMemo(() => {
    const last = series.at(-1);
    const prev = series.at(-2);
    if (!last || !prev) return { trend: 'flat' as const, pct: 0, delta: 0 };

    const delta = last.base - prev.base;
    const pct = prev.base === 0 ? 0 : (delta / prev.base) * 100;
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    return { trend, pct, delta };
  }, [series]);

  const TrendIcon = compare.trend === 'up' ? ArrowUpRight : compare.trend === 'down' ? ArrowDownRight : Minus;

  const trendColor =
    compare.trend === 'up'
      ? 'text-emerald-700 dark:text-emerald-300'
      : compare.trend === 'down'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-zinc-600 dark:text-zinc-400';

  const chartTitle =
    chartMode === 'ano'
      ? `Utilizações por mês — ${selectedYear}`
      : `Utilizações por dia — ${monthOrder[selectedMonthIndex0]}/${selectedYear}`;

  const chartHint = 'Passe o mouse para ver Receita, Clientes e Downloads.';

  return (
    <div
      className={[
        'rounded-xl border p-5',
        'border-zinc-200 bg-white',
        'dark:border-zinc-900 dark:bg-zinc-950',
      ].join(' ')}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{chartTitle}</p>
          <p className="mt-1 text-lg font-semibold">{chartMode === 'ano' ? selectedYear : 'Detalhado'}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            mock
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
            <TrendIcon size={14} className={trendColor} />
            <span className={`text-xs font-medium ${trendColor}`}>
              {compare.pct >= 0 ? '+' : ''}
              {compare.pct.toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              ({compare.delta >= 0 ? '+' : ''}
              {compare.delta})
            </span>
          </div>

          <div className="inline-flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setChartMode('ano')}
              className={[
                'px-3 py-1.5 text-xs',
                chartMode === 'ano'
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/60',
              ].join(' ')}
            >
              Ano
            </button>
            <button
              type="button"
              onClick={() => setChartMode('dia')}
              className={[
                'px-3 py-1.5 text-xs',
                chartMode === 'dia'
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/60',
              ].join(' ')}
            >
              Dia
            </button>
          </div>

          {chartMode === 'dia' && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Mês</span>
              <select
                value={selectedMonthIndex0}
                onChange={(e) => setSelectedMonthIndex0(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs text-zinc-900 outline-none dark:text-zinc-200"
              >
                {monthOrder.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-zinc-950">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Ano</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs text-zinc-900 outline-none dark:text-zinc-200"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-zinc-950">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {chartMode === 'ano' ? (
        <div className="mt-4 grid grid-cols-12 gap-2">
          {series.map((m, i) => {
            const isCurrent = i === series.length - 1;
            return (
              <div
                key={`${m.label}-${i}`}
                className={[
                  'group relative rounded-lg border p-2',
                  'border-zinc-200 bg-zinc-50',
                  'dark:border-zinc-800 dark:bg-zinc-900/50',
                ].join(' ')}
              >
                <div
                  className={[
                    'pointer-events-none absolute left-1/2 bottom-full z-20 -translate-x-1/2',
                    'mb-2 opacity-0 translate-y-1',
                    'transition-all duration-150 ease-out',
                    'group-hover:opacity-100 group-hover:translate-y-0',
                  ].join(' ')}
                >
                  <TooltipCard
                    title={`${m.label}/${selectedYear}`}
                    revenue={m.revenue}
                    clients={m.clients}
                    dlNonClient={m.dlNonClient}
                    dlTotal={m.dlTotal}
                  />
                </div>

                <TripleBars
                  revenue={m.revenue}
                  clients={m.clients}
                  dlNonClient={m.dlNonClient}
                  maxRevenue={maxRevenue}
                  maxClients={maxClients}
                  maxDlNonClient={maxDlNonClient}
                  isCurrent={isCurrent}
                  compact={false}
                />

                <div className="mt-2 text-center text-[10px] text-zinc-600 dark:text-zinc-500">{m.label}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div
            className="mt-4 grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
            }}
          >
            {series.map((d, i) => {
              const isCurrent = i === series.length - 1;

              return (
                <div
                  key={`${d.label}-${i}`}
                  className={[
                    'group relative rounded-md border p-1',
                    'border-zinc-200 bg-zinc-50',
                    'dark:border-zinc-800 dark:bg-zinc-900/50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'pointer-events-none absolute left-1/2 bottom-full z-20 -translate-x-1/2',
                      'mb-2 opacity-0 translate-y-1',
                      'transition-all duration-150 ease-out',
                      'group-hover:opacity-100 group-hover:translate-y-0',
                    ].join(' ')}
                  >
                    <TooltipCard
                      title={`${d.label}/${monthOrder[selectedMonthIndex0]}/${selectedYear}`}
                      revenue={d.revenue}
                      clients={d.clients}
                      dlNonClient={d.dlNonClient}
                      dlTotal={d.dlTotal}
                    />
                  </div>

                  <TripleBars
                    revenue={d.revenue}
                    clients={d.clients}
                    dlNonClient={d.dlNonClient}
                    maxRevenue={maxRevenue}
                    maxClients={maxClients}
                    maxDlNonClient={maxDlNonClient}
                    isCurrent={isCurrent}
                    compact={true}
                  />

                  <div className="mt-1 text-center text-[9px] text-zinc-600 dark:text-zinc-500">{d.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-500">
            No modo “Dia”, os números aparecem apenas no balão ao passar o mouse.
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-500">{chartHint}</p>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-zinc-700 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
          Receita
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-sky-400" />
          Clientes convertidos
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-400" />
          Downloads não-clientes
        </span>
      </div>
    </div>
  );
}
