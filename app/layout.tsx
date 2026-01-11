import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppChrome from './_components/header/AppChrome';

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

/**
 * ✅ Opcional (mas resolve “zoom” no mobile)
 * - Se você REALMENTE não quer o usuário ampliando/reduzindo, deixe assim.
 * - Se preferir permitir zoom, remova maximumScale e userScalable.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning className="overflow-x-hidden">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
