import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';
import { courses } from '@/lib/catalog';

export const metadata = {
  title: 'Faculties',
  description: 'The three faculties of ' + site.name + ': ' + site.programs.map((p) => p.name).join(', ') + '.',
  alternates: { canonical: '/faculties' },
  openGraph: { title: 'Faculties at ' + site.name, url: '/faculties', type: 'website' as const },
};

export default function Faculties() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Faculties' }]} kicker="Academic faculties" title="Our faculties" lead={site.programsIntro} />
      <section className="band">
        <div className="container" style={{ display: 'grid', gap: 64 }}>
          {site.programs.map((p, i) => {
            const n = courses().filter((c) => c.faculty === p.slug).length;
            return (
              <Reveal key={p.slug}>
                <div className="split" style={i % 2 ? { direction: 'rtl' } : undefined}>
                  <figure className="frame" style={{ margin: 0, direction: 'ltr' }}>
                    <Scene kind={sceneFor(p.name, p.slug)} label={p.name} />
                  </figure>
                  <div style={{ direction: 'ltr' }}>
                    <p className="kicker" style={{ color: 'var(--t-blue)' }}>Faculty</p>
                    <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>{p.name}</h2>
                    <p className="lead">{p.blurb}</p>
                    <p className="muted">Graduates work as {p.careers}</p>
                    <p className="muted small">Available at {site.applyLevels.join(', ')} level{n ? ' and through ' + n + ' short courses' : ''}.</p>
                    <p style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <Link className="btn" href={'/faculties/' + p.slug}>Explore faculty</Link>
                      <Link className="btn ghost" href={'/apply?program=' + p.slug}>Apply <Icon name="arrow" size={16} /></Link>
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
