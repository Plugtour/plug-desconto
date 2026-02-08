// caminho: app/afiliado/page.tsx

import { requireRole, AccessDeniedError } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function brl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

function isMissingTableError(err: unknown) {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  // P2021 = "The table does not exist in the current database."
  return err.code === 'P2021';
}

export default async function AffiliatePanel() {
  try {
    await requireRole(['affiliate', 'master']);
  } catch (err) {
    if (err instanceof AccessDeniedError) redirect('/acesso-negado');
    throw err;
  }

  const session = await getSession();
  const key = (session.userName ?? '').trim();

  // Se "key" tem @, tratamos como email; senão, como nome.
  const looksLikeEmail = key.includes('@');

  const afiliado = await prisma.afiliado.findFirst({
    where: {
      OR: [
        ...(looksLikeEmail ? [{ email: { equals: key, mode: 'insensitive' as any } }] : []),
        { nome: { equals: key, mode: 'insensitive' as any } },
        ...(looksLikeEmail ? [{ nome: { equals: key } }] : []),
        ...(looksLikeEmail ? [{ email: key }] : []),
      ],
    },
  });

  if (!afiliado) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Painel do Afiliado</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
          Não encontramos seu cadastro de afiliado para esta sessão.
          <div className="mt-2 text-xs text-zinc-500">
            Sessão atual: <span className="text-zinc-300">{key || '(vazio)'}</span>
          </div>
          <div className="mt-3">
            <Link href="/entrar" className="text-xs font-semibold text-zinc-200 underline">
              Ir para /entrar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Se as tabelas ainda não existem, não quebra o painel.
  let lancamentos: any[] = [];
  let vendasRecentes: any[] = [];
  let totalVendido = 0;

  try {
    [lancamentos, vendasRecentes] = await Promise.all([
      prisma.afiliadoLancamentoSaldo.findMany({
        where: { afiliadoId: afiliado.id },
        orderBy: { criadoEm: 'desc' },
        take: 250,
      }),
      prisma.afiliadoVenda.findMany({
        where: { afiliadoId: afiliado.id },
        orderBy: { criadoEm: 'desc' },
        take: 8,
      }),
    ]);

    totalVendido = await prisma.afiliadoVenda
      .aggregate({
        where: { afiliadoId: afiliado.id },
        _sum: { valorVenda: true },
      })
      .then((r) => Number(r._sum.valorVenda ?? 0));
  } catch (e) {
    if (!isMissingTableError(e)) throw e;
    // tabela não existe -> mantém arrays vazios e total 0
  }

  const saldoDisponivel = lancamentos
    .filter((l) => l.status === 'disponivel')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const saldoPendente = lancamentos
    .filter((l) => l.status === 'pendente')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const totalComissao = lancamentos.reduce((acc, l) => acc + Number(l.valor), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Painel do Afiliado</h1>
          <div className="text-sm text-zinc-400">
            Olá, <span className="text-zinc-200">{afiliado.nome}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/afiliado/saques"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          <div className="font-semibold text-zinc-100">Saques</div>
          <div className="mt-1 text-xs text-zinc-400">Solicitar e acompanhar seus repasses</div>
        </Link>

        <Link
          href="/afiliado/cupons"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          <div className="font-semibold text-zinc-100">Cupons</div>
          <div className="mt-1 text-xs text-zinc-400">Criar e gerenciar cupons de desconto</div>
        </Link>

        <Link
          href="/afiliado/extrato"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 transition hover:bg-zinc-900"
        >
          <div className="font-semibold text-zinc-100">Extrato</div>
          <div className="mt-1 text-xs text-zinc-400">Vendas e lançamentos do saldo</div>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Saldo disponível</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">{brl(saldoDisponivel)}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Saldo pendente</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">{brl(saldoPendente)}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Total de comissão</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">{brl(totalComissao)}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs text-zinc-400">Total vendido</div>
          <div className="mt-1 text-xl font-bold text-zinc-100">{brl(totalVendido)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Vendas recentes</h2>
          <span className="text-xs text-zinc-400">últimas {vendasRecentes.length}</span>
        </div>

        {vendasRecentes.length === 0 ? (
          <div className="mt-3 text-sm text-zinc-400">Ainda não há vendas registradas para este afiliado.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {vendasRecentes.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-100">{v.partnerName || 'Venda'}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    {fmtDate(v.criadoEm)} • {v.origem || 'origem não informada'}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-zinc-100">{brl(Number(v.valorVenda))}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    comissão: {brl(Number(v.comissaoValor))} • {v.comissaoStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
        Próximos itens: cupons, extrato completo, solicitar saque, rede de afiliados.
      </div>
    </div>
  );
}
