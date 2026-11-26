import Link from 'next/link';
import type { ReactNode } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import EarthBanner from './EarthBanner';
import { site } from '@/lib/site';

const POINTS = [
  ['shield', 'Proctored, server-graded exams'],
  ['award', 'Certificates you can verify online'],
  ['book', 'Bachelor, Master and PhD programs'],
];

export default function AuthShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Link href="/" className="brand">
          <Logo />
          <span>
            {site.short}
            <small>Engineering Institute</small>
          </span>
        </Link>
        <div>
          <h2>Learn from anywhere. Earn credentials that can be verified.</h2>
          <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: '20px 0 0' }}>
            {POINTS.map(([i, t]) => (
              <li key={t} className="row">
                <span className="ico cyan" style={{ width: 38, height: 38 }}>
                  <Icon name={i} size={18} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <EarthBanner className="hide-sm" />
      </aside>
      <main id="main" className="auth-main">
        <div className="auth-tools"><ThemeToggle /></div>
        <div className="auth-box">
          <a className="skip" href="#main">
            Skip to content
          </a>
          <h1>{title}</h1>
          {intro && <p className="muted">{intro}</p>}
          <div className="card">{children}</div>
        </div>
      </main>
    </div>
  );
}
