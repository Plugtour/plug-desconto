// caminho: app/afiliado/saques/SaquesClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';

type Saque = {
  id: string;
  status: 'solicitado' | 'aprovado' | 'pago' | 'recusado' | 'cancelado';
  valorSolicitado: any;
  valorPago: any | null;
  metodo: 'pix' | 'credito' | 'manual' | null;
  pixTipo: string | null;
  pixChave: string | null;
  solicitadoEm: string;
  aprovadoEm?: string | null;
  pagoEm?: string | null;
  motivoRecusa?: string | null;
  _count?: { itens: number };
};

type GetSaquesResp = {
  ok: boolean;
  error?: string;
  saldoDisponivel?: number;
  saques?: Saque[];
};

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR');
}

function num(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// aceita "150", "150,50", "R$ 150,50"
function parseMoneyBR(value: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;

  // remove tudo que não é dígito, vírgula ou ponto
  const cleaned = raw.replace(/[^\d.,-]/g, '').trim();
  if (!cleaned) return 0;

  // se tiver vírgula, trata como decimal BR
  // exemplo: 1.234,56 -> 1234.56
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function uniq(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

export default function SaquesClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [saques, setSaques] = useState<Saque[]>([]);

  const [modo, setModo] = useState<'total' | 'parcial' | 'por_venda'>('total');
  const [valor, setValor] = useState<string>('');
  const [vendaIdsText, setVendaIdsText] = useState<string>('');

  const [pixTipo, setPixTipo] = useState<string>('');
  const [pixChave, setPixChave] = useState<string>('');
  const [metodo, setMetodo] = useState<'pix' | 'credito' | 'manual'>('pix');

  const valorParcial = useMemo(() => parseMoneyBR(valor), [valor]);

  const vendaIds = useMemo(() => {
    const ids = vendaIdsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return uniq(ids);
  }, [vendaIdsText]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;

    if (modo === 'total') return saldoDisponivel > 0;

    if (modo === 'parcial') {
      return valorParcial > 0 && valorParcial <= saldoDisponivel;
    }

    if (modo === 'por_venda') return vendaIds.length > 0;

    return false;
  }, [modo, saldoDisponivel, valorParcial, vendaIds.length, submitting]);

  const canRefresh = !loading && !submitting;

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch('/api/afiliado/saques?take=50&skip=0', { cache: 'no-store' });
      const data = (await res.json()) as GetSaquesResp;

      if (!res.ok || !data.ok) {
        setErr(data.error || 'Falha ao carregar saques');
        setSaques([]);
        setSaldoDisponivel(0);
        return;
      }

      setSaldoDisponivel(Number(data.saldoDisponivel ?? 0));
      setSaques(Array.isArray(data.saques) ? data.saques : []);
    } catch {
      setErr('Falha ao carregar saques');
      setSaques([]);
      setSaldoDisponivel(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function solicitar() {
    if (!canSubmit) return;

    setErr(null);
    setSubmitting(true);

    // validações mínimas (sem mudar regras do backend)
    if (modo === 'parcial') {
      if (valorParcial <= 0) {
        setErr('Informe um valor válido.');
        setSubmitting(false);
        return;
      }
      if (valorParcial > saldoDisponivel) {
        setErr('O valor informado é maior que o saldo disponível.');
        setSubmitting(false);
        return;
      }
    }

    if (modo === 'por_venda') {
      if (vendaIds.length === 0) {
        setErr('Informe ao menos 1 ID de venda.');
        setSubmitting(false);
        return;
      }
    }

    if (metodo === 'pix') {
      // backend pode usar pix padrão do afiliado, mas aqui evitamos enviar vazio
      if (!pixTipo.trim() || !pixChave.trim()) {
        setErr('Informe pixTipo e pixChave para saque via PIX (ou deixe ambos vazios se o afiliado já tiver PIX salvo no cadastro).');
        // ✅ não bloqueia totalmente: se o afiliado tiver salvo no backend, basta limpar os dois campos
        setSubmitting(false);
        return;
      }
    }

    const body: any = { modo, metodo };

    if (metodo === 'pix') {
      if (pixTipo.trim()) body.pixTipo = pixTipo.trim();
      if (pixChave.trim()) body.pixChave = pixChave.trim();
    }

    if (modo === 'parcial') body.valor = valorParcial;
    if (modo === 'por_venda') body.vendaIds = vendaIds;

    try {
      const res = await fetch('/api/afiliado/saques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setErr(data?.error || 'Falha ao solicitar saque');
        return;
      }

      await load();

      // limpa inputs (mantém modo e método)
      setValor('');
      setVendaIdsText('');
    } catch {
      setErr('Falha ao solicitar saque');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="text-xs text-zinc-400">Saldo disponível</div>
        <div className="mt-1 text-xl font-bold text-zinc-100">{brl(saldoDisponivel)}</div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">Solicitar saque</div>
          <button
            onClick={load}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={!canRefresh}
            title={!canRefresh ? 'Aguarde...' : 'Atualizar'}
          >
            Atualizar
          </button>
        </div>

        {err ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-red-300">
            {err}
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setModo('total')}
            className={
              'rounded-xl border px-3 py-2 text-sm ' +
              (modo === 'total'
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900')
            }
          >
            Total
          </button>

          <button
            type="button"
            onClick={() => setModo('parcial')}
            className={
              'rounded-xl border px-3 py-2 text-sm ' +
              (modo === 'parcial'
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900')
            }
          >
            Parcial
          </button>

          <button
            type="button"
            onClick={() => setModo('por_venda')}
            className={
              'rounded-xl border px-3 py-2 text-sm ' +
              (modo === 'por_venda'
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-100'
                : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900')
            }
          >
            Por venda
          </button>
        </div>

        {modo === 'parcial' ? (
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Valor</div>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 150 ou 150,50"
              inputMode="decimal"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
            <div className="text-[11px] text-zinc-500">
              Máximo: {brl(saldoDisponivel)}
              {valor ? ` • digitado: ${brl(valorParcial)}` : ''}
            </div>
          </div>
        ) : null}

        {modo === 'por_venda' ? (
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">IDs das vendas (separados por vírgula)</div>
            <input
              value={vendaIdsText}
              onChange={(e) => setVendaIdsText(e.target.value)}
              placeholder="ex: ck..., ck..., ck..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
            <div className="text-[11px] text-zinc-500">
              {vendaIds.length
                ? `${vendaIds.length} ID(s) detectado(s)`
                : '(no próximo passo a gente troca isso por um seletor)'}
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <div className="text-xs text-zinc-400">Método</div>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            >
              <option value="pix">PIX</option>
              <option value="credito">Crédito</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {metodo === 'pix' ? (
            <>
              <div>
                <div className="text-xs text-zinc-400">PIX tipo</div>
                <input
                  value={pixTipo}
                  onChange={(e) => setPixTipo(e.target.value)}
                  placeholder="cpf, email, telefone..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <div className="text-xs text-zinc-400">PIX chave</div>
                <input
                  value={pixChave}
                  onChange={(e) => setPixChave(e.target.value)}
                  placeholder="sua chave PIX"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
                />
              </div>
              <div className="sm:col-span-3 text-[11px] text-zinc-500">
                Dica: se o afiliado já tiver PIX salvo no cadastro, você pode deixar os 2 campos vazios e o backend usa o padrão.
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <div className="text-xs text-zinc-400">Obs.</div>
              <div className="mt-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                Você escolheu <b>{metodo}</b>. O repasse será tratado pelo sistema/operador.
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={solicitar}
          className={
            'w-full rounded-xl px-4 py-2 text-sm font-semibold transition ' +
            (canSubmit ? 'bg-sky-600 text-white hover:bg-sky-500' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed')
          }
        >
          {submitting ? 'Solicitando...' : 'Solicitar saque'}
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Meus saques</h2>
          <span className="text-xs text-zinc-400">{saques.length} itens</span>
        </div>

        {loading ? (
          <div className="mt-3 text-sm text-zinc-400">Carregando...</div>
        ) : saques.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Nenhum saque solicitado ainda.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {saques.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-100">
                    {s.status.toUpperCase()} • {s.metodo || 'pix'}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    solicitado: {fmtDate(s.solicitadoEm)}
                    {s._count?.itens ? ` • vendas: ${s._count.itens}` : ''}
                  </div>
                  {s.motivoRecusa ? (
                    <div className="mt-1 text-xs text-red-300">{s.motivoRecusa}</div>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-zinc-100">{brl(num(s.valorSolicitado))}</div>
                  {s.valorPago ? (
                    <div className="mt-0.5 text-xs text-zinc-400">pago: {brl(num(s.valorPago))}</div>
                  ) : (
                    <div className="mt-0.5 text-xs text-zinc-400">&nbsp;</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// caminho: app/afiliado/saques/SaquesClient.tsx
