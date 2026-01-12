'use client';

import React from 'react';

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 17.3l-5.2 3 1.4-5.9-4.6-4 6.1-.5L12 4.3l2.3 5.6 6.1.5-4.6 4 1.4 5.9-5.2-3z"
        className={filled ? 'fill-yellow-400' : 'fill-zinc-300'}
      />
    </svg>
  );
}

export function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center -space-x-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < v} />
      ))}
    </div>
  );
}
