import type { Metadata } from 'next';
import './globals.css';
import LayoutChrome from './_components/LayoutChrome';
import ThemeToggle from './_components/ThemeToggle';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  process.env.SITE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Plug Desconto',
    template: '%s | Plug Desconto',
  },
  description: 'Clube de benefícios e descontos.',
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = (stored === 'light' || stored === 'dark') ? stored : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      >
        {/* Layout principal do Admin / App */}
        <LayoutChrome>{children}</LayoutChrome>

        {/* ❌ REMOVIDO: toggle flutuante no canto inferior */}
        {/* O botão de tema fica apenas no topo (LayoutChrome) */}
      </body>
    </html>
  );
}
