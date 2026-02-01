'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronRight } from 'lucide-react';

import AdminStatusPill from './AdminStatusPill';

type RecentRow = {
  id: string;
  primary: string;
  secondary?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  rightMeta?: string | null;
};

type RecentCard = {
  key: string;
  title: string;
  href: string;
  emptyText?: string;
  rows: RecentRow[];
};

function cut(v: string, max = 44) {
  const s = (v || '').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function formatDateBR(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminRecentCardsRow({
  cards,
  columns = 3,
  maxRows = 4,
}: {
  cards: RecentCard[];
  columns?: 1 | 2 | 3 | 4;
  maxRows?: number;
}) {
  const gridCols =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : columns === 4
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {cards.map((card) => (
        <section
          key={card.key}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {card.title}
            </div>

            <Link
              href={card.href}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              Ver mais <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {card.rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
                {card.emptyText || 'Nenhum registro encontrado.'}
              </div>
            ) : (
              card.rows.slice(0, maxRows).map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {cut(r.primary, 56)}
                        </div>

                        {r.status ? (
                          <span className="shrink-0">
                            <AdminStatusPill status={r.status as any} />
                          </span>
                        ) : null}
                      </div>

                      {r.secondary ? (
                        <div className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-300">
                          {cut(r.secondary, 80)}
                        </div>
                      ) : null}

                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        Atualizado: {formatDateBR(r.updatedAt)}
                      </div>
                    </div>

                    {r.rightMeta ? (
                      <div className="shrink-0 text-right text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        {r.rightMeta}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
