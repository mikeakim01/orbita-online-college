import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { categoryOf, courseSlug, courses, facultyBySlug, feeLabel, levelBySlug, levelSlug } from '@/lib/catalog';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import Scene, { sceneFor } from '@/components/Art';
import Icon from '@/components/Icon';

type P = { params: { faculty: string; level: string } };

export function generateMetadata({ params }: P): Metadata {
  const f = facultyBySlug(params.faculty);
  const l = levelBySlug(params.level);
  if (!f || !l) return { title: 'Program not found' };
  const title = l.name + ' in ' + f.name;
  return { title, description: title + ' at ' + site.name + '. Duration ' + l.duration + '. ' + f.blurb, alternates: { canonical: '/programs/' + f.slug + '/' + levelSlug(l.name) }, openGraph: { title: title + ' | ' + site.name, description: f.blurb, type: 'website' } };
}

export default function Programme({ params }: P) {
  const f = facultyBySlug(params.faculty);
  const l = levelBySlug(params.level);
  if (!f || !l) notFound();
  const docs = site.docRules?.[l.name] ?? [];
  const isShort = l.name === 'Certificate';
  const related = courses().filter((c) => c.faculty === f.slug);
  const apply = '/apply?program=' + f.slug + '&level=' + encodeURIComponent(l.name);
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Academic Programs', href: '/programs' }, { label: l.name + ' in ' + f.name }]} kicker={f.name} title={l.name + ' in ' + f.name} lead={f.blurb}>
        <p style={{ marginTop: 26 }}><Link className="btn gold-solid lg" href={apply}>Apply for this program</Link></p>
      </PageHeader>

      <section className="band" style={{ paddingBottom: 0 }}>
        <div className="container">
          <dl className="facts2">
            <div><dt>Qualification</dt><dd>{l.name}</dd></div>
            <div><dt>Faculty</dt><dd>{f.name}</dd></div>
            <div><dt>Duration</dt><dd>{l.duration}</dd></div>
            <div><dt>Tuition</dt><dd>{feeLabel(l.name, f.name)}</dd></div>
            <div><dt>Entry requirement</dt><dd>{l.entry}</dd></div>
            <div><dt>Application fee</dt><dd>{site.appFee}</dd></div>
            <div><dt>Next intake</dt><dd>{site.intake}</dd></div>
            <div><dt>Study mode</dt><dd>Online</dd></div>
          </dl>
        </div>
      </section>

      <section className="band">
        <div className="container two-col">
          <Reveal className="prose2">
            <h2>Program overview</h2>
            <p>{f.blurb} This {l.name} program is delivered online and takes {l.duration}.</p>
            {isShort ? (
              <>
                <h2>Choose your short course</h2>
                <p>The Certificate level is made up of short courses. Pick one that fits your goals and apply for it directly.</p>
              </>
            ) : (
              <>
                <h2>Core modules</h2>
                <p>The faculty core, shared by degree programs in {f.name}:</p>
                <ul className="checks">{f.modules.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
            <h2>Admission requirements</h2>
            <p><strong>Entry requirement:</strong> {l.entry}</p>
            {docs.length > 0 && (
              <>
                <p>Documents you upload after applying:</p>
                <ul className="checks">{docs.map((d) => <li key={d.key}>{d.label}{d.required ? '' : ' (optional)'}</li>)}</ul>
              </>
            )}
            <h2>Tuition</h2>
            <p>{feeLabel(l.name, f.name)}. {site.feeNote}</p>
          </Reveal>
          <Reveal delay={100}>
            <aside className="aside-card on-dark">
              <h3>Ready to apply?</h3>
              <p>The next intake is {site.intake}. Application fee {site.appFee}.</p>
              <Link className="btn gold-solid lg" href={apply}>Start your application</Link>
              <Link className="btn on-navy" href={'/faculties/' + f.slug}>About the faculty</Link>
              <Link className="btn on-navy" href="/admissions">Admissions information</Link>
            </aside>
          </Reveal>
        </div>
      </section>

      {isShort && related.length > 0 && (
        <section className="band alt">
          <div className="container">
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

      <section className="band">
        <div className="container">
          <p className="more"><Link href={'/faculties/' + f.slug} className="more"><Icon name="back" size={16} /> Back to {f.name}</Link></p>
        </div>
      </section>
    </>
  );
}
