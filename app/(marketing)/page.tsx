import Link from 'next/link';
import { site } from '@/lib/site';
import Icon, { ProgramIcon } from '@/components/Icon';
import EarthBanner from '@/components/EarthBanner';

export const metadata = {
  title: site.name,
  description: site.hero.text,
  alternates: { canonical: '/' },
};

const BENEFITS = [
  ['shield', 'Fair, secure exams', 'Exams are timed and graded on the server. Correct answers never reach your browser.', 'blue'],
  ['award', 'Verifiable certificates', 'Every certificate has an ID and a public page where anyone can confirm it is genuine.', 'gold'],
  ['book', 'Start small, go far', 'Begin with a short certificate course and move up to a diploma, Bachelor, Master or PhD.', 'cyan'],
  ['satellite', 'Built for space and security', 'Faculties in Information Technology, Cyber Security and Satellite Systems.', ''],
];

const STEPS = [
  ['Create an account', 'Register with your email. It takes two minutes.'],
  ['Apply and upload documents', 'Choose a faculty and level, then upload the files we ask for.'],
  ['Get approved', 'Admissions reviews your application. You can follow the status online.'],
  ['Study, sit exams, earn certificates', 'Approved students unlock their exams and receive verifiable certificates.'],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-in">
          <div>
            {site.hero.kicker && <p className="kicker">{site.hero.kicker}</p>}
            <h1>{site.hero.title}</h1>
            <p className="lead">{site.hero.text}</p>
            <div className="row">
              <Link className="btn" href="/apply">
                Start an application <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn ghost" href="/programs">
                Explore programs
              </Link>
            </div>
            <p className="muted small" style={{ marginTop: 16 }}>
              Next intake: {site.intake}. Application fee: {site.appFee}.
            </p>
          </div>
          <div className="hero-art card" style={{ padding: 0, overflow: 'hidden', background: '#070b19' }}>
            <EarthBanner />
          </div>
        </div>
        <div className="container">
          <div className="stats" aria-label="At a glance">
            <div className="stat"><b>{site.programs.length}</b><span>Faculties</span></div>
            <div className="stat"><b>{site.levels.length}</b><span>Levels, certificate to PhD</span></div>
            <div className="stat"><b>{site.courses?.length ?? 0}</b><span>Short courses</span></div>
            <div className="stat"><b>{site.intake}</b><span>Next intake</span></div>
          </div>
        </div>
      </section>

      <section className="section bordered">
        <div className="container">
          <p className="kicker">Why Orbita</p>
          <h2>Everything you need to study online and prove it</h2>
          <div className="grid" style={{ marginTop: 24 }}>
            {BENEFITS.map(([i, t, d, c]) => (
              <div className="card feature" key={t}>
                <span className={'ico ' + c}>
                  <Icon name={i} />
                </span>
                <h3>{t}</h3>
                <p className="muted" style={{ margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bordered soft">
        <div className="container">
          <p className="kicker">Faculties</p>
          <h2>{site.programsHeading}</h2>
          <div className="grid" style={{ marginTop: 24 }}>
            {site.programs.map((p) => (
              <div className="card prog-card" key={p.name}>
                <ProgramIcon slug={p.slug} size={22} />
                <h3>{p.name}</h3>
                <p className="muted" style={{ margin: 0 }}>{p.blurb}</p>
                <ul className="chips">
                  {p.modules.slice(0, 3).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <Link href={'/programs?faculty=' + p.slug}>View the faculty &rsaquo;</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bordered" id="how">
        <div className="container">
          <p className="kicker">How it works</p>
          <h2>From application to certificate</h2>
          <ol className="steps">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="num">{i + 1}</span>
                <h3>{t}</h3>
                <p className="muted" style={{ margin: 0 }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bordered soft">
        <div className="container">
          <p className="kicker">Levels</p>
          <h2>Choose the level that fits you</h2>
          <div className="grid" style={{ marginTop: 24 }}>
            {site.levels.map((l) => (
              <div className="card" key={l.name}>
                <h3>{l.name}</h3>
                <p className="muted">{l.duration}</p>
                <p style={{ margin: 0 }}><strong>{l.fee}</strong></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bordered" id="faq">
        <div className="container two">
          <div>
            <p className="kicker">FAQ</p>
            <h2>Questions, answered</h2>
            <p className="muted">
              Cannot find your answer? Write to <a href={'mailto:' + site.email}>{site.email}</a>.
            </p>
          </div>
          <div>
            {site.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>Next intake: {site.intake}. Apply today.</h2>
            <Link className="btn" href="/apply">
              Start an application
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
