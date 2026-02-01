'use client';

import Link from 'next/link';
import React from 'react';

export type Tone = 'blue' | 'red' | 'amber' | 'green' | 'teal' | 'zinc';

export type SummaryItem = {
  label: string;
  count: number;
  tone: Tone;
};

export type SummaryCard = {
  title: string;
  total: number;
  items: SummaryItem[];
  href?: string;
};

export type AdminDashboardSummaryProps = {
  cards: SummaryCard[];
};

/* 🎨 Mapa único de cores (texto + badge) */
const toneMap: Record<
  Tone,
  {
    text: string;
    badge: string;
  }
> = {
  blue: {
    text: 'text-sky-700 dark:text-sky-300',
    badge:
      'bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-500/15 dark:border-sky-500/30 dark:text-sky-200',
  },
  red: {
    text: 'text-rose-700 dark:text-rose-300',
    badge:
      'bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-200',
  },
  amber: {
    // ✅ Pausado: texto e número na mesma cor
    text: 'text-amber-800 dark:text-amber-200',
    badge:
      'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-200',
  },
  green: {
    text: 'text-emerald-700 dark:text-emerald-300',
    badge:
      'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-200',
  },
  teal: {
    text: 'text-teal-700 dark:text-teal-300',
    badge:
      'bg-teal-100 border-teal-200 text-teal-700 dark:bg-teal-500/15 dark:border-teal-500/30 dark:text-teal-200',
  },
  zinc: {
    text: 'text-zinc-600 dark:text-zinc-300',
    badge:
      'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:border-zinc-500/30 dark:text-zinc-200',
  },
};

function TonePill({ tone, value }: { tone: Tone; value: number }) {
  return (
    <span
      className={[
        'inline-flex min-w-6 items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        toneMap[tone].badge,
      ].join(' ')}
    >
      {value}
    </span>
  );
}

function SummaryCardUI({ card }: { card: SummaryCard }) {
  const content = (
    <div className="h-full w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{card.title}</div>

      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{card.total}</div>

      <div className="mt-3 space-y-2">
        {card.items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-3">
            {/* ✅ TEXTO COM A MESMA COR DO NÚMERO */}
            <span className={['text-[12px] font-medium', toneMap[it.tone].text].join(' ')}>{it.label}</span>

            <TonePill tone={it.tone} value={it.count} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!card.href) return content;

  return (
    <Link
      href={card.href}
      className="block h-full w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
    >
      {content}
    </Link>
  );
}

export default function AdminDashboardSummary({ cards }: AdminDashboardSummaryProps) {
  return (
    <>
      {/* MOBILE: carrossel (1 card e meio) */}
      <section className="w-full md:hidden">
        <div className="no-scrollbar flex w-full gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {cards.map((card) => (
            <div key={card.title} className="snap-start shrink-0 w-[66%]">
              <SummaryCardUI card={card} />
            </div>
          ))}
        </div>
      </section>

      {/* DESKTOP: todos os cards lado a lado */}
      <section className="hidden w-full md:block">
        <div className="flex w-full gap-4">
          {cards.map((card) => (
            <div key={card.title} className="w-0 flex-1 min-w-0">
              <SummaryCardUI card={card} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
