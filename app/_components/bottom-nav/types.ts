// app/_components/bottom-nav/types.ts

/**
 * Ícones disponíveis no BottomNav
 * Deve sempre refletir exatamente os ícones
 * implementados em icons.tsx
 */
export type BottomNavIcon =
  | 'home'
  | 'search'
  | 'heart'
  | 'user'
  | 'pin'
  | 'ticket'
  | 'cart';

/**
 * Item do menu inferior
 */
export type BottomNavItem = {
  id: string;
  label: string;
  href: string;
  icon: BottomNavIcon;
};
