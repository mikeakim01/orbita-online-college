import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: { applied?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/dashboard');

  const [{ data: prof }, { data: apps }, { data: certs }, { data: attempts }, { data: exams }] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
    supabase.from('attempts').select('*, exams(code,title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('exams').select('*').order('code'),
  ]);

  const docRows = site.docRules && apps && apps.length
    ? ((await supabase.from('application_documents').select('application_id, doc_type').in('application_id', apps.map((a) => a.id))).data ?? [])
    : [];
  const approved = (apps ?? []).filter((a) => a.status === 'approved').map((a) => a.program as string);
  const open = (exams ?? []).filter((e) =>
    approved.some((p) => p === e.program || (site.programAccess[p] ?? []).includes(e.program))
  );
  const first = (prof?.full_name || user.email || '').split(' ')[0];

  return (
    <section className="section">
      <div className="container">
        <h1>Welcome, {first}</h1>
        {searchParams.applied && (
          <p role="status" className="okmsg">
            Application received. We will review it and update the status here.
          </p>
        )}
        {prof?.role === 'admin' && (
          <p>
            <Link className="btn sm" href="/admin">
              Open admin
            </Link>
          </p>
        )}

        <h2 className="sub">Your applications</h2>
        {apps && apps.length ? (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Sent</th>
                  {site.docRules && <th>Documents</th>}
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td>{a.program}</td>
                    <td>{a.level}</td>
                    <td>
                      <span className={'badge ' + a.status}>{a.status}</span>
                    </td>
                    <td>{new Date(a.created_at).toISOString().slice(0, 10)}</td>
                    {site.docRules && (
                      <td>
                        {slotsFor(a.level).length ? (
                          <>
                            {(() => {
                              const miss = missingFor(a.level, docRows.filter((d) => d.application_id === a.id).map((d) => d.doc_type));
                              return miss.length ? miss.length + ' still needed' : 'Complete';
                            })()}{' '}
                            <Link href={'/documents/' + a.id}>{a.status === 'submitted' ? 'Upload' : 'View'}</Link>
                          </>
                        ) : (
                          <span className="muted">None needed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            No applications yet. <Link href="/apply">Start one</Link>.
          </p>
        )}

        <h2 className="sub">Exams</h2>
        {open.length ? (
          <div className="grid">
            {open.map((e) => (
              <div className="card" key={e.id}>
                <h3>{e.title}</h3>
                <p className="muted">
                  {e.code} &middot; {e.duration_min} min &middot; pass mark {e.pass_mark}%
                </p>
                <Link className="btn sm" href={'/exams/' + e.code}>
                  Take exam
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Exams unlock when an application is approved.</p>
        )}

        <h2 className="sub">Certificates</h2>
        {certs && certs.length ? (
          <div className="grid">
            {certs.map((c) => (
              <div className="card" key={c.id}>
                <h3>{c.exam_title}</h3>
                <p className="muted">
                  {c.serial} &middot; {c.score}% {c.revoked ? '(revoked)' : ''}
                </p>
                <Link className="btn sm" href={'/certificates/' + c.serial}>
                  View and download
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Pass an exam to earn your first certificate.</p>
        )}

        {attempts && attempts.length > 0 && (
          <>
            <h2 className="sub">Recent attempts</h2>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{(a.exams as { title: string } | null)?.title}</td>
                      <td>{a.score}%</td>
                      <td>{a.passed ? 'Passed' : 'Not passed'}</td>
                      <td>{new Date(a.created_at).toISOString().slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
