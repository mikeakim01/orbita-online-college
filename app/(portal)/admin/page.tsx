import Link from 'next/link';
import Icon from '@/components/Icon';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';
import { missingFor } from '@/lib/documents';
import { people } from '@/lib/admin';
import { day } from '@/lib/portal';

export const metadata = { title: 'Admin overview' };
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const admin = createAdminClient();
  const head = { count: 'exact' as const, head: true };
  const [apps, certs, attempts, docs, who, studentsRes, unverifiedRes] = await Promise.all([
    admin.from('applications').select('*').order('created_at', { ascending: false }).limit(1000),
    admin.from('certificates').select('id, serial, student_name, exam_title, issued_at, revoked').order('issued_at', { ascending: false }).limit(500),
    admin.from('attempts').select('id, user_id, score, passed, created_at, exams(title)').order('created_at', { ascending: false }).limit(500),
    admin.from('application_documents').select('application_id, doc_type, verified'),
    people(),
    admin.from('profiles').select('id', head).eq('role', 'student'),
    admin.from('application_documents').select('id', head).eq('verified', false),
  ]);
  const A = apps.data ?? [];
  const C = certs.data ?? [];
  const T = attempts.data ?? [];
  const D = docs.data ?? [];
  const by = (s: string) => A.filter((a) => a.status === s).length;
  const students = studentsRes.count ?? 0;
  const passRate = T.length ? Math.round((T.filter((t) => t.passed).length / T.length) * 100) : null;
  const missOf = (a: { id: string; level: string }) => missingFor(a.level, D.filter((d) => d.application_id === a.id).map((d) => d.doc_type as string));

  const perProgram = site.programs.map((p) => ({ name: p.name, n: A.filter((a) => a.program === p.name).length }));
  const max = Math.max(1, ...perProgram.map((p) => p.n));
  const pending = A.filter((a) => a.status === 'submitted');

  type Ev = { at: string; icon: string; kind: string; text: string };
  const events: Ev[] = [
    ...A.slice(0, 8).map((a) => ({ at: a.created_at as string, icon: 'grid', kind: '', text: (who.name.get(a.user_id) || 'A student') + ' applied for ' + a.program + ' (' + a.level + ')' })),
    ...C.slice(0, 6).map((c) => ({ at: c.issued_at as string, icon: 'award', kind: 'gold', text: 'Certificate ' + c.serial + ' issued to ' + c.student_name })),
    ...T.slice(0, 8).map((t) => ({ at: t.created_at as string, icon: 'file', kind: t.passed ? 'ok' : '', text: (who.name.get(t.user_id) || 'A student') + (t.passed ? ' passed ' : ' attempted ') + ((t.exams as unknown as { title: string } | null)?.title ?? 'an exam') + ' (' + t.score + '%)' })),
  ].sort((x, y) => (x.at < y.at ? 1 : -1)).slice(0, 8);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Admin</span></p>
          <h1>Admin overview</h1>
          <p className="muted" style={{ margin: 0 }}>Live figures from your database.</p>
        </div>
        <Link className="btn" href="/admin/applications?status=submitted"><Icon name="check" size={18} /> Review pending ({pending.length})</Link>
      </div>

      <section className="g4" aria-label="Key figures">
        <div className="tile"><span className="ico blue"><Icon name="grid" /></span><div><b>{A.length}</b><span>Applications</span></div></div>
        <div className="tile"><span className="ico gold"><Icon name="clock" /></span><div><b>{by('submitted')}</b><span>Waiting for review</span></div></div>
        <div className="tile"><span className="ico cyan"><Icon name="users" /></span><div><b>{students}</b><span>Students</span></div></div>
        <div className="tile"><span className="ico gold"><Icon name="award" /></span><div><b>{C.filter((c) => !c.revoked).length}</b><span>Valid certificates</span></div></div>
        <div className="tile"><span className="ico"><Icon name="check" /></span><div><b>{by('approved')}</b><span>Approved</span></div></div>
        <div className="tile"><span className="ico"><Icon name="alert" /></span><div><b>{by('rejected')}</b><span>Rejected</span></div></div>
        <div className="tile"><span className="ico blue"><Icon name="file" /></span><div><b>{passRate === null ? '-' : passRate + '%'}</b><span>Pass rate, last {T.length} attempts</span></div></div>
        <div className="tile"><span className="ico cyan"><Icon name="folder" /></span><div><b>{unverifiedRes.count ?? 0}</b><span>Documents to verify</span></div></div>
      </section>

      <div className="g2" style={{ alignItems: 'start' }}>
        <section className="card" aria-labelledby="h-pend">
          <div className="between"><h2 id="h-pend" style={{ fontSize: 20 }}>Pending reviews</h2><Link href="/admin/applications?status=submitted">See all</Link></div>
          {pending.length ? (
            <div className="list">
              {pending.slice(0, 5).map((a) => {
                const miss = missOf(a);
                return (
                  <div key={a.id}>
                    <span className="nt warn"><Icon name="clock" size={18} /></span>
                    <div className="grow">
                      <strong>{who.name.get(a.user_id) || '(no name)'}</strong>
                      <div className="muted small">{a.program} &middot; {a.level} &middot; {day(a.created_at)}</div>
                      {miss.length > 0 ? <span className="badge warn" style={{ marginTop: 4 }}>{miss.length} document{miss.length === 1 ? '' : 's'} missing</span> : <span className="badge ok" style={{ marginTop: 4 }}>Ready to review</span>}
                    </div>
                    <Link className="btn ghost sm" href={'/admin/applications?status=submitted&q=' + encodeURIComponent(who.email.get(a.user_id) ?? '')}>Review</Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>No applications are waiting.</p>
          )}
        </section>

        <section className="card" aria-labelledby="h-prog">
          <h2 id="h-prog" style={{ fontSize: 20 }}>Applications by faculty</h2>
          <div className="bars">
            {perProgram.map((p) => (
              <div className="bar" key={p.name}>
                <span>{p.name}</span>
                <div className="progress" role="img" aria-label={p.n + ' applications'}><span style={{ width: (p.n / max) * 100 + '%' }} /></div>
                <strong>{p.n}</strong>
              </div>
            ))}
          </div>
          <p className="muted small" style={{ margin: '14px 0 0' }}>Counts include every level and status.</p>
        </section>
      </div>

      <section className="card" aria-labelledby="h-act">
        <h2 id="h-act" style={{ fontSize: 20 }}>System activity</h2>
        {events.length ? (
          <div className="list">
            {events.map((e, i) => (
              <div key={i}>
                <span className={'nt ' + e.kind}><Icon name={e.icon} size={18} /></span>
                <div className="grow">{e.text}<div className="muted small">{day(e.at)}</div></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ margin: 0 }}>Activity will appear here once students start applying.</p>
        )}
      </section>
    </>
  );
}
