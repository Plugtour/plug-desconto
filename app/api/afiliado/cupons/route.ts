// caminho: app/api/afiliado/cupons/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function normCode(value: unknown) {
  const s = String(value ?? '').trim().toUpperCase();
  // deixa só letras/números/_/-
  return s.replace(/[^A-Z0-9_-]/g, '');
}

function toMoneyString(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n.toFixed(2);
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
  });

  if (!afiliado) {
    return {
      error: NextResponse.json({ ok: false, error: 'Afiliado não encontrado' }, { status: 404 }),
    };
  }

  return { afiliado };
}

export async function GET(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const ativoParam = searchParams.get('ativo'); // "true" | "false" | null

  const where: any = { afiliadoId: afiliado!.id };
  if (ativoParam === 'true') where.ativo = true;
  if (ativoParam === 'false') where.ativo = false;

  const cupons = await prisma.afiliadoCupom.findMany({
    where,
    orderBy: { atualizadoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      codigo: true,
      ativo: true,
      descontoTipo: true,
      descontoValor: true,
      usos: true,
      maxUsos: true,
      validoDe: true,
      validoAte: true,
      partnerName: true,
      categoryId: true,
      offerId: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });

  return NextResponse.json({ ok: true, cupons }, { status: 200 });
}

export async function POST(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const codigo = normCode(body?.codigo);
  if (!codigo || codigo.length < 4) {
    return NextResponse.json(
      { ok: false, error: 'Informe um código válido (mínimo 4 caracteres)' },
      { status: 400 }
    );
  }

  const descontoTipo = String(body?.descontoTipo ?? '').trim();
  if (descontoTipo !== 'percentual' && descontoTipo !== 'valor_fixo') {
    return NextResponse.json(
      { ok: false, error: 'descontoTipo deve ser "percentual" ou "valor_fixo"' },
      { status: 400 }
    );
  }

  const descontoValor = toMoneyString(body?.descontoValor);
  if (!descontoValor) {
    return NextResponse.json({ ok: false, error: 'descontoValor inválido' }, { status: 400 });
  }

  // regras simples
  if (descontoTipo === 'percentual') {
    const pct = Number(descontoValor);
    if (pct <= 0 || pct > 100) {
      return NextResponse.json(
        { ok: false, error: 'Percentual deve ser entre 0 e 100' },
        { status: 400 }
      );
    }
  }

  const maxUsos =
    body?.maxUsos === null || body?.maxUsos === undefined ? null : Number(body.maxUsos);

  if (maxUsos !== null) {
    if (!Number.isFinite(maxUsos) || maxUsos <= 0) {
      return NextResponse.json({ ok: false, error: 'maxUsos inválido' }, { status: 400 });
    }
  }

  const validoDe = body?.validoDe ? new Date(body.validoDe) : null;
  const validoAte = body?.validoAte ? new Date(body.validoAte) : null;

  if (validoDe && Number.isNaN(validoDe.getTime())) {
    return NextResponse.json({ ok: false, error: 'validoDe inválido' }, { status: 400 });
  }
  if (validoAte && Number.isNaN(validoAte.getTime())) {
    return NextResponse.json({ ok: false, error: 'validoAte inválido' }, { status: 400 });
  }

  // opcional: filtros
  const partnerName =
    typeof body?.partnerName === 'string' && body.partnerName.trim()
      ? body.partnerName.trim()
      : null;

  const categoryId =
    typeof body?.categoryId === 'string' && body.categoryId.trim()
      ? body.categoryId.trim()
      : null;

  const offerId =
    typeof body?.offerId === 'string' && body.offerId.trim() ? body.offerId.trim() : null;

  // checa duplicidade por afiliado (mais amigável que erro do banco)
  const jaExiste = await prisma.afiliadoCupom.findFirst({
    where: { afiliadoId: afiliado!.id, codigo },
    select: { id: true },
  });

  if (jaExiste) {
    return NextResponse.json({ ok: false, error: 'Já existe um cupom com esse código' }, { status: 409 });
  }

  const cupom = await prisma.afiliadoCupom.create({
    data: {
      afiliadoId: afiliado!.id,
      codigo,
      ativo: body?.ativo === false ? false : true,
      descontoTipo: descontoTipo as any,
      descontoValor, // string "12.34" funciona com Decimal
      maxUsos: maxUsos === null ? null : Math.floor(maxUsos),
      validoDe,
      validoAte,
      partnerName,
      categoryId,
      offerId,
    },
    select: {
      id: true,
      codigo: true,
      ativo: true,
      descontoTipo: true,
      descontoValor: true,
      usos: true,
      maxUsos: true,
      validoDe: true,
      validoAte: true,
      partnerName: true,
      categoryId: true,
      offerId: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });

  return NextResponse.json({ ok: true, cupom }, { status: 201 });
}

/**
 * PATCH /api/afiliado/cupons
 * Body:
 * - id: string
 * - ativo: boolean
 */
export async function PATCH(req: Request) {
  const { afiliado, error } = await getAfiliadoBySession();
  if (error) return error;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const id = String(body?.id ?? '').trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id é obrigatório' }, { status: 400 });
  }

  const ativo =
    typeof body?.ativo === 'boolean'
      ? body.ativo
      : String(body?.ativo ?? '').toLowerCase() === 'true';

  // garante que o cupom é do afiliado
  const existe = await prisma.afiliadoCupom.findFirst({
    where: { id, afiliadoId: afiliado!.id },
    select: { id: true },
  });

  if (!existe) {
    return NextResponse.json({ ok: false, error: 'Cupom não encontrado' }, { status: 404 });
  }

  const cupom = await prisma.afiliadoCupom.update({
    where: { id },
    data: { ativo },
    select: {
      id: true,
      codigo: true,
      ativo: true,
      descontoTipo: true,
      descontoValor: true,
      usos: true,
      maxUsos: true,
      validoDe: true,
      validoAte: true,
      partnerName: true,
      categoryId: true,
      offerId: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });

  return NextResponse.json({ ok: true, cupom }, { status: 200 });
}

// caminho: app/api/afiliado/cupons/route.ts
