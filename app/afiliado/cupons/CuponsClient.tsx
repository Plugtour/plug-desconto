// caminho: app/afiliado/cupons/CuponsClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';

type Cupom = {
  id: string;
  codigo: string;
  ativo: boolean;
  descontoTipo: 'percentual' | 'valor_fixo';
  descontoValor: any;
  usos: number;
  maxUsos: number | null;
  validoDe: string | null;
  validoAte: string | null;
  partnerName: string | null;
  categoryId: string | null;
  offerId: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

type ListResp = { ok: boolean; cupons?: Cupom[]; error?: string };
type CreateResp = { ok: boolean; cupom?: Cupom; error?: string };
type PatchResp = { ok: boolean; cupom?: Cupom; error?: string };

function fmtDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
}

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CuponsClient() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [cupons, setCupons] = useState<Cupom[]>([]);

  // form
  const [codigo, setCodigo] = useState('');
  const [descontoTipo, setDescontoTipo] = useState<'percentual' | 'valor_fixo'>('percentual');
  const [descontoValor, setDescontoValor] = useState('');
  const [maxUsos, setMaxUsos] = useState('');
  const [validoDe, setValidoDe] = useState('');
  const [validoAte, setValidoAte] = useState('');
  const [ativo, setAtivo] = useState(true);

  const listToShow = useMemo(() => {
    if (filter === 'ativos') return cupons.filter((c) => c.ativo);
    if (filter === 'inativos') return cupons.filter((c) => !c.ativo);
    return cupons;
  }, [cupons, filter]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs =
        filter === 'ativos'
          ? '?ativo=true'
          : filter === 'inativos'
          ? '?ativo=false'
          : '';
      const res = await fetch(`/api/afiliado/cupons${qs}`, { cache: 'no-store' });
      const json = (await res.json()) as ListResp;

      if (!res.ok || !json?.ok) {
        setErr(json?.error || 'Falha ao carregar cupons');
        setCupons([]);
        return;
      }

      setCupons(Array.isArray(json.cupons) ? json.cupons : []);
    } catch {
      setErr('Falha ao carregar cupons');
      setCupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function copiar(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // sem alerta para não poluir
    }
  }

  async function criarCupom() {
    setErr(null);
    setBusy(true);

    const body: any = {
      codigo,
      descontoTipo,
      descontoValor: Number(descontoValor),
      ativo,
    };

    if (maxUsos.trim()) body.maxUsos = Number(maxUsos);
    if (validoDe) body.validoDe = validoDe;
    if (validoAte) body.validoAte = validoAte;

    try {
      const res = await fetch('/api/afiliado/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as CreateResp;

      if (!res.ok || !json?.ok) {
        setErr(json?.error || 'Falha ao criar cupom');
        return;
      }

      // limpa
      setCodigo('');
      setDescontoTipo('percentual');
      setDescontoValor('');
      setMaxUsos('');
      setValidoDe('');
      setValidoAte('');
      setAtivo(true);

      await load();

      // volta pra lista (topo)
      const el = document.getElementById('lista-cupons');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setErr('Falha ao criar cupom');
    } finally {
      setBusy(false);
    }
  }

  async function setAtivoCupom(id: string, next: boolean) {
    setErr(null);
    setBusy(true);

    try {
      const res = await fetch('/api/afiliado/cupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: next }),
      });

      const json = (await res.json()) as PatchResp;

      if (!res.ok || !json?.ok) {
        setErr(json?.error || 'Falha ao atualizar cupom');
        return;
      }

      setCupons((prev) => prev.map((c) => (c.id === id ? (json.cupom as Cupom) : c)));
    } catch {
      setErr('Falha ao atualizar cupom');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-red-300">
          {err}
        </div>
      ) : null}

      {/* criar */}
      <div id="criar-cupom" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">Criar cupom</div>

          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
          >
            Atualizar
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="text-xs text-zinc-400">Código</div>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="EX: MEUCUPOM10"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
            <div className="mt-1 text-[11px] text-zinc-500">
              Letras/números, sem espaço (o sistema normaliza).
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-400">Tipo</div>
            <select
              value={descontoTipo}
              onChange={(e) => setDescontoTipo(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            >
              <option value="percentual">Percentual</option>
              <option value="valor_fixo">Valor fixo</option>
            </select>
          </div>

          <div>
            <div className="text-xs text-zinc-400">
              {descontoTipo === 'percentual' ? 'Percentual (0-100)' : 'Valor (R$)'}
            </div>
            <input
              value={descontoValor}
              onChange={(e) => setDescontoValor(e.target.value)}
              inputMode="decimal"
              placeholder={descontoTipo === 'percentual' ? '10' : '20'}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <div>
            <div className="text-xs text-zinc-400">Máx. usos (opcional)</div>
            <input
              value={maxUsos}
              onChange={(e) => setMaxUsos(e.target.value)}
              inputMode="numeric"
              placeholder="Ex: 100"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-400">Válido de (opcional)</div>
            <input
              value={validoDe}
              onChange={(e) => setValidoDe(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-400">Válido até (opcional)</div>
            <input
              value={validoAte}
              onChange={(e) => setValidoAte(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500/50"
            />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4"
              />
              Ativo
            </label>
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={criarCupom}
          className={
            'mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ' +
            (!busy
              ? 'bg-sky-600 text-white hover:bg-sky-500'
              : 'bg-zinc-800 text-zinc-400 cursor-not-allowed')
          }
        >
          {busy ? 'Salvando...' : 'Criar cupom'}
        </button>
      </div>

      {/* lista */}
      <div id="lista-cupons" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">Meus cupons</div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 outline-none hover:bg-zinc-900"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>

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
        ) : listToShow.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Nenhum cupom encontrado.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {listToShow.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-zinc-100">{c.codigo}</div>

                    <span
                      className={
                        'rounded-full border px-2 py-0.5 text-[11px] font-medium ' +
                        (c.ativo
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-300')
                      }
                    >
                      {c.ativo ? 'ativo' : 'inativo'}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-zinc-400">
                    desconto:{' '}
                    {c.descontoTipo === 'percentual'
                      ? `${num(c.descontoValor)}%`
                      : brl(num(c.descontoValor))}
                    {' • '}
                    usos: {c.usos}
                    {c.maxUsos ? `/${c.maxUsos}` : ''}
                    {' • '}
                    válido: {fmtDate(c.validoDe)} → {fmtDate(c.validoAte)}
                  </div>

                  {(c.partnerName || c.categoryId || c.offerId) ? (
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {c.partnerName ? `parceiro: ${c.partnerName}` : null}
                      {c.partnerName && (c.categoryId || c.offerId) ? ' • ' : null}
                      {c.categoryId ? `categoria: ${c.categoryId}` : null}
                      {c.categoryId && c.offerId ? ' • ' : null}
                      {c.offerId ? `oferta: ${c.offerId}` : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copiar(c.codigo)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
                  >
                    Copiar
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setAtivoCupom(c.id, !c.ativo)}
                    className={
                      'rounded-lg border px-3 py-1.5 text-xs transition ' +
                      (c.ativo
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15')
                    }
                  >
                    {c.ativo ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// caminho: app/afiliado/cupons/CuponsClient.tsx
