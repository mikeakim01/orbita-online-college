import Link from 'next/link';
import { site } from '@/lib/site';
import { feeLabel } from '@/lib/catalog';
import PageHeader, { FAQ, SectionHeading } from '@/components/PageHeader';
import Calculator from '@/components/Calculator';
import Reveal from '@/components/Reveal';

export const metadata = {
  title: 'Admissions',
  description: 'How to apply to ' + site.name + ': requirements, application process, tuition and fees, and frequently asked questions. Next intake ' + site.intake + '.',
  alternates: { canonical: '/admissions' },
  openGraph: { title: 'Admissions at ' + site.name, url: '/admissions', type: 'website' as const },
};

const PROCESS = [
  ['Choose your program', 'Pick a faculty and level. For short courses, pick the course too.'],
  ['Apply online', 'Create an account and send the application. The application fee is ' + site.appFee + '.'],
  ['Upload your documents', 'The next screen lists the files your level needs. Add or replace them until a decision is made.'],
  ['Admissions review', 'An officer checks your documents and decides. You see the result on your dashboard.'],
  ['Start learning', 'Once approved, sign in to your portal to take exams and earn certificates.'],
];

export default function Admissions() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Admissions' }]} kicker={'Next intake: ' + site.intake} title="Admissions" lead="Everything you need to apply: requirements by level, the application process, tuition and answers to common questions.">
        <p style={{ marginTop: 26 }}><Link className="btn gold-solid lg" href="/apply">Start your application</Link></p>
      </PageHeader>

      <section className="band" id="process">
        <div className="container">
          <Reveal><SectionHeading kicker="Application process" title="How to apply" /></Reveal>
          <Reveal>
            <ol className="proc">
              {PROCESS.map(([t, d], i) => (
                <li key={t}><span className="no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="requirements">
        <div className="container">
          <Reveal><SectionHeading kicker="Entry requirements" title="Requirements by qualification level" /></Reveal>
          <Reveal>
            <div className="scroll-x">
              <table className="table2">
                <thead><tr><th>Level</th><th>Duration</th><th>Entry requirement</th><th>Documents</th></tr></thead>
                <tbody>
                  {site.levels.map((l) => (
                    <tr key={l.name}>
                      <td><strong>{l.name}</strong></td>
                      <td>{l.duration}</td>
                      <td>{l.entry}</td>
                      <td>{(site.docRules?.[l.name] ?? []).filter((d) => d.required).map((d) => d.label).join(', ') || 'None required'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="fees">
        <div className="container">
          <Reveal><SectionHeading kicker="Tuition and fees" title="What it costs" lead={site.feeNote} /></Reveal>
          <Reveal>
            <div className="scroll-x" style={{ marginBottom: 36 }}>
              <table className="table2">
                <thead><tr><th>Level</th>{site.programs.map((p) => <th key={p.slug}>{p.name}</th>)}</tr></thead>
                <tbody>
                  {site.levels.map((l) => (
                    <tr key={l.name}><td><strong>{l.name}</strong></td>{site.programs.map((p) => <td key={p.slug}>{feeLabel(l.name, p.name)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Calculator />
          <p className="muted" style={{ marginTop: 16 }}>Application fee: {site.appFee}. Next intake: {site.intake}.</p>
        </div>
      </section>

      <section className="band alt" id="faq">
        <div className="container">
          <Reveal><SectionHeading kicker="Questions" title="Frequently asked questions" /></Reveal>
          <Reveal><FAQ items={site.faq} /></Reveal>
          <p style={{ marginTop: 26 }}>Still unsure? <Link href="/contact">Visit the contact page</Link>.</p>
        </div>
      </section>
    </>
  );
}
