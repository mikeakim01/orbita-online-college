import './globals.css';
import type { Metadata, Viewport } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: site.name, template: '%s | ' + site.short },
  description: site.hero.text,
  openGraph: { title: site.name, description: site.hero.text, siteName: site.name, type: 'website' },
};
export const viewport: Viewport = { themeColor: '#070b19', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
