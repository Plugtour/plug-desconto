'use client';

import React, { useEffect, useRef, useState } from 'react';

type Item = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

const ITEMS: Item[] = [
  {
    id: 'passeios',
    title: 'Passeios',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 11a3 3 0 100-6 3 3 0 000 6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'ingressos',
    title: 'Ingressos',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 9.5V7a2 2 0 012-2h14a2 2 0 012 2v2.5a1.5 1.5 0 010 3V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-4.5a1.5 1.5 0 010-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'gastronomia',
    title: 'Gastronomia',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M8 2v11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2v11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 13h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'transfers',
    title: 'Transfers',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 13l1.5-4.5A2 2 0 016.3 7h11.4a2 2 0 011.8 1.5L21 13"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M7 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'compras',
    title: 'Compras',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6 2l1.5 4h9L18 2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M3 6h18l-1 12a2 2 0 01-2 2H6a2 2 0 01-2-2L3 6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'atracoes',
    title: 'Atrações',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2l2.09 4.26L19 7.27l-3 2.92.71 4.15L12 13.77 7.29 14.34 8 10.19 5 7.27l4.91-.99L12 2z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'hospedagem',
    title: 'Hospedagem',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 11l9-7 9 7v7a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1v-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
];

export default function CategoryCardsSection({ className = '' }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  const scrollBy = (distance: number) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <section className={`${className} relative`}>
      {/* seta esquerda (desktop) */}
      <button
        aria-label="scroll-left"
        onClick={() => scrollBy(-220)}
        className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow ${
          canScrollLeft ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 6L12 12L20 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6L4 12L12 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className={[
          'no-scrollbar',
          'flex gap-3 px-4',
          'overflow-x-auto',
          'scroll-smooth',
          'touch-manipulation',
        ].join(' ')}
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {ITEMS.map((item) => (
          <button key={item.id} type="button" className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="h-16 w-16 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-800">
              {item.icon}
            </div>

            <span className="text-sm font-semibold text-neutral-800 text-center leading-tight whitespace-nowrap">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* seta direita (desktop) */}
      <button
        aria-label="scroll-right"
        onClick={() => scrollBy(220)}
        className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow ${
          canScrollRight ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6L12 12L4 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6L20 12L12 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </section>
  );
}
