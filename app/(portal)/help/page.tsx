import Link from 'next/link';
import Icon from '@/components/Icon';
import { site } from '@/lib/site';

export const metadata = { title: 'Help and support' };

const TOPICS = [
  ['upload', 'Documents', 'Upload, replace and check your documents.', '/applications'],
  ['file', 'Exams', 'Open exams, attempts and results.', '/exams'],
  ['award', 'Certificates', 'View, download and share your certificates.', '/certificates'],
  ['book', 'Programs and fees', 'Levels, courses and the fee calculator.', '/programs'],
];

export default function Help() {
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Help and support</span></p>
          <h1>Help and support</h1>
          <p className="muted" style={{ margin: 0 }}>Find an answer, or write to admissions.</p>
        </div>
      </div>

      <section className="grid" aria-label="Topics">
        {TOPICS.map(([i, t, d, h]) => (
          <Link key={t} href={h} className="card feature" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="ico"><Icon name={i} /></span>
            <h3>{t}</h3>
            <p className="muted" style={{ margin: 0 }}>{d}</p>
          </Link>
        ))}
      </section>

      <div className="g21">
        <section className="card" aria-labelledby="h-faq">
          <h2 id="h-faq" style={{ fontSize: 20 }}>Frequently asked questions</h2>
          {site.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <aside className="card" aria-labelledby="h-con">
          <h2 id="h-con" style={{ fontSize: 20 }}>Contact admissions</h2>
          <div className="list">
            <div><span className="nt"><Icon name="mail" size={18} /></span><div className="grow"><strong>Email</strong><div><a href={'mailto:' + site.email}>{site.email}</a></div></div></div>
            <div><span className="nt"><Icon name="phone" size={18} /></span><div className="grow"><strong>Phone</strong><div className="muted">{site.phone}</div></div></div>
            <div><span className="nt"><Icon name="home" size={18} /></span><div className="grow"><strong>Office</strong><div className="muted">{site.city}</div></div></div>
          </div>
          <p className="muted small" style={{ margin: '14px 0 0' }}>When you write, include your full name and the email you registered with.</p>
          <p style={{ margin: '14px 0 0' }}><a className="btn" href={'mailto:' + site.email + '?subject=Support request'}><Icon name="mail" size={18} /> Write to us</a></p>
        </aside>
      </div>
    </>
  );
}
