'use client';

// app/admin/_components/AdminStatusPill.tsx
import React from 'react';

type Status =
  | 'rascunho'
  | 'publicado'
  | 'pausado'
  | 'arquivado'
  | 'ativo'
  | 'inativo'
  | 'pendente'
  | string;

const normalize = (s: Status) => (s ?? '').toString().trim().toLowerCase();

function getLabel(status: Status) {
  const s = normalize(status);

  if (s === 'publicado') return 'Publicado';
  if (s === 'ativo') return 'Ativo';
  if (s === 'pausado') return 'Pausado';
  if (s === 'arquivado') return 'Arquivado';
  if (s === 'rascunho') return 'Rascunho';
  if (s === 'inativo') return 'Inativo';
  if (s === 'pendente') return 'Pendente';

  // fallback: capitaliza
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getClasses(status: Status) {
  const s = normalize(status);

  // Base visível em qualquer tema
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-none border shadow-sm';

  // Paleta:
  // - Claro: fundo bem leve + texto escuro + borda suave
  // - Escuro: fundo translúcido + texto claro + borda escura
  switch (s) {
    case 'publicado':
    case 'ativo':
      return [
        base,
        'bg-emerald-50 text-emerald-800 border-emerald-200',
        'dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25',
      ].join(' ');

    case 'pausado':
      return [
        base,
        'bg-amber-50 text-amber-800 border-amber-200',
        'dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/25',
      ].join(' ');

    case 'arquivado':
      return [
        base,
        'bg-rose-50 text-rose-800 border-rose-200',
        'dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/25',
      ].join(' ');

    case 'rascunho':
      return [
        base,
        'bg-sky-50 text-sky-800 border-sky-200',
        'dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-500/25',
      ].join(' ');

    case 'inativo':
      return [
        base,
        'bg-zinc-100 text-zinc-700 border-zinc-200',
        'dark:bg-zinc-400/10 dark:text-zinc-200 dark:border-zinc-500/25',
      ].join(' ');

    case 'pendente':
      return [
        base,
        'bg-violet-50 text-violet-800 border-violet-200',
        'dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/25',
      ].join(' ');

    default:
      return [
        base,
        'bg-zinc-100 text-zinc-700 border-zinc-200',
        'dark:bg-zinc-400/10 dark:text-zinc-200 dark:border-zinc-500/25',
      ].join(' ');
  }
}

export default function AdminStatusPill({ status }: { status: Status }) {
  return <span className={getClasses(status)}>{getLabel(status)}</span>;
}
