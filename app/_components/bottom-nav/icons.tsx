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

/** 📍 Onde ir */
export function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** 🎟️ Utilizado */
export function IconTicket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 8.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2.2a2.2 2.2 0 0 0 0 4.6V17.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.2a2.2 2.2 0 0 0 0-4.6V8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5l1.4 1.4L14.8 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 🛒 Comprar */
export function IconCart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 7h14l-1.6 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.7 4.8A1.5 1.5 0 0 0 4.2 3.6H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="20" r="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconForKey({
  icon,
  className,
}: {
  icon: 'home' | 'search' | 'heart' | 'user' | 'pin' | 'ticket' | 'cart';
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
    case 'pin':
      return <IconPin className={className} />;
    case 'ticket':
      return <IconTicket className={className} />;
    case 'cart':
      return <IconCart className={className} />;
    default:
      return <IconHome className={className} />;
  }
}
