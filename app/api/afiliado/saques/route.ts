// caminho: app/api/afiliado/saques/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function toInt(value: string | null, def: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return def;
  return Math.floor(n);
}

function toMoney(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
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

async function getAfiliadoBySession() {
  const session = await getSession();

  if (session.role !== 'affiliate' && session.role !== 'master') {
    return { error: NextResponse.json({ ok: false, error: 'Acesso negado' }, { status: 403 }) };
  }

  const afiliado = await prisma.afiliado.findFirst({
    where: {
      OR: [{ email: session.userName ?? undefined }, { nome: session.userName ?? undefined }],
    },
    select: { id: true, nome: true, pixTipo: true, pixChave: true },
  });

  if (!afiliado) {
    return {
      error: NextResponse.json({ ok: false, error: 'Afiliado não encontrado' }, { status: 404 }),
    };
  }

  return { afiliado };
}

async function getSaldoDisponivel(afiliadoId: string) {
  const itens = await prisma.afiliadoLancamentoSaldo.findMany({
    where: { afiliadoId, status: 'disponivel' },
    select: { tipo: true, valor: true },
    take: 5000,
  });

  const saldo = itens.reduce((acc, i) => {
    const v = Number(i.valor);
    return i.tipo === 'credito' ? acc + v : acc - v;
  }, 0);

  // nunca negativo
  return Math.max(0, saldo);
}

/**
 * GET /api/afiliado/saques
 * Query:
 * - status=solicitado|aprovado|pago|recusado|cancelado
 * - take=1..200 (default 50)
 * - skip=0.. (default 0)
 */
export async function GET(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') ?? '').toLowerCase();

  const take = Math.min(Math.max(toInt(searchParams.get('take'), 50), 1), 200);
  const skip = Math.max(toInt(searchParams.get('skip'), 0), 0);

  const statusAllowed = new Set(['solicitado', 'aprovado', 'pago', 'recusado', 'cancelado']);
  const where: any = { afiliadoId: afiliado!.id };
  if (statusAllowed.has(status)) where.status = status;

  const [saques, total, saldoDisponivel] = await Promise.all([
    prisma.afiliadoSaque.findMany({
      where,
      orderBy: { solicitadoEm: 'desc' },
      take,
      skip,
      select: {
        id: true,
        status: true,
        valorSolicitado: true,
        valorPago: true,
        metodo: true,
        pixTipo: true,
        pixChave: true,
        solicitadoEm: true,
        aprovadoEm: true,
        pagoEm: true,
        motivoRecusa: true,
        _count: { select: { itens: true } },
      },
    }),
    prisma.afiliadoSaque.count({ where }),
    getSaldoDisponivel(afiliado!.id),
  ]);

  return NextResponse.json(
    {
      ok: true,
      afiliado,
      saldoDisponivel,
      paginacao: { total, take, skip, hasMore: skip + saques.length < total },
      saques,
    },
    { status: 200 }
  );
}

/**
 * POST /api/afiliado/saques
 *
 * Body:
 * - modo: "total" | "parcial" | "por_venda"
 * - valor?: number (quando modo=parcial)
 * - vendaIds?: string[] (quando modo=por_venda)
 * - metodo?: "pix" | "credito" | "manual"
 * - pixTipo?: string
 * - pixChave?: string
 */
export async function POST(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const modo = String(body?.modo ?? '').toLowerCase();
  if (modo !== 'total' && modo !== 'parcial' && modo !== 'por_venda') {
    return NextResponse.json(
      { ok: false, error: 'modo deve ser "total", "parcial" ou "por_venda"' },
      { status: 400 }
    );
  }

  const metodo = body?.metodo ? String(body.metodo).toLowerCase() : 'pix';
  const metodoAllowed = new Set(['pix', 'credito', 'manual']);
  if (!metodoAllowed.has(metodo)) {
    return NextResponse.json(
      { ok: false, error: 'metodo deve ser "pix", "credito" ou "manual"' },
      { status: 400 }
    );
  }

  // ✅ PIX: aceita override do body; se não vier, usa o que está salvo no afiliado
  // ✅ se o método NÃO for pix, não exige nem tenta validar pix
  const pixTipo =
    typeof body?.pixTipo === 'string' && body.pixTipo.trim()
      ? body.pixTipo.trim()
      : afiliado!.pixTipo ?? null;

  const pixChave =
    typeof body?.pixChave === 'string' && body.pixChave.trim()
      ? body.pixChave.trim()
      : afiliado!.pixChave ?? null;

  if (metodo === 'pix' && (!pixTipo || !pixChave)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Informe pixTipo e pixChave para saque via PIX (ou cadastre o PIX do afiliado).',
      },
      { status: 400 }
    );
  }

  const saldoDisponivel = await getSaldoDisponivel(afiliado!.id);

  // calcula valorSolicitado conforme modo
  let valorSolicitado = 0;

  // por_venda (normalizado)
  let vendaIds: string[] = [];
  let vendasDisponiveis: { id: string; comissaoValor: any }[] = [];

  if (modo === 'total') {
    valorSolicitado = saldoDisponivel;
  }

  if (modo === 'parcial') {
    const v = toMoney(body?.valor);
    if (!v) {
      return NextResponse.json({ ok: false, error: 'valor inválido' }, { status: 400 });
    }
    valorSolicitado = Number(v);
  }

  if (modo === 'por_venda') {
    vendaIds = Array.isArray(body?.vendaIds) ? body.vendaIds.map(String) : [];
    vendaIds = uniq(vendaIds.map((s) => s.trim()).filter(Boolean));

    if (vendaIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Informe vendaIds (lista de vendas)' },
        { status: 400 }
      );
    }

    // apenas vendas disponíveis
    vendasDisponiveis = await prisma.afiliadoVenda.findMany({
      where: {
        id: { in: vendaIds },
        afiliadoId: afiliado!.id,
        comissaoStatus: 'disponivel',
      },
      select: { id: true, comissaoValor: true },
    });

    if (vendasDisponiveis.length !== vendaIds.length) {
      return NextResponse.json(
        { ok: false, error: 'Uma ou mais vendas não estão disponíveis para saque' },
        { status: 400 }
      );
    }

    // impede sacar a mesma venda 2x (enquanto existir saque aberto/aprovado/pago)
    const jaVinculadas = await prisma.afiliadoSaqueItem.findMany({
      where: {
        vendaId: { in: vendaIds },
        saque: { status: { in: ['solicitado', 'aprovado', 'pago'] } },
      },
      select: { vendaId: true },
    });

    if (jaVinculadas.length > 0) {
      const ids = jaVinculadas.map((x) => x.vendaId);
      return NextResponse.json(
        { ok: false, error: `Vendas já vinculadas a saque: ${ids.join(', ')}` },
        { status: 409 }
      );
    }

    valorSolicitado = vendasDisponiveis.reduce((acc, v) => acc + Number(v.comissaoValor), 0);
  }

  if (valorSolicitado <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Sem saldo disponível para saque' },
      { status: 400 }
    );
  }

  if (valorSolicitado > saldoDisponivel) {
    return NextResponse.json(
      { ok: false, error: 'Valor solicitado maior que o saldo disponível' },
      { status: 400 }
    );
  }

  const valorStr = valorSolicitado.toFixed(2);

  const result = await prisma.$transaction(async (tx) => {
    const saque = await tx.afiliadoSaque.create({
      data: {
        afiliadoId: afiliado!.id,
        status: 'solicitado',
        valorSolicitado: valorStr,
        metodo,

        // ✅ só grava pix quando o método for pix
        pixTipo: metodo === 'pix' ? pixTipo : null,
        pixChave: metodo === 'pix' ? pixChave : null,
      },
      select: {
        id: true,
        status: true,
        valorSolicitado: true,
        metodo: true,
        pixTipo: true,
        pixChave: true,
        solicitadoEm: true,
      },
    });

    // itens por venda (quando aplicável)
    if (modo === 'por_venda') {
      // usa o que já foi validado fora (mesmos ids)
      for (const v of vendasDisponiveis) {
        await tx.afiliadoSaqueItem.create({
          data: {
            saqueId: saque.id,
            vendaId: v.id,
            valorComissao: v.comissaoValor,
          },
        });
      }
    }

    // débito no ledger para "reservar" o valor (remove do saldo disponível)
    await tx.afiliadoLancamentoSaldo.create({
      data: {
        afiliadoId: afiliado!.id,
        tipo: 'debito',
        origem: 'saque',
        valor: valorStr,
        status: 'disponivel',
        saqueId: saque.id,
        descricao:
          modo === 'por_venda'
            ? 'Solicitação de saque (por venda)'
            : modo === 'parcial'
            ? 'Solicitação de saque (parcial)'
            : 'Solicitação de saque (total)',
      },
      select: { id: true },
    });

    return saque;
  });

  return NextResponse.json({ ok: true, saque: result }, { status: 201 });
}

// caminho: app/api/afiliado/saques/route.ts
