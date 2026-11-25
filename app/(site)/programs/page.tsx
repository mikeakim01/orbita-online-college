import Link from 'next/link';
import { site } from '@/lib/site';
import Calculator from '@/components/Calculator';
import Icon, { ProgramIcon } from '@/components/Icon';

export const metadata = { title: 'Programs and fees', description: site.programsIntro, alternates: { canonical: '/programs' } };

const TIERS = ['Entry', 'Mid', 'Pro'];

export default function Programs({ searchParams }: { searchParams: { q?: string; faculty?: string; tier?: string } }) {
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const faculty = site.programs.some((p) => p.slug === searchParams.faculty) ? searchParams.faculty : '';
  const tier = TIERS.includes(searchParams.tier ?? '') ? searchParams.tier : '';
  const hit = (...t: string[]) => !q || t.join(' ').toLowerCase().includes(q);

  const programs = site.programs.filter((p) => (!faculty || p.slug === faculty) && hit(p.name, p.blurb, p.careers, p.modules.join(' ')));
  const courses = (site.courses ?? []).filter((c) => (!faculty || c.faculty === faculty) && (!tier || c.tier === tier) && hit(c.name, c.blurb));
  const filtered = Boolean(q || faculty || tier);

  return (
    <>
      <div>
        <p className="kicker">Programs</p>
        <h1>Programs, courses and fees</h1>
        <p className="lead">{site.programsIntro}</p>
      </div>

      <form className="card filters" action="/programs" role="search" aria-label="Filter programs">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="pq">Search</label>
          <input id="pq" name="q" type="search" defaultValue={searchParams.q ?? ''} placeholder="Try python, networks, satellite..." />
        </div>
        <div className="field">
          <label htmlFor="pf">Faculty</label>
          <select id="pf" name="faculty" defaultValue={faculty}>
            <option value="">All faculties</option>
            {site.programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pt">Course level</label>
          <select id="pt" name="tier" defaultValue={tier}>
            <option value="">All levels</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit">
          <Icon name="search" size={18} /> Search
        </button>
        {filtered && (
          <Link className="btn ghost" href="/programs">
            Clear
          </Link>
        )}
      </form>

      <section aria-labelledby="h-fac">
        <div className="sec-title">
          <h2 id="h-fac">Faculties</h2>
          <span className="muted small">{programs.length} shown</span>
        </div>
        {programs.length ? (
          <div className="grid">
            {programs.map((p) => (
              <article className="card prog-card" key={p.name} id={p.slug}>
                <ProgramIcon slug={p.slug} size={22} />
                {p.native && <p className="kicker" style={{ margin: 0 }}>{p.native}</p>}
                <h3>{p.name}</h3>
                <p className="muted" style={{ margin: 0 }}>{p.blurb}</p>
                <p className="small" style={{ margin: 0 }}><strong>Careers:</strong> {p.careers}</p>
                <ul className="chips">
                  {p.modules.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <Link className="btn sm" href={'/apply?program=' + p.slug}>
                  Apply to this faculty
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No faculties match</h3>
            <p>Try a different word or clear the filters.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="h-lev" id="levels">
        <div className="sec-title">
          <h2 id="h-lev">Levels and fees</h2>
        </div>
        <div className="tablewrap">
          <table className="rtable">
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
                  <td data-label="Level"><strong>{l.name}</strong></td>
                  <td data-label="Entry">{l.entry}</td>
                  <td data-label="Duration">{l.duration}</td>
                  <td data-label="Fee">{l.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>{site.feeNote}</p>
      </section>

      {(site.courses?.length ?? 0) > 0 && (
        <section aria-labelledby="h-cou" id="courses">
          <div className="sec-title">
            <h2 id="h-cou">Short courses and certificates</h2>
            <span className="muted small">{courses.length} shown</span>
          </div>
          {courses.length ? (
            <div className="grid">
              {courses.map((c) => {
                const fac = site.programs.find((p) => p.slug === c.faculty);
                return (
                  <article className="card prog-card" key={c.name}>
                    <div className="meta">
                      <span className={'badge ' + (c.tier === 'Entry' ? 'ok' : c.tier === 'Mid' ? 'violet' : 'gold')}>{c.tier} level</span>
                      <span className="badge">{fac?.name}</span>
                    </div>
                    <h3>{c.name}</h3>
                    <p className="muted" style={{ margin: 0 }}>{c.blurb}</p>
                    <p className="small muted" style={{ margin: 0 }}>
                      {c.weeks} weeks &middot; ${c.fee.toLocaleString('en-US')} &middot; Prerequisite: {c.prerequisite}
                    </p>
                    <Link className="btn sm" href={'/apply?program=' + c.faculty + '&level=Certificate&course=' + encodeURIComponent(c.name)}>
                      Apply for this course
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty">
              <h3>No courses match</h3>
              <p>Try a different word or clear the filters.</p>
            </div>
          )}
        </section>
      )}

      <section id="calculator" aria-labelledby="h-calc">
        <div className="sec-title">
          <h2 id="h-calc">Fee calculator</h2>
        </div>
        <Calculator />
      </section>

      <section id="faq" aria-labelledby="h-faq">
        <div className="sec-title">
          <h2 id="h-faq">Fees and payment</h2>
        </div>
        <div className="card">
          {site.faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="cta">
        <h2>Next intake: {site.intake}.</h2>
        <Link className="btn" href="/apply">
          Start an application
        </Link>
      </div>
    </>
  );
}
