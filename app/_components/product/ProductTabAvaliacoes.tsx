// app/_components/product/ProductTabAvaliacoes.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { StarsRow, SectionTitle } from './tabs/ProductDetailUI';

type ReviewItem = {
  id: string;
  name: string;
  date: string; // dd/mm/aaaa
  rating: number; // 1..5
  text: string;
  highlights: string[]; // tags: "Desconto obtido", "Ambiente", etc.
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ReviewStars({ rating }: { rating: number }) {
  return <StarsRow rating={rating} sizeClass="h-[16px] w-[16px]" />;
}

export default function ProductTabAvaliacoes() {
  // ✅ avaliações fictícias (mais completas)
  const reviews: ReviewItem[] = useMemo(
    () => [
      {
        id: 'r1',
        name: 'Rossana Gomes',
        date: '21/10/2022',
        rating: 5,
        text:
          'Experiência excelente! Pontualidade, atendimento super educado e tudo bem organizado. Recomendo demais.',
        highlights: ['Atendimento', 'Pontualidade', 'Organização'],
      },
      {
        id: 'r2',
        name: 'Marcelo von Ameln',
        date: '20/10/2022',
        rating: 4,
        text:
          'Muito bom! Saída no horário, comunicação clara e serviço confiável. Só poderia ter mais opções de horários.',
        highlights: ['Confiabilidade', 'Comunicação', 'Pontualidade'],
      },
      {
        id: 'r3',
        name: 'Lara Dambros',
        date: '19/10/2022',
        rating: 4,
        text:
          'Gostei bastante do atendimento. O processo foi fácil e o suporte respondeu rápido quando precisei.',
        highlights: ['Atendimento', 'Facilidade', 'Suporte'],
      },
      {
        id: 'r4',
        name: 'Celine Gomes',
        date: '17/10/2022',
        rating: 5,
        text:
          'Perfeito do começo ao fim. Equipe atenciosa e serviço exatamente como prometido. Voltaria a usar!',
        highlights: ['Equipe', 'Qualidade', 'Experiência geral'],
      },
      {
        id: 'r5',
        name: 'Bruno Silveira',
        date: '14/10/2022',
        rating: 3,
        text:
          'No geral foi ok. Teve um pequeno atraso, mas avisaram com antecedência e resolveram sem estresse.',
        highlights: ['Transparência', 'Resolução', 'Atendimento'],
      },
      {
        id: 'r6',
        name: 'Carolina Freitas',
        date: '11/10/2022',
        rating: 5,
        text:
          'Surpreendeu! Atendimento rápido, tudo muito prático e o resultado foi melhor do que eu esperava.',
        highlights: ['Praticidade', 'Rapidez', 'Resultado'],
      },
      {
        id: 'r7',
        name: 'Eduardo Nunes',
        date: '08/10/2022',
        rating: 4,
        text:
          'Bem organizado e com informações claras. Gostei de como foi simples resolver tudo pelo celular.',
        highlights: ['Organização', 'Informações', 'Facilidade'],
      },
      {
        id: 'r8',
        name: 'Patrícia Lima',
        date: '05/10/2022',
        rating: 5,
        text:
          'Atendimento impecável! Me senti bem atendida do início ao fim e tudo funcionou certinho.',
        highlights: ['Atendimento', 'Confiabilidade', 'Experiência geral'],
      },
      {
        id: 'r9',
        name: 'Henrique Moraes',
        date: '02/10/2022',
        rating: 4,
        text:
          'Gostei bastante. Se tivesse um lembrete automático antes do horário seria perfeito, mas foi muito bom.',
        highlights: ['Serviço', 'Organização', 'Pontualidade'],
      },
      {
        id: 'r10',
        name: 'Fernanda Siqueira',
        date: '29/09/2022',
        rating: 5,
        text:
          'Excelente custo-benefício. Tudo muito bem explicado e sem complicação. Recomendo para amigos.',
        highlights: ['Custo-benefício', 'Clareza', 'Facilidade'],
      },
    ],
    [],
  );

  // filtro simples (todas / 5 / 4 / 3 / 2 / 1)
  const [filter, setFilter] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => Math.round(r.rating) === filter);
  }, [filter, reviews]);

  return (
    <div className="mt-4">
      <SectionTitle>Avaliações</SectionTitle>

      <div className="mt-3">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todas
          </FilterChip>
          {[5, 4, 3, 2, 1].map((n) => (
            <FilterChip key={n} active={filter === n} onClick={() => setFilter(n)}>
              {n}★
            </FilterChip>
          ))}
        </div>

        {/* Lista */}
        <div className="mt-3 space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-[12px] border border-black/10 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-zinc-800">{r.name}</div>
                  <div className="mt-1">
                    <ReviewStars rating={clamp(r.rating, 1, 5)} />
                  </div>
                </div>

                <div className="shrink-0 text-[11px] font-semibold text-zinc-400">{r.date}</div>
              </div>

              <div className="mt-2 text-[13px] leading-[18px] text-zinc-600">{r.text}</div>

              {/* ✅ Tags */}
              <div className="mt-3">
                <div className="text-[11px] font-extrabold text-zinc-500">O que mais agradou?</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.highlights.map((t, i) => (
                    <Tag key={`${r.id}-t-${i}`}>{t}</Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 ? (
            <div className="rounded-[12px] border border-black/10 bg-white p-4 text-[13px] text-zinc-600">
              Nenhuma avaliação encontrada para esse filtro.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'h-8 rounded-full px-3 text-[12px] font-extrabold',
        'border border-black/10',
        active ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-700 hover:bg-black/5',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-[11px] font-extrabold text-white">
      {children}
    </span>
  );
}
