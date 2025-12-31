// app/_components/bottom-nav/items.ts
import type { BottomNavItem } from './types';

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'principal', label: 'Principal', href: '/', icon: 'home' },
  { id: 'onde-ir', label: 'Onde ir', href: '/onde-ir', icon: 'pin' },
  { id: 'utilizado', label: 'Utilizado', href: '/utilizado', icon: 'ticket' },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: 'user' },
  { id: 'comprar', label: 'Comprar', href: '/comprar', icon: 'cart' },
];
