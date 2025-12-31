// app/_components/bottom-nav/types.ts
export type BottomNavItem = {
  id: string;
  label: string;
  href: string;
  icon: 'home' | 'search' | 'heart' | 'user';
};
