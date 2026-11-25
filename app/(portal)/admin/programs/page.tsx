import Link from 'next/link';
import { ProgramIcon } from '@/components/Icon';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';

export const metadata = { title: 'Programs (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminPrograms() {
  const { data: apps } = await createAdminClient().from('applications').select('program, level, status');
  const A = apps ?? [];
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Programs</span></p>
          <h1>Programs</h1>
          <p className="muted" style={{ margin: 0 }}>Programs, levels, fees and courses are defined in <code>lib/site.ts</code>. Edit that file and redeploy to change them.</p>
        </div>
      </div>

      <section className="grid" aria-label="Faculties">
        {site.programs.map((p) => {
          const mine = A.filter((a) => a.program === p.name);
          return (
            <article className="card prog-card" key={p.name}>
              <ProgramIcon slug={p.slug} size={22} />
              <h3>{p.name}</h3>
              <p className="muted small" style={{ margin: 0 }}>{p.blurb}</p>
              <dl className="facts">
                <div><dt>Applications</dt><dd>{mine.length}</dd></div>
                <div><dt>Approved</dt><dd>{mine.filter((a) => a.status === 'approved').length}</dd></div>
                <div><dt>Pending</dt><dd>{mine.filter((a) => a.status === 'submitted').length}</dd></div>
              </dl>
              <ul className="chips">{p.modules.map((m) => <li key={m}>{m}</li>)}</ul>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="h-lv">
        <div className="sec-title"><h2 id="h-lv">Levels</h2></div>
        <div className="tablewrap">
          <table className="rtable">
            <thead><tr><th>Level</th><th>Entry</th><th>Duration</th><th>Fee</th><th>Applications</th></tr></thead>
            <tbody>
              {site.levels.map((l) => (
                <tr key={l.name}>
                  <td data-label="Level"><strong>{l.name}</strong></td>
                  <td data-label="Entry">{l.entry}</td>
                  <td data-label="Duration">{l.duration}</td>
                  <td data-label="Fee">{l.fee}</td>
                  <td data-label="Applications">{A.filter((a) => a.level === l.name).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(site.courses?.length ?? 0) > 0 && (
        <section aria-labelledby="h-co">
          <div className="sec-title"><h2 id="h-co">Courses</h2></div>
          <div className="tablewrap">
            <table className="rtable">
              <thead><tr><th>Course</th><th>Level</th><th>Faculty</th><th>Length</th><th>Fee</th></tr></thead>
              <tbody>
                {site.courses!.map((c) => (
                  <tr key={c.name}>
                    <td data-label="Course"><strong>{c.name}</strong></td>
                    <td data-label="Level"><span className={'badge ' + (c.tier === 'Entry' ? 'ok' : c.tier === 'Mid' ? 'violet' : 'gold')}>{c.tier}</span></td>
                    <td data-label="Faculty">{site.programs.find((p) => p.slug === c.faculty)?.name}</td>
                    <td data-label="Length">{c.weeks} weeks</td>
                    <td data-label="Fee">${c.fee.toLocaleString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
