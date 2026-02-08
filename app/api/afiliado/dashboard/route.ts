// caminho: app/api/afiliado/dashboard/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();

  if (session.role !== 'affiliate' && session.role !== 'master') {
    return NextResponse.json(
      { ok: false, error: 'Acesso negado' },
      { status: 403 }
    );
  }

  // 🔹 vínculo simples por email ou nome (fase inicial)
  const afiliado = await prisma.afiliado.findFirst({
    where: {
      OR: [
        { email: session.userName ?? undefined },
        { nome: session.userName ?? undefined },
      ],
    },
  });

  if (!afiliado) {
    return NextResponse.json(
      { ok: false, error: 'Afiliado não encontrado' },
      { status: 404 }
    );
  }

  const [lancamentos, vendasRecentes] = await Promise.all([
    prisma.afiliadoLancamentoSaldo.findMany({
      where: { afiliadoId: afiliado.id },
    }),
    prisma.afiliadoVenda.findMany({
      where: { afiliadoId: afiliado.id },
      orderBy: { criadoEm: 'desc' },
      take: 5,
    }),
  ]);

  const saldoDisponivel = lancamentos
    .filter(l => l.status === 'disponivel')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const saldoPendente = lancamentos
    .filter(l => l.status === 'pendente')
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const totalComissao = lancamentos
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const totalVendido = vendasRecentes
    .reduce((acc, v) => acc + Number(v.valorVenda), 0);

  return NextResponse.json({
    ok: true,
    afiliado: {
      id: afiliado.id,
      nome: afiliado.nome,
    },
    resumo: {
      saldoDisponivel,
      saldoPendente,
      totalComissao,
      totalVendido,
    },
    vendasRecentes,
  });
}

// caminho: app/api/afiliado/dashboard/route.ts
