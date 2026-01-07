// app/_components/voucher-flow/steps/Step06Rating.tsx
'use client';

import React, { useMemo, useState } from 'react';

type HighlightOption =
  | 'Desconto obtido'
  | 'Ambiente'
  | 'Qualidade da comida'
  | 'Variedade do cardápio'
  | 'Drinks'
  | 'Atendimento'
  | 'Tempo de espera'
  | 'Não gostei';

type Props = {
  /** opções exibidas como tags */
  options?: HighlightOption[];

  /** callback ao enviar avaliação */
  onSubmit: (data: {
    rating: number;
    highlights: HighlightOption[];
    comment?: string;
  }) => void;

  /** callback opcional ao fechar (X) */
  onClose?: () => void;

  /** desabilita ações */
  disabled?: boolean;
};

export default function Step06Rating({
  options = [
    'Desconto obtido',
    'Ambiente',
    'Qualidade da comida',
    'Variedade do cardápio',
    'Drinks',
    'Atendimento',
    'Tempo de espera',
    'Não gostei',
  ],
  onSubmit,
  onClose,
  disabled = false,
}: Props) {
  const [rating, setRating] = useState<number>(0);
  const [highlights, setHighlights] = useState<HighlightOption[]>([]);
  const [comment, setComment] = useState<string>('');

  const hasNotLiked = useMemo(
    () => highlights.includes('Não gostei'),
    [highlights],
  );

  const canSubmit = rating > 0 && highlights.length > 0 && !disabled;

  function toggleHighlight(opt: HighlightOption) {
    setHighlights((prev) => {
      const exists = prev.includes(opt);

      // ✅ “Não gostei” é exclusivo
      if (opt === 'Não gostei') {
        if (exists) return prev.filter((o) => o !== opt);
        return ['Não gostei'];
      }

      // ✅ ao escolher algo positivo, remove “Não gostei”
      const withoutNotLiked = prev.filter((o) => o !== 'Não gostei');

      if (exists) {
        return withoutNotLiked.filter((o) => o !== opt);
      }

      return [...withoutNotLiked, opt];
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;

    const cleanComment = comment.trim() || undefined;

    onSubmit({
      rating,
      highlights,
      comment: cleanComment,
    });
  }

  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="text-[13px] leading-5 text-black/70">Avaliação</p>
          <h2 className="mt-1 text-[14px] font-semibold leading-6 text-black">
            Avalie a sua experiência
          </h2>
        </div>

        {/* Stars */}
        <div className="mt-4 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = value <= rating;

            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => setRating(value)}
                className={[
                  'grid h-10 w-10 place-items-center rounded-full text-2xl transition',
                  active ? 'text-amber-400' : 'text-black/20',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35',
                  'disabled:opacity-60 disabled:pointer-events-none',
                ].join(' ')}
                aria-label={`Avaliar com ${value} estrelas`}
              >
                ★
              </button>
            );
          })}
        </div>

        {/* Highlights */}
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-semibold text-black">
            Selecione o que mais agradou
          </p>

          {hasNotLiked && (
            <p className="mb-2 text-[12px] leading-5 text-black/60">
              Você selecionou <span className="font-semibold">Não gostei</span>. Essa opção é exclusiva.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const active = highlights.includes(opt);

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleHighlight(opt)}
                  className={[
                    'rounded-full px-3 py-1.5 text-[12px] font-medium transition',
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/5 text-black/80',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
                    'disabled:opacity-60 disabled:pointer-events-none',
                  ].join(' ')}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="mt-4">
          <p className="mb-1 text-[12px] font-semibold text-black">
            Deixe um comentário (opcional)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={disabled}
            maxLength={300}
            rows={3}
            className={[
              'w-full resize-none rounded-xl border border-black/15 bg-white px-3 py-2 text-[13px] outline-none',
              'focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20',
              'disabled:opacity-60 disabled:pointer-events-none',
            ].join(' ')}
            placeholder="Conte rapidamente como foi sua experiência"
          />
          <div className="mt-1 text-right text-[11px] text-black/40">
            {comment.length}/300
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'h-10 w-full rounded-xl bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition',
              'active:scale-[0.99]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
              'disabled:opacity-50 disabled:pointer-events-none',
            ].join(' ')}
          >
            Avaliar
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className={[
                'mt-2 h-10 w-full rounded-xl border border-black/10 bg-white text-[13px] font-semibold text-black/80 transition',
                'active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
                'disabled:opacity-60 disabled:pointer-events-none',
              ].join(' ')}
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
