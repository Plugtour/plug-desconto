// caminho: app/afiliado/extrato/ExtratoClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';

type Lancamento = {
  id: string;
  tipo: 'credito' | 'debito';
  origem: 'venda' | 'ajuste' | 'saque' | 'estorno' | 'bonus';
  valor: any;
  status: 'pendente' | 'disponivel' | 'pago' | 'cancelado';
  descricao: string | null;
  criadoEm: string;
  vendaId?: string | null;
  saqueId?: string | null;
};

type Venda = {
  id: string;
  partnerName: string | null;
  origem: string | null;
  valorVenda: any;
  comissaoValor: any;
  comissaoStatus: 'pendente' | 'disponivel' | 'pago' | 'cancelado';
  criadoEm: string;
  categoryId?: string | null;
  offerId?: string | null;
  moeda?: string | null;
};

type ApiSaldoResp = {
  ok: boolean;
  tipo: 'saldo';
  error?: string;
  resumo?: {
    disponivel: number;
    pendente: number;
    pago: number;
    cancelado: number;
    total: number;
  };
  itens?: Lancamento[];
};

type ApiVendasResp = {
  ok: boolean;
  tipo: 'vendas';
  error?: string;
  resumo?: {
    totalVendas: number;
    totalComissao: number;
    disponivel: number;
    pendente: number;
    pago: number;
    cancelado: number;
  };
  itens?: Venda[];
};

type ExtratoResp = {
  ok: boolean;
  resumo: {
    saldoDisponivel: number;
    saldoPendente: number;
    saldoPago: number;
    totalLancamentos: number;
    totalVendido: number;
  };
  lancamentos: Lancamento[];
  vendasRecentes: Venda[];
  error?: string;
};

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function num(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ExtratoClient() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // mantemos o formato “antigo” (resumo + listas), mas agora alimentado por 2 chamadas (saldo + vendas)
  const [data, setData] = useState<ExtratoResp | null>(null);

  const [tab, setTab] = useState<'lancamentos' | 'vendas'>('lancamentos');

  const resumo = useMemo(() => {
    const r = data?.resumo;
    return (
      r ?? {
        saldoDisponivel: 0,
        saldoPendente: 0,
        saldoPago: 0,
        totalLancamentos: 0,
        totalVendido: 0,
      }
    );
  }, [data]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // ✅ a API do extrato trabalha por tipo: saldo | vendas
      const [resSaldo, resVendas] = await Promise.all([
        fetch('/api/afiliado/extrato?tipo=saldo&take=200&skip=0', { cache: 'no-store' }),
        fetch('/api/afiliado/extrato?tipo=vendas&take=50&skip=0', { cache: 'no-store' }),
      ]);

      const jsonSaldo = (await resSaldo.json()) as ApiSaldoResp;
      const jsonVendas = (await resVendas.json()) as ApiVendasResp;

      // se qualquer uma falhar, mostra erro (mais simples por enquanto)
      if (!resSaldo.ok || !jsonSaldo?.ok) {
        setErr(jsonSaldo?.error || 'Falha ao carregar extrato (saldo)');
        setData(null);
        return;
      }

      if (!resVendas.ok || !jsonVendas?.ok) {
        setErr(jsonVendas?.error || 'Falha ao carregar extrato (vendas)');
        setData(null);
        return;
      }

      const saldoResumo = jsonSaldo.resumo ?? {
        disponivel: 0,
        pendente: 0,
        pago: 0,
        cancelado: 0,
        total: 0,
      };

      const vendasResumo = jsonVendas.resumo ?? {
        totalVendas: 0,
        totalComissao: 0,
        disponivel: 0,
        pendente: 0,
        pago: 0,
        cancelado: 0,
      };

      const lancamentos = Array.isArray(jsonSaldo.itens) ? jsonSaldo.itens : [];
      const vendasRecentes = Array.isArray(jsonVendas.itens) ? jsonVendas.itens : [];

      const merged: ExtratoResp = {
        ok: true,
        resumo: {
          saldoDisponivel: num(saldoResumo.disponivel),
          saldoPendente: num(saldoResumo.pendente),
          saldoPago: num(saldoResumo.pago),
          totalLancamentos: num(saldoResumo.total),
          totalVendido: num(vendasResumo.totalVendas),
        },
        lancamentos,
        vendasRecentes,
      };

      setData(merged);
    } catch {
      setErr('Falha ao carregar extrato');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-red-300">
          {err}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Saldo disponível</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">
            {brl(resumo.saldoDisponivel)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Saldo pendente</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">
            {brl(resumo.saldoPendente)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Saldo pago</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">
            {brl(resumo.saldoPago)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Total em lançamentos</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">
            {brl(resumo.totalLancamentos)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Total vendido</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">
            {brl(resumo.totalVendido)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">
            {tab === 'lancamentos' ? 'Lançamentos' : 'Vendas recentes'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('lancamentos')}
              className={
                'rounded-lg border px-3 py-1.5 text-xs transition ' +
                (tab === 'lancamentos'
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900')
              }
            >
              Lançamentos
            </button>

            <button
              type="button"
              onClick={() => setTab('vendas')}
              className={
                'rounded-lg border px-3 py-1.5 text-xs transition ' +
                (tab === 'vendas'
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900')
              }
            >
              Vendas
            </button>

            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
            >
              Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-3 text-sm text-zinc-400">Carregando...</div>
        ) : tab === 'lancamentos' ? (
          !data?.lancamentos?.length ? (
            <div className="mt-3 text-sm text-zinc-400">Nenhum lançamento encontrado.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {data.lancamentos.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-zinc-100">{l.origem}</div>
                      <span
                        className={
                          'rounded-full border px-2 py-0.5 text-[11px] font-medium ' +
                          (l.status === 'disponivel'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                            : l.status === 'pendente'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                            : l.status === 'pago'
                            ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300')
                        }
                      >
                        {l.status}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-zinc-400">
                      {fmtDate(l.criadoEm)} • {l.tipo}
                      {l.descricao ? ` • ${l.descricao}` : ''}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-zinc-100">{brl(num(l.valor))}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : !data?.vendasRecentes?.length ? (
          <div className="mt-3 text-sm text-zinc-400">Nenhuma venda encontrada.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {data.vendasRecentes.map((v) => (
              <div
                key={v.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-100">
                    {v.partnerName || 'Venda'}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {fmtDate(v.criadoEm)} • {v.origem || 'origem não informada'}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    comissão: {brl(num(v.comissaoValor))} • {v.comissaoStatus}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-zinc-100">{brl(num(v.valorVenda))}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// caminho: app/afiliado/extrato/ExtratoClient.tsx
