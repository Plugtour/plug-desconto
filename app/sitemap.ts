// app/sitemap.ts
import type { MetadataRoute } from 'next';

import { OFFERS } from '@/config/offers';
import { benefitPath } from '@/lib/urls';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  process.env.SITE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const items: MetadataRoute.Sitemap = [];

  // Home
  items.push({
    url: `${siteUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  // Páginas principais (se existirem no seu app, pode manter)
  items.push({
    url: `${siteUrl}/ofertas`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  });

  for (const offer of OFFERS as any[]) {
    const path = benefitPath(offer); // /beneficio/{slug ou id}

    // garante que só entram URLs de benefício
    if (!path.startsWith('/beneficio/')) continue;

    const fullUrl = `${siteUrl}${path}`;

    // remove duplicados
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    items.push({
      url: fullUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return items;
}
