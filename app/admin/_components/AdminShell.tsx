'use client';

// app/admin/_components/AdminShell.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Tag,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  ChevronDown,
  FileText,
} from 'lucide-react';

import ThemeToggle from '../../_components/ThemeToggle';
import { useAdminData } from './AdminDataProvider';

const LS_KEY = 'pd_admin_sidebar_collapsed';

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAdminData();

  // desktop: recolhido/expandido
  const [collapsed, setCollapsed] = useState(false);

  // mobile: drawer aberto/fechado
  const [mobileOpen, setMobileOpen] = useState(false);

  // menu usuário (header)
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw === '1') setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!userMenuOpen) return;
      const el = userMenuRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setUserMenuOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [userMenuOpen]);

  // fecha dropdown no ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!userMenuOpen) return;
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [userMenuOpen]);

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // mesmo se falhar, tenta seguir
    } finally {
      setUserMenuOpen(false);
      router.push('/entrar');
      router.refresh();
    }
  };

  const userLabel = useMemo(() => {
    const name = session?.userName?.trim();
    return name ? name : 'Master';
  }, [session?.userName]);

  const sidebarW = collapsed ? 'md:w-20' : 'md:w-80';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

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
        {/* ===== DESKTOP SIDEBAR (colapsável) ===== */}
        <div className="relative hidden md:flex min-h-screen">
          {/* Linha alinhada com o fim do header (micro-ajuste fino) */}
          <div
            className={[
              'pointer-events-none absolute left-0 right-0 top-[63.25px] h-px',
              'bg-zinc-200 dark:bg-zinc-800',
            ].join(' ')}
          />

          <aside
            className={[
              'md:flex',
              'shrink-0 flex-col border-r',
              'transition-[width] duration-400 ease-in-out',
              sidebarW,
              // Light
              'border-zinc-200 bg-white',
              // Dark
              'dark:border-zinc-800 dark:bg-zinc-950',
            ].join(' ')}
          >
            {/* removido border-b daqui para a linha não ficar duplicada */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* TÍTULO: anima o texto para evitar “pulo” ao abrir */}
                  <div className="text-sm font-semibold tracking-tight">
                    <span
                      className={[
                        'inline-block overflow-hidden whitespace-nowrap align-bottom',
                        'transition-[max-width,opacity,transform] duration-300 ease-in-out',
                        collapsed ? 'max-w-[40px] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-1',
                      ].join(' ')}
                    >
                      PD
                    </span>

                    <span
                      className={[
                        'inline-block overflow-hidden whitespace-nowrap align-bottom',
                        'transition-[max-width,opacity,transform] duration-300 ease-in-out',
                        collapsed
                          ? 'max-w-0 opacity-0 translate-x-1'
                          : 'max-w-[220px] opacity-100 translate-x-0 delay-150',
                      ].join(' ')}
                    >
                      Plug Desconto
                    </span>
                  </div>

                  {/* "Admin": mantém espaço e anima entrada para não “pular” */}
                  <div className="text-xs text-zinc-500">
                    <span
                      className={[
                        'inline-block overflow-hidden whitespace-nowrap',
                        'transition-[max-width,opacity,transform] duration-300 ease-in-out',
                        collapsed
                          ? 'max-w-0 opacity-0 translate-x-1'
                          : 'max-w-[120px] opacity-100 translate-x-0 delay-150',
                      ].join(' ')}
                    >
                      Admin
                    </span>
                    {collapsed && <span className="sr-only">Admin</span>}
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
              <NavItem
                href="/admin"
                icon={<LayoutDashboard className="h-4 w-4" />}
                collapsed={collapsed}
                active={isActive('/admin')}
              >
                Dashboard
              </NavItem>

              <NavItem
                href="/admin/ofertas"
                icon={<Tag className="h-4 w-4" />}
                collapsed={collapsed}
                active={isActive('/admin/ofertas')}
              >
                Ofertas
              </NavItem>

              <NavItem
                href="/admin/parceiros"
                icon={<Users className="h-4 w-4" />}
                collapsed={collapsed}
                active={isActive('/admin/parceiros')}
              >
                Parceiros
              </NavItem>

              <NavItem
                href="/admin/afiliados"
                icon={<Users className="h-4 w-4" />}
                collapsed={collapsed}
                active={isActive('/admin/afiliados')}
              >
                Afiliados
              </NavItem>

              {/* ✅ NOVO: LOGS */}
              <NavItem
                href="/admin/logs"
                icon={<FileText className="h-4 w-4" />}
                collapsed={collapsed}
                active={isActive('/admin/logs')}
              >
                Logs
              </NavItem>
            </nav>

            <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
              <button
                type="button"
                onClick={onLogout}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition',
                  collapsed ? 'justify-center' : '',
                  // Light
                  'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  // Dark
                  'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                ].join(' ')}
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sair</span>}
              </button>
            </div>
          </aside>

          {/* ===== BOTÃO EXTERNO (FORA DO MENU) ===== */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={[
              'absolute top-3.5 -right-3 z-20',
              'inline-flex h-9 w-9 items-center justify-center rounded-lg',
              'border bg-white shadow-md',
              'transition-all duration-300 ease-in-out',
              'hover:scale-105',
              // Light
              'border-zinc-200 text-zinc-600 hover:bg-zinc-50',
              // Dark
              'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900',
            ].join(' ')}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ===== MOBILE DRAWER ===== */}
        <div
          className={[
            'md:hidden',
            mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
            'fixed inset-0 z-50',
          ].join(' ')}
          aria-hidden={!mobileOpen}
        >
          {/* overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className={[
              'absolute inset-0 transition-opacity duration-200',
              mobileOpen ? 'opacity-100 bg-black/30' : 'opacity-0 bg-transparent',
            ].join(' ')}
          />

          {/* panel */}
          <aside
            className={[
              'absolute left-0 top-0 h-full w-80 max-w-[85vw]',
              'border-r',
              'transition-transform duration-400 ease-in-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
              // Light
              'border-zinc-200 bg-white',
              // Dark
              'dark:border-zinc-800 dark:bg-zinc-950',
            ].join(' ')}
          >
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold tracking-tight">Plug Desconto</div>
                  <div className="text-xs text-zinc-500">Admin</div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg transition',
                    // Light
                    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                    // Dark
                    'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                  ].join(' ')}
                  aria-label="Fechar menu"
                  title="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                <div className="font-medium">Logado como</div>
                <div className="mt-0.5">{userLabel}</div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-4 py-4 text-sm">
              <NavItemMobile href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} active={isActive('/admin')}>
                Dashboard
              </NavItemMobile>

              <NavItemMobile
                href="/admin/ofertas"
                icon={<Tag className="h-4 w-4" />}
                active={isActive('/admin/ofertas')}
              >
                Ofertas
              </NavItemMobile>

              <NavItemMobile
                href="/admin/parceiros"
                icon={<Users className="h-4 w-4" />}
                active={isActive('/admin/parceiros')}
              >
                Parceiros
              </NavItemMobile>

              <NavItemMobile
                href="/admin/afiliados"
                icon={<Users className="h-4 w-4" />}
                active={isActive('/admin/afiliados')}
              >
                Afiliados
              </NavItemMobile>

              {/* ✅ NOVO: LOGS */}
              <NavItemMobile href="/admin/logs" icon={<FileText className="h-4 w-4" />} active={isActive('/admin/logs')}>
                Logs
              </NavItemMobile>
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
        </div>

        {/* ===== CONTEÚDO ===== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOPO */}
          <header
            className={[
              'sticky top-0 z-10 backdrop-blur',
              'h-16',
              'px-6',
              'bg-white/80',
              'shadow-[inset_0_-0.5px_0_0_rgb(228,228,231)]',
              'dark:bg-zinc-950/80',
              'dark:shadow-[inset_0_-0.5px_0_0_rgb(39,39,42)]',
            ].join(' ')}
          >
            <div className="flex h-full w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* mobile menu button */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className={[
                    'md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg transition',
                    // Light
                    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                    // Dark
                    'dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                  ].join(' ')}
                  aria-label="Abrir menu"
                  title="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="text-sm font-medium">Painel Administrativo</div>
              </div>

              {/* ===== USER DROPDOWN ===== */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={[
                    'inline-flex items-center gap-2 rounded-lg p-1 transition',
                    // Light
                    'text-zinc-700 hover:bg-zinc-100',
                    // Dark
                    'dark:text-zinc-200 dark:hover:bg-zinc-900',
                  ].join(' ')}
                  aria-label="Abrir menu do usuário"
                  title="Conta"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <User className="h-4 w-4" />
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className={[
                      'absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border shadow-lg',
                      // Light
                      'border-zinc-200 bg-white',
                      // Dark
                      'dark:border-zinc-800 dark:bg-zinc-950',
                    ].join(' ')}
                  >
                    <div className="px-4 py-3">
                      <div className="text-xs text-zinc-500">Logado como</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userLabel}</div>
                    </div>

                    <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                        <span>Tema</span>
                        <ThemeToggle />
                      </div>
                    </div>

                    <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="px-3 py-2">
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
                  </div>
                )}
              </div>
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
  collapsed,
  active,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={typeof children === 'string' ? children : undefined}
      className={[
        'flex items-center rounded-lg px-3 py-2 transition',
        collapsed ? 'justify-center' : 'gap-3',

        // ACTIVE: mesmo estilo do hover, porém fixo
        active
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {icon}

      {/* quando colapsado, mantém acessível */}
      {collapsed && <span className="sr-only">{children}</span>}

      {/* texto animado (delay) para não “pular” ao abrir */}
      <span
        className={[
          'overflow-hidden whitespace-nowrap',
          'transition-[max-width,opacity,transform] duration-300 ease-in-out',
          collapsed ? 'max-w-0 opacity-0 translate-x-1' : 'max-w-[220px] opacity-100 translate-x-0 delay-150',
        ].join(' ')}
        aria-hidden={collapsed}
      >
        {children}
      </span>
    </Link>
  );
}

function NavItemMobile({
  href,
  icon,
  children,
  active,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 transition',

        // ACTIVE: mesmo estilo do hover, porém fixo
        active
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
