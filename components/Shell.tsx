'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import Logo from './Logo';
import { site } from '@/lib/site';

type Item = { href: string; label: string; icon: string; exact?: boolean };

const STUDENT: Item[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'home' },
  { href: '/applications', label: 'My Applications', icon: 'grid' },
  { href: '/programs', label: 'Programs', icon: 'book' },
  { href: '/exams', label: 'Exams', icon: 'file' },
  { href: '/certificates', label: 'Certificates', icon: 'award', exact: true },
  { href: '/profile', label: 'Profile', icon: 'user' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
  { href: '/help', label: 'Help & Support', icon: 'help' },
];
const ADMIN: Item[] = [
  { href: '/admin', label: 'Overview', icon: 'chart', exact: true },
  { href: '/admin/applications', label: 'Applications', icon: 'grid' },
  { href: '/admin/documents', label: 'Documents', icon: 'folder' },
  { href: '/admin/students', label: 'Students', icon: 'users' },
  { href: '/admin/programs', label: 'Programs', icon: 'book' },
  { href: '/admin/exams', label: 'Exams', icon: 'file' },
  { href: '/admin/certificates', label: 'Certificates', icon: 'award' },
];

export default function Shell({
  name,
  email,
  role,
  notifCount,
  children,
}: {
  name: string;
  email: string;
  role: string;
  notifCount: number;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const on = (i: Item) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + '/'));
  const link = (i: Item) => (
    <Link key={i.href} href={i.href} className="nl" aria-current={on(i) ? 'page' : undefined}>
      <Icon name={i.icon} />
      {i.label}
    </Link>
  );
  const initials = (name || email || '?')
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');
  const first = (name || email).split(/[\s@]/)[0];

  return (
    <div className={'app' + (open ? ' open' : '')}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="side" id="sidebar" aria-label="Sidebar">
        <Link href="/dashboard" className="brand">
          <Logo />
          <span>
            {site.short}
            <small>Online Institute Portal</small>
          </span>
        </Link>
        <nav aria-label="Portal">{STUDENT.map(link)}</nav>
        {role === 'admin' && (
          <nav aria-label="Administration">
            <div className="group">Administration</div>
            {ADMIN.map(link)}
          </nav>
        )}
        <form action="/auth/signout" method="post" style={{ marginTop: 10 }}>
          <button className="nl" type="submit">
            <Icon name="logout" /> Logout
          </button>
        </form>
        <div className="side-card">
          <Icon name="cap" size={34} />
          <b>Keep learning, keep growing</b>
          Your future is bright.
        </div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="main-col">
        <header className="top">
          <button className="iconbtn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Open menu" aria-expanded={open} aria-controls="sidebar">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
          <form className="search" action="/programs" role="search">
            <Icon name="search" className="ico-in" />
            <label htmlFor="gs" className="sr-only">
              Search programs and courses
            </label>
            <input id="gs" name="q" type="search" placeholder="Search programs and courses..." />
          </form>
          <div className="spacer" />
          <Link href="/notifications" className="iconbtn" aria-label={notifCount ? notifCount + ' items need your attention' : 'Notifications'}>
            <Icon name="bell" />
            {notifCount > 0 && <span className="dot">{notifCount > 9 ? '9+' : notifCount}</span>}
          </Link>
          <details className="menu" key={path}>
            <summary aria-label="Account menu">
              <span className="avatar">{initials}</span>
              <span className="who-name">{first}</span>
              <Icon name="chevron" size={16} />
            </summary>
            <div className="menu-pop">
              <div className="who">
                <strong>{name || 'Student'}</strong>
                <div className="muted small">{email}</div>
              </div>
              <Link href="/profile">
                <Icon name="user" size={18} /> Profile
              </Link>
              <Link href="/settings">
                <Icon name="settings" size={18} /> Settings
              </Link>
              <Link href="/help">
                <Icon name="help" size={18} /> Help & Support
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit">
                  <Icon name="logout" size={18} /> Logout
                </button>
              </form>
            </div>
          </details>
        </header>
        <main id="main" className="page">
          {children}
        </main>
      </div>
    </div>
  );
}
