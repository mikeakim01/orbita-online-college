import Link from 'next/link';
import { site } from '@/lib/site';
import Calculator from '@/components/Calculator';

export const metadata = { title: 'Programs and fees' };

export default function Programs() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Programs</h1>
          <p className="lead">{site.programsIntro}</p>
        </div>
      </section>

      {site.programs.map((p) => (
        <section className="section bordered" key={p.name} id={p.slug}>
          <div className="container two">
            <div>
              {p.native && <div className="kicker">{p.native}</div>}
              <h2>{p.name}</h2>
              <p className="lead">{p.blurb}</p>
              <p className="muted">Careers: {p.careers}</p>
            </div>
            <ul className="chips">
              {p.modules.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="section bordered soft" id="levels">
        <div className="container">
          <h2>Levels and fees</h2>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Entry</th>
                  <th>Duration</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {site.levels.map((l) => (
                  <tr key={l.name}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.entry}</td>
                    <td>{l.duration}</td>
                    <td>{l.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">{site.feeNote}</p>
        </div>
      </section>

      <section className="section bordered" id="calculator">
        <div className="container">
          <h2>Fee calculator</h2>
          <p className="lead">Choose your options to see the total cost.</p>
          <Calculator />
        </div>
      </section>

      <section className="section bordered soft" id="faq">
        <div className="container two">
          <h2>Fees and payment</h2>
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
        <div className="container cta">
          <h2>Next intake: {site.intake}.</h2>
          <Link className="btn" href="/apply">Start an application</Link>
        </div>
      </section>
    </>
  );
}
