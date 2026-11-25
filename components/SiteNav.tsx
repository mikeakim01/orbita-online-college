'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';

type Item = { label: string; href: string; note?: string };
type Menu = { label: string; href: string; items: Item[] };

const FACULTIES: Menu = {
  label: 'Faculties',
  href: '/faculties',
  items: [...site.programs.map((p) => ({ label: p.name, href: '/faculties/' + p.slug, note: p.blurb })), { label: 'All faculties', href: '/faculties' }],
};
const PROGRAMS: Menu = {
  label: 'Academic Programs',
  href: '/programs',
  items: [...site.applyLevels.map((l) => ({ label: l, href: '/programs?level=' + l.toLowerCase(), note: site.levels.find((x) => x.name === l)?.duration })), { label: 'All programs', href: '/programs' }],
};
const ADMISSIONS: Menu = {
  label: 'Admissions',
  href: '/admissions',
  items: [
    { label: 'Requirements and process', href: '/admissions#process' },
    { label: 'Tuition and fees', href: '/admissions#fees' },
    { label: 'Frequently asked questions', href: '/admissions#faq' },
    { label: 'Start your application', href: '/apply' },
  ],
};
const LINKS: (Menu | Item)[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  FACULTIES,
  PROGRAMS,
  { label: 'Short Courses', href: '/courses' },
  ADMISSIONS,
  { label: 'Contact', href: '/contact' },
];
const isMenu = (x: Menu | Item): x is Menu => 'items' in x;

export default function SiteNav({ signedIn }: { signedIn: boolean }) {
  const path = usePathname() ?? '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const overHero = path === '/' && !scrolled;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [path]);
  useEffect(() => {
    const away = (e: MouseEvent) => bar.current && !bar.current.contains(e.target as Node) && setOpen(null);
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setDrawer(false);
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const active = (href: string) => (href === '/' ? path === '/' : path === href.split(/[?#]/)[0] || path.startsWith(href.split(/[?#]/)[0] + '/'));

  return (
    <header ref={bar} className={'sn' + (overHero ? ' over' : '') + (drawer ? ' drawer-open' : '')}>
      <div className="sn-in">
        <Link href="/" className="sn-brand" aria-label={site.name + ' home'}>
          <Logo />
          <span>
            <strong>{site.short}</strong>
            <small>Online Institute</small>
          </span>
        </Link>

        <nav className="sn-links" aria-label="Main">
          {LINKS.map((l) =>
            isMenu(l) ? (
              <div key={l.label} className={'sn-dd' + (open === l.label ? ' open' : '')} onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setOpen(l.label)} onMouseLeave={() => setOpen(null)}>
                <button type="button" className={active(l.href) ? 'on' : ''} aria-expanded={open === l.label} aria-haspopup="true" onClick={() => setOpen(open === l.label ? null : l.label)}>
                  {l.label}
                  <Icon name="chevron" size={14} />
                </button>
                <div className="sn-panel" role="menu">
                  {l.items.map((i) => (
                    <Link key={i.href} href={i.href} role="menuitem" onClick={() => setOpen(null)}>
                      <span>{i.label}</span>
                      {i.note && <small>{i.note}</small>}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className={active(l.href) ? 'on' : ''} aria-current={active(l.href) ? 'page' : undefined}>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="sn-actions">
          <ThemeToggle className="iconbtn sn-theme" />
          <Link className="sn-portal" href={signedIn ? '/dashboard' : '/login'}>
            Student Portal
          </Link>
          <Link className="btn gold-solid sm" href="/apply">
            Apply Now
          </Link>
          <button type="button" className="sn-burger" aria-label={drawer ? 'Close menu' : 'Open menu'} aria-expanded={drawer} aria-controls="sn-drawer" onClick={() => setDrawer(!drawer)}>
            <Icon name={drawer ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="sn-drawer" className="sn-drawer" hidden={!drawer}>
        <nav aria-label="Mobile">
          {LINKS.map((l) =>
            isMenu(l) ? (
              <details key={l.label}>
                <summary>{l.label}</summary>
                {l.items.map((i) => (
                  <Link key={i.href} href={i.href}>
                    {i.label}
                  </Link>
                ))}
              </details>
            ) : (
              <Link key={l.href} href={l.href} className={active(l.href) ? 'on' : ''}>
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="sn-drawer-cta">
          <Link className="btn ghost" href={signedIn ? '/dashboard' : '/login'}>
            Student Portal
          </Link>
          <Link className="btn gold-solid" href="/apply">
            Apply Now
          </Link>
        </div>
      </div>
    </header>
  );
}
