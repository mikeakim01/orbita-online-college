import ApplyForm from '@/components/ApplyForm';
import OrbitArt from '@/components/OrbitArt';
import { site } from '@/lib/site';
import './apply.css';

export const metadata = { title: 'Apply', description: 'Apply to ' + site.name + ': steps, requirements and fees.' };

const STEPS = [
  ['Create an account', 'Register with your email and confirm it. It takes two minutes.'],
  ['Send your application', 'Choose a program and level, and tell us why you want to study it.'],
  ['Admissions review', 'An admissions officer reviews every application. You see the status on your dashboard.'],
  ['Offer and enrolment', 'Approved applicants receive an offer letter with final fees and the enrolment steps.'],
];

const DOCS = [
  'A valid passport or national ID',
  'Your highest qualification certificate and transcript',
  'For Master and PhD: your previous degree certificate', 'For Certificate courses: nothing extra, unless the course lists a prerequisite',
  'For PhD: a research proposal of one to two pages',
  'Proof of English language ability, if English is not your first language',
];

export default function Apply({ searchParams }: { searchParams: { program?: string; level?: string; course?: string } }) {
  return (
    <>
      <section className="apply-hero">
        <div className="container apply-hero-in">
          <div>
            <p className="eyebrow">ADMISSIONS · INTAKE {site.intake.toUpperCase()}</p>
            <h1>Start your application</h1>
            <p className="lead">
              Pick your faculty and level, from a short certificate course to a PhD, check what you need, and send your application in a few minutes. Application fee: {site.appFee}.
            </p>
          </div>
          <OrbitArt />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ApplyForm initialProgram={searchParams.program} initialLevel={searchParams.level} initialCourse={searchParams.course} />
        </div>
      </section>

      <section className="section bordered">
        <div className="container">
          <h2>How it works</h2>
          <ol className="steps">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="num" aria-hidden="true">{i + 1}</span>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bordered">
        <div className="container two">
          <div>
            <h2>What to have ready</h2>
            <ul className="ticks">
              {DOCS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="muted">After you send your application, the next screen lets you upload these files (PDF, JPG or PNG, up to 5 MB each). You can add or replace them until an admissions officer decides.</p>
          </div>
          <div>
            <h2>Questions about applying</h2>
            {site.faq.slice(0, 4).map((f) => (
              <details key={f.q} className="qa">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <p>
              Still unsure? Write to <a href={'mailto:' + site.email}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
