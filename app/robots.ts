// app/robots.ts
import type { MetadataRoute } from 'next';

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';

  return raw.replace(/\/+$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ofertas', '/beneficio/'],

        // Bloqueios típicos (ajuste se você quiser indexar algo daqui no futuro)
        disallow: [
          '/api/',
          '/master/',
          '/parceiro/',
          '/afiliado/',
          '/acesso-negado/',
          '/entrar/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
