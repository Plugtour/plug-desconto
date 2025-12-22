// app/sitemap.ts
import type { MetadataRoute } from 'next';

// Fonte de dados (mock)
// Ajuste o import abaixo se, no seu projeto, o array estiver em outro caminho.
import { OFFERS } from '@/config/offers';

import { benefitUrl } from '@/lib/urls';

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';

  return raw.replace(/\/+$/, '');
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // 1) Base: páginas estáticas principais
  const items: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/ofertas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 2) Benefícios: SOMENTE URLs oficiais (via helper benefitUrl -> /beneficio/{slug})
  //    - ignora ofertas sem slug
  //    - remove duplicados de slug
  const seen = new Set<string>();

  for (const offer of OFFERS) {
    const slug = (offer?.slug ?? '').trim();
    if (!slug) continue;

    const path = benefitUrl(offer); // garante /beneficio/{slug} (fallback para id, mas aqui slug existe)
    if (!path.startsWith('/beneficio/')) continue;

    // Dedupe: por path final
    if (seen.has(path)) continue;
    seen.add(path);

    items.push({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  return items;
}
