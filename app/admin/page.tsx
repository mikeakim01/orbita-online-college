import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { setApplicationStatus, setCertificateRevoked } from '@/app/actions';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function Admin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!me || me.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const [{ data: apps }, { data: certs }, { data: profs }, users] = await Promise.all([
    admin.from('applications').select('*').order('created_at', { ascending: false }).limit(200),
    admin.from('certificates').select('*').order('issued_at', { ascending: false }).limit(200),
    admin.from('profiles').select('id, full_name'),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const allDocs = site.docRules ? (await admin.from('application_documents').select('id, application_id, doc_type, file_name')).data ?? [] : [];
  const name = new Map((profs ?? []).map((p) => [p.id, p.full_name as string]));
  const email = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? '']));
  const pending = (apps ?? []).filter((a) => a.status === 'submitted').length;

  return (
    <section className="section">
      <div className="container">
        <h1>Admin</h1>
        <p className="muted">
          {pending} application{pending === 1 ? '' : 's'} waiting &middot; {apps?.length ?? 0} total &middot; {certs?.length ?? 0} certificates
        </p>

        <h2 className="sub">Applications</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Program</th>
                <th>Level</th>
                <th>Statement</th>
                {site.docRules && <th>Documents</th>}
                <th>Status</th>
                <th>Decide</th>
              </tr>
            </thead>
            <tbody>
              {(apps ?? []).map((a) => (
                <tr key={a.id}>
                  <td>
                    {name.get(a.user_id) || '(no name)'}
                    <div className="muted small">{email.get(a.user_id)}</div>
                  </td>
                  <td>{a.program}</td>
                  <td>{a.level}</td>
                  <td className="small">{a.statement}</td>
                  {site.docRules && (
                    <td className="docbox">
                      {(() => {
                        const mine = allDocs.filter((d) => d.application_id === a.id);
                        const miss = missingFor(a.level, mine.map((d) => d.doc_type));
                        return (
                          <>
                            {mine.map((d) => (
                              <a key={d.id} href={'/documents/file/' + d.id} target="_blank" rel="noopener noreferrer">
                                {(slotsFor(a.level).find((s) => s.key === d.doc_type)?.label ?? d.doc_type)}
                              </a>
                            ))}
                            {miss.length > 0 && <span className="muted">Missing: {miss.map((m) => m.label).join(', ')}</span>}
                            {!mine.length && !miss.length && <span className="muted">None</span>}
                          </>
                        );
                      })()}
                    </td>
                  )}
                  <td>
                    <span className={'badge ' + a.status}>{a.status}</span>
                  </td>
                  <td>
                    <div className="row">
                      {['approved', 'rejected'].map((s) => (
                        <form action={setApplicationStatus} key={s}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value={s} />
                          <button className="btn sm ghost" type="submit" disabled={a.status === s}>
                            {s === 'approved' ? 'Approve' : 'Reject'}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="sub">Certificates</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(certs ?? []).map((c) => (
                <tr key={c.id}>
                  <td><a href={'/certificates/' + c.serial}>{c.serial}</a></td>
                  <td>{c.student_name}</td>
                  <td>{c.exam_title}</td>
                  <td>{c.score}%</td>
                  <td>
                    <span className={'badge ' + (c.revoked ? 'rejected' : 'approved')}>{c.revoked ? 'revoked' : 'valid'}</span>
                  </td>
                  <td>
                    <form action={setCertificateRevoked}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="revoked" value={c.revoked ? 'false' : 'true'} />
                      <button className="btn sm ghost" type="submit">
                        {c.revoked ? 'Restore' : 'Revoke'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
