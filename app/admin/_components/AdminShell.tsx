'use client';

// app/admin/_components/AdminShell.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Tag, Users, LogOut } from 'lucide-react';

import ThemeToggle from '../../_components/ThemeToggle';
import { useAdminData } from './AdminDataProvider';

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session } = useAdminData();

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // mesmo se falhar, tenta seguir
    } finally {
      router.push('/entrar');
      router.refresh();
    }
  };

  const userLabel = session?.userName?.trim() ? session.userName.trim() : 'Master';

  return (
    <div
      className={[
        'relative left-1/2 min-h-screen w-screen -translate-x-1/2',
        // Light
        'bg-zinc-100 text-zinc-900',
        // Dark
        'dark:bg-zinc-900 dark:text-zinc-100',
      ].join(' ')}
    >
      <div className="flex min-h-screen w-full gap-0">
        {/* SIDEBAR */}
        <aside
          className={[
            'hidden w-80 shrink-0 flex-col border-r md:flex -mt-px',
            // Light
            'border-zinc-200 bg-white',
            // Dark
            'dark:border-zinc-800 dark:bg-zinc-950',
          ].join(' ')}
        >
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="text-sm font-semibold tracking-tight">Plug Desconto</div>
            <div className="text-xs text-zinc-500">Admin</div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
              <div className="font-medium">Logado como</div>
              <div className="mt-0.5">{userLabel}</div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4 text-sm">
            <NavItem href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </NavItem>

            <NavItem href="/admin/ofertas" icon={<Tag className="h-4 w-4" />}>
              Ofertas
            </NavItem>

            <NavItem href="/admin/parceiros" icon={<Users className="h-4 w-4" />}>
              Parceiros
            </NavItem>

            <NavItem href="/admin/afiliados" icon={<Users className="h-4 w-4" />}>
              Afiliados
            </NavItem>
          </nav>

          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={onLogout}
              className={[
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition',
                // Light
                'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                // Dark
                'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
              ].join(' ')}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOPO */}
          <header
            className={[
              'sticky top-0 z-10 backdrop-blur',
              'px-6 py-4',
              'bg-white/80',
              'shadow-[inset_0_-0.5px_0_0_rgb(228,228,231)]',
              'dark:bg-zinc-950/80',
              'dark:shadow-[inset_0_-0.5px_0_0_rgb(39,39,42)]',
            ].join(' ')}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <div className="text-sm font-medium">Painel Administrativo</div>
              <ThemeToggle />
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 px-6 py-6">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 transition',
        // Light
        'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        // Dark
        'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
      ].join(' ')}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
