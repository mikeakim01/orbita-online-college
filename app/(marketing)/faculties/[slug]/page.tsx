import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { categoryOf, courseSlug, courses, facultyBySlug, feeLabel, levelSlug } from '@/lib/catalog';
import PageHeader, { SectionHeading } from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = facultyBySlug(params.slug);
  if (!f) return { title: 'Faculty not found' };
  return { title: f.name, description: f.blurb + ' Programs from certificate to PhD at ' + site.name + '.', alternates: { canonical: '/faculties/' + f.slug }, openGraph: { title: f.name + ' | ' + site.name, description: f.blurb, url: '/faculties/' + f.slug, type: 'website' } };
}

export default function Faculty({ params }: { params: { slug: string } }) {
  const f = facultyBySlug(params.slug);
  if (!f) notFound();
  const related = courses().filter((c) => c.faculty === f.slug);
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Faculties', href: '/faculties' }, { label: f.name }]} kicker="Faculty" title={f.name} lead={f.blurb}>
        <p style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn gold-solid lg" href={'/apply?program=' + f.slug}>Apply to this faculty</Link>
          <Link className="btn on-navy lg" href="#programs">See programs</Link>
        </p>
      </PageHeader>

      <section className="band">
        <div className="container split">
          <Reveal className="prose2">
            <h2>What you will study</h2>
            <p>Degree programs in this faculty build on a common core. At Bachelor level the core modules are:</p>
            <ul className="checks">{f.modules.map((m) => <li key={m}>{m}</li>)}</ul>
            <h2>Where it leads</h2>
            <p>Graduates work as {f.careers}</p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}><Scene kind={sceneFor(f.name, f.slug)} label={f.name} /></figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="programs">
        <div className="container">
          <Reveal><SectionHeading kicker="Academic programs" title={'Qualifications in ' + f.name} /></Reveal>
          <div className="cards">
            {site.levels.map((l, i) => (
              <Reveal key={l.name} delay={i * 60}>
                <Link href={'/programs/' + f.slug + '/' + levelSlug(l.name)} className="pc" style={{ height: '100%' }}>
                  <div className="tags"><span className="badge violet">{l.name}</span></div>
                  <h3>{l.name} in {f.name}</h3>
                  <dl>
                    <div><dt>Duration</dt><dd>{l.duration}</dd></div>
                    <div><dt>Entry</dt><dd>{l.entry}</dd></div>
                    <div><dt>Tuition</dt><dd>{feeLabel(l.name, f.name)}</dd></div>
                  </dl>
                  <span className="go">Program details <Icon name="arrow" size={16} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="band">
          <div className="container">
            <Reveal><SectionHeading kicker="Short courses" title={'Related short courses'} lead="Start small. Each course has its own exam and certificate." action={<Link className="more" href="/courses">All courses <Icon name="arrow" size={16} /></Link>} /></Reveal>
            <div className="cards four">
              {related.map((c) => (
                <Link key={c.name} href={'/courses/' + courseSlug(c)} className="cc">
                  <div className="img"><Scene kind={sceneFor(c.name, c.faculty)} /></div>
                  <div className="txt"><span className="cat">{categoryOf(c)} &middot; {c.tier}</span><h3>{c.name}</h3><p>{c.blurb}</p><div className="meta"><span>{c.weeks} weeks</span><span>${c.fee.toLocaleString('en-US')}</span></div></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
