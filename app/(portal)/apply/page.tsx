import Link from 'next/link';
import ApplyForm from '@/components/ApplyForm';
import { site } from '@/lib/site';

export const metadata = { title: 'Apply', description: 'Apply to ' + site.name + ': steps, requirements and fees.' };

const STEPS = [
  ['Choose a program', 'Pick your faculty and level in the form.'],
  ['Send your application', 'Tell us why you want to study it. It takes a few minutes.'],
  ['Upload documents', 'The next screen asks for the files your level needs.'],
  ['Admissions review', 'You can follow the decision on your dashboard.'],
];

const DOCS = [
  'A valid passport or national ID',
  'Your highest qualification certificate and transcript',
  'For Master and PhD: your previous degree certificate',
  'For PhD: a research proposal of one to two pages',
  'Proof of English language ability, if English is not your first language',
  'For Certificate courses: nothing extra, unless the course lists a prerequisite',
];

export default function Apply({ searchParams }: { searchParams: { program?: string; level?: string; course?: string } }) {
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Apply</span></p>
          <h1>Start your application</h1>
          <p className="muted" style={{ margin: 0 }}>Next intake: {site.intake}. Application fee: {site.appFee}.</p>
        </div>
      </div>

      <ApplyForm initialProgram={searchParams.program} initialLevel={searchParams.level} initialCourse={searchParams.course} />

      <section aria-labelledby="h-how">
        <h2 id="h-how">How it works</h2>
        <ol className="steps">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              <h3>{t}</h3>
              <p className="muted" style={{ margin: 0 }}>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="two">
        <section className="card">
          <h2 style={{ fontSize: 21 }}>What to have ready</h2>
          <ul className="ticks">
            {DOCS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="muted small" style={{ margin: 0 }}>
            After you send your application, the next screen lets you upload these files (PDF, JPG or PNG, up to 5 MB each). You can add or replace them until an admissions officer decides.
          </p>
        </section>
        <section className="card">
          <h2 style={{ fontSize: 21 }}>Questions about applying</h2>
          {site.faq.slice(0, 4).map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
          <p style={{ margin: '14px 0 0' }}>
            Still unsure? Write to <a href={'mailto:' + site.email}>{site.email}</a>.
          </p>
        </section>
      </div>
    </>
  );
}
