// app/_components/bottom-nav/items.ts
import type { BottomNavItem } from './types';

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'principal', label: 'Principal', href: '/', icon: 'home' },
  { id: 'onde-ir', label: 'Onde ir', href: '/onde-ir', icon: 'pin' },

  // ✅ agora padronizado para plural
  { id: 'utilizados', label: 'Utilizados', href: '/utilizados', icon: 'ticket' },

  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: 'user' },
  { id: 'comprar', label: 'Comprar', href: '/comprar', icon: 'cart' },
];
