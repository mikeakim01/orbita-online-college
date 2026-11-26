import './globals.css';
import type { Metadata, Viewport } from 'next';
import { site } from '@/lib/site';
import { getLang } from '@/lib/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: site.name, template: '%s | ' + site.short },
  description: site.hero.text,
  openGraph: { title: site.name, description: site.hero.text, siteName: site.name, type: 'website' },
};
export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f5f7fa' }, { media: '(prefers-color-scheme: dark)', color: '#071426' }], colorScheme: 'light dark' };

// Runs before first paint so there is no flash. Light unless the visitor chose dark.
const THEME_SCRIPT = "try{var t=localStorage.getItem('icon-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLang()} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
