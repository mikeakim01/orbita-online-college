import Link from 'next/link';
import type { ReactNode } from 'react';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs2" aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => (
          <li key={c.label} aria-current={i === items.length - 1 ? 'page' : undefined}>
            {c.href && i < items.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Navy band at the top of every inner public page. */
export default function PageHeader({ crumbs, kicker, title, lead, children }: { crumbs: Crumb[]; kicker?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="pg on-dark">
      <div className="container">
        <Breadcrumbs items={crumbs} />
        {kicker && <p className="kicker gold">{kicker}</p>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ kicker, title, lead, center, action }: { kicker?: string; title: string; lead?: string; center?: boolean; action?: ReactNode }) {
  return (
    <div className={'sh' + (center ? ' center' : '')}>
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq2">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
