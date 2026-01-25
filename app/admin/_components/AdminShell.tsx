'use client';

// app/admin/_components/AdminShell.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Tag, Users, LogOut } from 'lucide-react';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="text-sm font-semibold tracking-tight">
              Plug Desconto
            </div>
            <div className="text-xs text-zinc-500">Admin</div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
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

          <div className="border-t border-zinc-800 px-3 py-3">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex flex-1 flex-col">
          {/* TOPO */}
          <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
              <div className="text-sm font-medium">Painel Administrativo</div>
            </div>
          </header>

          {/* MAIN */}
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            {children}
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
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
