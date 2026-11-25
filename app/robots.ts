import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/catalog';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/applications', '/documents', '/exams', '/profile', '/settings', '/notifications', '/apply', '/login', '/register', '/reset-password', '/forgot-password'] }],
    sitemap: SITE_URL + '/sitemap.xml',
  };
}
