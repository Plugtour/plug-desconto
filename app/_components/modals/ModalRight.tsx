'use client';

import React, { useEffect, useId, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;

  /** largura do drawer (igual ao padrão do seu modal atual) */
  widthClassName?: string; // ex: 'w-[92vw] max-w-[420px]'

  /** se quiser manter o mesmo “top/bottom padding” do modal base */
  panelClassName?: string; // classes extras no painel
};

export default function ModalRight({
  open,
  onClose,
  children,
  className,
  widthClassName = 'w-[92vw] max-w-[420px]',
  panelClassName,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // ESC para fechar
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock do scroll do body
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open]);

  // Foco inicial no painel
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // Mantém no DOM para animar (usando pointer-events + opacity)
  return (
    <div
      className={[
        'fixed inset-0 z-[160]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
        className ?? '',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={[
          'absolute inset-0',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
          'bg-black/45',
        ].join(' ')}
      />

      {/* Painel (direita -> esquerda) */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'absolute right-0 top-0 h-full',
          widthClassName,
          'outline-none',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Conteúdo do painel (estilo do seu modal base: glass / card) */}
        <div
          className={[
            'h-full',
            'bg-zinc-100/95 backdrop-blur-md',
            'border-l border-black/10',
            'shadow-2xl',
            'flex flex-col',
            panelClassName ?? '',
          ].join(' ')}
        >
          {/* “Título invisível” p/ acessibilidade (se quiser, pode substituir por header real dentro do children) */}
          <h2 id={titleId} className="sr-only">
            Painel lateral
          </h2>

          {children}
        </div>
      </div>
    </div>
  );
}
