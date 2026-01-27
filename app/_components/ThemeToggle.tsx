'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const isDark = theme === 'dark';

  const toggle = () => {
    const next: Theme = isDark ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm transition',
        'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50',
        'dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-900',
        className,
      ].join(' ')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo escuro' : 'Modo claro'}
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      <span>{isDark ? 'Escuro' : 'Claro'}</span>
    </button>
  );
}
