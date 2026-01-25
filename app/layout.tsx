import type { Metadata } from 'next';
import './globals.css';
import LayoutChrome from './_components/LayoutChrome';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LayoutChrome>{children}</LayoutChrome>
      </body>
    </html>
  );
}
