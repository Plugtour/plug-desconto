// app/_components/bottom-nav/items.ts
import type { BottomNavItem } from './types';

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'home', label: 'Início', href: '/', icon: 'home' },
  { id: 'busca', label: 'Buscar', href: '/buscar', icon: 'search' },
  { id: 'fav', label: 'Favoritos', href: '/favoritos', icon: 'heart' },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: 'user' },
];
