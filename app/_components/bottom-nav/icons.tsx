// app/_components/bottom-nav/icons.tsx
'use client';

import React from 'react';

export function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 20v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 21.8v-6.2c0-.9.7-1.6 1.6-1.6h2.4c.9 0 1.6.7 1.6 1.6v6.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.2-3.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 21s-7.6-4.9-7.6-11.1C4.4 7 6.4 5 8.9 5c1.6 0 2.9.8 3.6 2c.7-1.2 2-2 3.6-2 2.5 0 4.5 2 4.5 4.9C20.6 16.1 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4.8 21c1.7-3 4.1-4.6 7.2-4.6S17.5 18 19.2 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconForKey({
  icon,
  className,
}: {
  icon: 'home' | 'search' | 'heart' | 'user';
  className?: string;
}) {
  switch (icon) {
    case 'home':
      return <IconHome className={className} />;
    case 'search':
      return <IconSearch className={className} />;
    case 'heart':
      return <IconHeart className={className} />;
    case 'user':
      return <IconUser className={className} />;
    default:
      return <IconHome className={className} />;
  }
}
