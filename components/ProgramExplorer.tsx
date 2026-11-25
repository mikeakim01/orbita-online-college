'use client';
import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';

export type ProgrammeRow = { title: string; href: string; faculty: string; facultySlug: string; level: string; duration: string; entry: string; fee: string };

/** Filter degree programmes by faculty and qualification level without leaving the page. */
export default function ProgramExplorer({ rows, faculties, levels, initialFaculty = '', initialLevel = '', limit }: { rows: ProgrammeRow[]; faculties: { slug: string; name: string }[]; levels: string[]; initialFaculty?: string; initialLevel?: string; limit?: number }) {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [level, setLevel] = useState(initialLevel);
  const shown = rows.filter((r) => (!faculty || r.facultySlug === faculty) && (!level || r.level === level));
  const list = limit && !faculty && !level ? shown.slice(0, limit) : shown;
  return (
    <div>
      <div className="pf">
        <div className="grp">
          <span className="lab" id="pf-fac">Faculty</span>
          <div className="pills" role="group" aria-labelledby="pf-fac">
            <button type="button" className="pill" aria-pressed={!faculty} onClick={() => setFaculty('')}>All</button>
            {faculties.map((f) => (
              <button key={f.slug} type="button" className="pill" aria-pressed={faculty === f.slug} onClick={() => setFaculty(f.slug)}>{f.name}</button>
            ))}
          </div>
        </div>
        <div className="grp">
          <span className="lab" id="pf-lev">Qualification</span>
          <div className="pills" role="group" aria-labelledby="pf-lev">
            <button type="button" className="pill" aria-pressed={!level} onClick={() => setLevel('')}>All</button>
            {levels.map((l) => (
              <button key={l} type="button" className="pill" aria-pressed={level === l} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="result-note" aria-live="polite">{shown.length} program{shown.length === 1 ? '' : 's'}</p>
      {list.length ? (
        <div className="cards">
          {list.map((r) => (
            <Link key={r.href} href={r.href} className="pc">
              <div className="tags"><span className="badge violet">{r.level}</span><span className="badge">{r.faculty}</span></div>
              <h3>{r.title}</h3>
              <dl>
                <div><dt>Duration</dt><dd>{r.duration}</dd></div>
                <div><dt>Entry</dt><dd>{r.entry}</dd></div>
                <div><dt>Tuition</dt><dd>{r.fee}</dd></div>
              </dl>
              <span className="go">Program details <Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty"><h3>No programs match</h3><p>Try another faculty or level.</p></div>
      )}
    </div>
  );
}
