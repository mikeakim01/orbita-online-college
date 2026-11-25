import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { categoryOf, courseBySlug, courseSlug, courses, facultyName } from '@/lib/catalog';
import PageHeader from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = courseBySlug(params.slug);
  if (!c) return { title: 'Course not found' };
  return { title: c.name, description: c.blurb + ' ' + c.weeks + ' weeks, $' + c.fee.toLocaleString('en-US') + '.', alternates: { canonical: '/courses/' + courseSlug(c) }, openGraph: { title: c.name + ' | ' + site.name, description: c.blurb, url: '/courses/' + courseSlug(c), type: 'website' } };
}

export default function Course({ params }: { params: { slug: string } }) {
  const c = courseBySlug(params.slug);
  if (!c) notFound();
  const more = courses().filter((x) => x.faculty === c.faculty && x.name !== c.name).slice(0, 4);
  const apply = '/apply?program=' + c.faculty + '&level=Certificate&course=' + encodeURIComponent(c.name);
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Short Courses', href: '/courses' }, { label: c.name }]} kicker={categoryOf(c) + ' · ' + c.tier + ' level'} title={c.name} lead={c.blurb}>
        <p style={{ marginTop: 26 }}><Link className="btn gold-solid lg" href={apply}>Enroll in this course</Link></p>
      </PageHeader>

      <section className="band">
        <div className="container two-col">
          <Reveal className="prose2">
            <dl className="facts2" style={{ marginBottom: 34 }}>
              <div><dt>Level</dt><dd>{c.tier}</dd></div>
              <div><dt>Length</dt><dd>{c.weeks} weeks</dd></div>
              <div><dt>Course fee</dt><dd>${c.fee.toLocaleString('en-US')}</dd></div>
              <div><dt>Faculty</dt><dd>{facultyName(c.faculty)}</dd></div>
            </dl>
            <h2>About this course</h2>
            <p>{c.blurb}</p>
            <h2>Who it is for</h2>
            <p>Prerequisite: {c.prerequisite}</p>
            <h2>Assessment and certificate</h2>
            <p>Students sit an online exam, graded on the server. Passing earns a certificate with its own ID and a public verification page.</p>
            <figure className="frame" style={{ margin: '30px 0 0', maxWidth: 560 }}><Scene kind={sceneFor(c.name, c.faculty)} label={c.name} /></figure>
          </Reveal>
          <Reveal delay={100}>
            <aside className="aside-card on-dark">
              <h3>Enroll in {c.name}</h3>
              <p>${c.fee.toLocaleString('en-US')} for {c.weeks} weeks. Next intake: {site.intake}. Application fee {site.appFee}.</p>
              <Link className="btn gold-solid lg" href={apply}>Enroll now</Link>
              <Link className="btn on-navy" href="/courses">Browse all courses</Link>
            </aside>
          </Reveal>
        </div>
      </section>

      {more.length > 0 && (
        <section className="band alt">
          <div className="container">
            <h2 style={{ margin: '0 0 26px' }}>More in {facultyName(c.faculty)}</h2>
            <div className="cards four">
              {more.map((x) => (
                <Link key={x.name} href={'/courses/' + courseSlug(x)} className="cc">
                  <div className="img"><Scene kind={sceneFor(x.name, x.faculty)} /></div>
                  <div className="txt"><span className="cat">{categoryOf(x)} &middot; {x.tier}</span><h3>{x.name}</h3><div className="meta"><span>{x.weeks} weeks</span><span>${x.fee.toLocaleString('en-US')}</span></div></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
