import type { MetadataRoute } from 'next';
import { SITE_URL, levelSlug } from '@/lib/catalog';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ['', '/about', '/faculties', '/programs', '/admissions', '/contact', '/legal'];
  return [
    ...fixed.map((p) => ({ url: SITE_URL + p, lastModified: now, priority: p === '' ? 1 : 0.8 })),
    ...site.programs.map((f) => ({ url: SITE_URL + '/faculties/' + f.slug, lastModified: now, priority: 0.7 })),
    ...site.programs.flatMap((f) => site.levels.map((l) => ({ url: SITE_URL + '/programs/' + f.slug + '/' + levelSlug(l.name), lastModified: now, priority: 0.6 }))),
  ];
}
