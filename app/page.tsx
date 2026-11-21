import Link from 'next/link';
import { site } from '@/lib/site';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          {site.hero.kicker && <div className="kicker">{site.hero.kicker}</div>}
          <h1 className="display">{site.hero.title}</h1>
          <p className="lead">{site.hero.text}</p>
          <div className="row">
            <Link className="btn" href="/programs">See programs</Link>
            <Link className="btn ghost" href="/apply">Start an application</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{site.programsHeading}</h2>
          <div className="grid">
            {site.programs.map((p) => (
              <div className="card" key={p.name}>
                {p.native && <div className="kicker">{p.native}</div>}
                <h3>{p.name}</h3>
                <p className="muted">{p.blurb}</p>
                <Link href={'/programs#' + p.slug}>View the program &rsaquo;</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bordered soft">
        <div className="container">
          <h2>Levels</h2>
          <div className="grid">
            {site.levels.map((l) => (
              <div className="card" key={l.name}>
                <h3>{l.name}</h3>
                <p className="muted">{l.entry}. {l.duration}.</p>
                <p><strong>{l.fee}</strong></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta">
          <h2>Next intake: {site.intake}. Apply today.</h2>
          <Link className="btn" href="/apply">Start an application</Link>
        </div>
      </section>
    </>
  );
}
