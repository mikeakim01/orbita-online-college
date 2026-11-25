import Link from 'next/link';
import Icon, { ProgramIcon } from '@/components/Icon';
import { site } from '@/lib/site';
import { requireSession, day } from '@/lib/portal';

export const metadata = { title: 'Exams' };
export const dynamic = 'force-dynamic';

const slugOf = (program: string) => site.programs.find((p) => p.name === program)?.slug;

export default async function Exams() {
  const { supabase, user } = await requireSession('/exams');
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [{ data: exams }, { data: apps }, { data: attempts }] = await Promise.all([
    supabase.from('exams').select('*').order('code'),
    supabase.from('applications').select('program').eq('user_id', user.id).eq('status', 'approved'),
    supabase.from('attempts').select('id, exam_id, score, passed, created_at, exams(code, title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);
  const approved = (apps ?? []).map((a) => a.program as string);
  const can = (program: string) => approved.some((p) => p === program || (site.programAccess[p] ?? []).includes(program));
  const recent = (id: string) => (attempts ?? []).filter((a) => a.exam_id === id && a.created_at > since).length;
  const open = (exams ?? []).filter((e) => can(e.program));
  const locked = (exams ?? []).filter((e) => !can(e.program));
  const title = (a: { exams: unknown }) => (a.exams as { title: string; code: string } | null)?.title ?? 'Exam';

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Exams</span></p>
          <h1>Exams</h1>
          <p className="muted" style={{ margin: 0 }}>Exams are timed and marked on the server. You can attempt each exam 3 times every 24 hours.</p>
        </div>
      </div>

      <section aria-labelledby="h-open">
        <div className="sec-title"><h2 id="h-open">Available to you</h2></div>
        {open.length ? (
          <div className="grid">
            {open.map((e) => {
              const left = Math.max(0, 3 - recent(e.id));
              const cy = slugOf(e.program) === 'satellite';
              return (
                <div className={'exam-card' + (cy ? ' cyan' : '')} key={e.id}>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <ProgramIcon slug={slugOf(e.program)} size={22} />
                    <div><h3 style={{ margin: 0 }}>{e.title}</h3><span className="muted small">{e.program}</span></div>
                  </div>
                  <p className="muted small" style={{ margin: 0 }}>{e.description}</p>
                  <div className="meta row"><span className="badge"><Icon name="clock" size={13} /> {e.duration_min} min</span><span className="badge">Pass mark {e.pass_mark}%</span><span className={'badge ' + (left ? 'ok' : 'rejected')}>{left} attempt{left === 1 ? '' : 's'} left today</span></div>
                  <div><Link className={'btn sm ' + (cy ? 'cyan' : '')} href={'/exams/' + e.code} aria-disabled={left === 0}>Open exam <Icon name="arrow" size={16} /></Link></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty"><h3>No exams are open yet</h3><p>Exams unlock when an application is approved.</p><Link className="btn" href="/applications">View my applications</Link></div>
        )}
      </section>

      {locked.length > 0 && (
        <section aria-labelledby="h-lock">
          <div className="sec-title"><h2 id="h-lock">Locked</h2></div>
          <div className="grid">
            {locked.map((e) => (
              <div className="exam-card locked" key={e.id}>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <span className="ico"><Icon name="lock" /></span>
                  <div><h3 style={{ margin: 0 }}>{e.title}</h3><span className="muted small">Opens when your {e.program} application is approved</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="h-hist">
        <div className="sec-title"><h2 id="h-hist">Your attempts</h2></div>
        {attempts && attempts.length ? (
          <div className="tablewrap">
            <table className="rtable">
              <thead><tr><th>Exam</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
              <tbody>
                {attempts.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td data-label="Exam">{title(a)}</td>
                    <td data-label="Score">{a.score}%</td>
                    <td data-label="Result"><span className={'badge ' + (a.passed ? 'approved' : 'rejected')}>{a.passed ? 'Passed' : 'Not passed'}</span></td>
                    <td data-label="Date">{day(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty"><p style={{ margin: 0 }}>You have not taken an exam yet.</p></div>
        )}
      </section>
    </>
  );
}
