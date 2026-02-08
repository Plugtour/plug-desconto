// caminho: app/api/afiliado/extrato/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function toDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toInt(value: string | null, def: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.floor(n);
}

async function getAfiliadoBySession() {
  const session = await getSession();

  if (session.role !== 'affiliate' && session.role !== 'master') {
    return { error: NextResponse.json({ ok: false, error: 'Acesso negado' }, { status: 403 }) };
  }

  const afiliado = await prisma.afiliado.findFirst({
    where: {
      OR: [{ email: session.userName ?? undefined }, { nome: session.userName ?? undefined }],
    },
    select: { id: true, nome: true },
  });

  if (!afiliado) {
    return {
      error: NextResponse.json({ ok: false, error: 'Afiliado não encontrado' }, { status: 404 }),
    };
  }

  return { afiliado };
}

function sumNetByStatus(itens: Array<{ tipo: string; valor: any }>) {
  return itens.reduce((acc, i) => {
    const v = Number(i.valor);
    if (!Number.isFinite(v)) return acc;
    return i.tipo === 'credito' ? acc + v : acc - v;
  }, 0);
}

/**
 * GET /api/afiliado/extrato
 *
 * ✅ Sem query (modo usado pelo front):
 * - retorna resumo + últimos lançamentos + últimas vendas
 *
 * Query params (mantido):
 * - tipo=vendas|saldo
 * - status=pendente|disponivel|pago|cancelado
 * - de=YYYY-MM-DD
 * - ate=YYYY-MM-DD
 * - take=1..200
 * - skip=0..
 */
export async function GET(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const tipoParam = searchParams.get('tipo');
  const tipo = (tipoParam ?? '').toLowerCase();

  // ✅ MODO PADRÃO (front atual): sem tipo => payload "combinado"
  if (!tipo) {
    const [lancAll, vendasRecentes, totalVendidoAgg] = await Promise.all([
      prisma.afiliadoLancamentoSaldo.findMany({
        where: { afiliadoId: afiliado!.id },
        orderBy: { criadoEm: 'desc' },
        take: 200,
        select: {
          id: true,
          tipo: true,
          origem: true,
          valor: true,
          status: true,
          descricao: true,
          criadoEm: true,
        },
      }),
      prisma.afiliadoVenda.findMany({
        where: { afiliadoId: afiliado!.id },
        orderBy: { criadoEm: 'desc' },
        take: 8,
        select: {
          id: true,
          partnerName: true,
          origem: true,
          valorVenda: true,
          comissaoValor: true,
          comissaoStatus: true,
          criadoEm: true,
        },
      }),
      prisma.afiliadoVenda.aggregate({
        where: { afiliadoId: afiliado!.id },
        _sum: { valorVenda: true },
      }),
    ]);

    // saldo por status (net = credito - debito)
    const itensDisp = lancAll.filter((l) => l.status === 'disponivel');
    const itensPend = lancAll.filter((l) => l.status === 'pendente');
    const itensPago = lancAll.filter((l) => l.status === 'pago');

    const saldoDisponivel = Math.max(0, sumNetByStatus(itensDisp as any));
    const saldoPendente = Math.max(0, sumNetByStatus(itensPend as any));
    const saldoPago = Math.max(0, sumNetByStatus(itensPago as any));

    const totalLancamentos = sumNetByStatus(lancAll as any);
    const totalVendido = Number(totalVendidoAgg._sum.valorVenda ?? 0);

    return NextResponse.json(
      {
        ok: true,
        resumo: {
          saldoDisponivel,
          saldoPendente,
          saldoPago,
          totalLancamentos,
          totalVendido,
        },
        lancamentos: lancAll,
        vendasRecentes,
      },
      { status: 200 }
    );
  }

  // ====== modos antigos (mantidos) ======

  const status = (searchParams.get('status') ?? '').toLowerCase();
  const de = toDate(searchParams.get('de'));
  const ate = toDate(searchParams.get('ate'));

  const take = Math.min(Math.max(toInt(searchParams.get('take'), 50), 1), 200);
  const skip = Math.max(toInt(searchParams.get('skip'), 0), 0);

  const statusAllowed = new Set(['pendente', 'disponivel', 'pago', 'cancelado']);
  const statusFilter = statusAllowed.has(status) ? status : null;

  const dateFilter: any = {};
  if (de) dateFilter.gte = de;
  if (ate) {
    const end = new Date(ate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  if (tipo === 'saldo') {
    const where: any = { afiliadoId: afiliado!.id };
    if (statusFilter) where.status = statusFilter;
    if (de || ate) where.criadoEm = dateFilter;

    const [itens, total] = await Promise.all([
      prisma.afiliadoLancamentoSaldo.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        take,
        skip,
        select: {
          id: true,
          tipo: true,
          origem: true,
          valor: true,
          status: true,
          descricao: true,
          criadoEm: true,
          vendaId: true,
          saqueId: true,
        },
      }),
      prisma.afiliadoLancamentoSaldo.count({ where }),
    ]);

    const resumo = itens.reduce(
      (acc, i) => {
        const v = Number(i.valor);
        if (i.status === 'disponivel') acc.disponivel += v;
        if (i.status === 'pendente') acc.pendente += v;
        if (i.status === 'pago') acc.pago += v;
        if (i.status === 'cancelado') acc.cancelado += v;
        acc.total += v;
        return acc;
      },
      { disponivel: 0, pendente: 0, pago: 0, cancelado: 0, total: 0 }
    );

    return NextResponse.json(
      {
        ok: true,
        tipo: 'saldo',
        afiliado,
        paginacao: { total, take, skip, hasMore: skip + itens.length < total },
        resumo,
        itens,
      },
      { status: 200 }
    );
  }

  // default: vendas
  const whereV: any = { afiliadoId: afiliado!.id };
  if (statusFilter) whereV.comissaoStatus = statusFilter;
  if (de || ate) whereV.criadoEm = dateFilter;

  const [itens, total] = await Promise.all([
    prisma.afiliadoVenda.findMany({
      where: whereV,
      orderBy: { criadoEm: 'desc' },
      take,
      skip,
      select: {
        id: true,
        criadoEm: true,
        origem: true,
        partnerName: true,
        categoryId: true,
        offerId: true,
        valorVenda: true,
        moeda: true,
        comissaoTipo: true,
        comissaoValor: true,
        comissaoStatus: true,
        liberarEm: true,
        referenciaTipo: true,
        referenciaExterna: true,
        cupomId: true,
      },
    }),
    prisma.afiliadoVenda.count({ where: whereV }),
  ]);

  const resumo = itens.reduce(
    (acc, v) => {
      const vv = Number(v.valorVenda);
      const cc = Number(v.comissaoValor);
      acc.totalVendas += vv;
      acc.totalComissao += cc;

      if (v.comissaoStatus === 'disponivel') acc.disponivel += cc;
      if (v.comissaoStatus === 'pendente') acc.pendente += cc;
      if (v.comissaoStatus === 'pago') acc.pago += cc;
      if (v.comissaoStatus === 'cancelado') acc.cancelado += cc;

      return acc;
    },
    {
      totalVendas: 0,
      totalComissao: 0,
      disponivel: 0,
      pendente: 0,
      pago: 0,
      cancelado: 0,
    }
  );

  return NextResponse.json(
    {
      ok: true,
      tipo: 'vendas',
      afiliado,
      paginacao: { total, take, skip, hasMore: skip + itens.length < total },
      resumo,
      itens,
    },
    { status: 200 }
  );
}

// caminho: app/api/afiliado/extrato/route.ts
