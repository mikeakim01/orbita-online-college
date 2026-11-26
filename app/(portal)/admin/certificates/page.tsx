import Link from 'next/link';
import Icon from '@/components/Icon';
import ActionForm from '@/components/ActionForm';
import Pager from '@/components/Pager';
import { createAdminClient } from '@/lib/supabase/admin';
import { setCertificateRevoked } from '@/app/actions';
import { grantCertificate, updateCertificateDate } from '@/app/admin-actions';
import { people, pageOf, slice } from '@/lib/admin';
import { day } from '@/lib/portal';
import { STAGES, readResults } from '@/lib/results';

export const metadata = { title: 'Certificates (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminCertificates({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const page = pageOf(searchParams.page);
  const admin = createAdminClient();
  const [{ data }, { data: exams }, who] = await Promise.all([
    admin.from('certificates').select('*').order('issued_at', { ascending: false }).limit(1000),
    admin.from('exams').select('id, code, title').order('code'),
    people(),
  ]);
  const students = who.profs
    .map((p) => ({ id: p.id as string, name: ((p.full_name as string) || '').trim(), email: who.email.get(p.id as string) ?? '' }))
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  const nowLocal = new Date().toISOString().slice(0, 16);
  const rows = (data ?? []).filter((c) => !q || (c.serial + ' ' + c.student_name + ' ' + c.exam_title).toLowerCase().includes(q));
  const shown = slice(rows, page);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Certificates</span></p>
          <h1>Certificates</h1>
          <p className="muted" style={{ margin: 0 }}>A revoked certificate shows as revoked on its public verification page and cannot be downloaded.</p>
        </div>
      </div>

      <details className="card grant" open>
        <summary><Icon name="award" size={18} /> Grant a certificate</summary>
        <p className="muted small">Award a certificate directly, for example for a completed course. Choose the exact completion date and time that will be printed on it.</p>
        <ActionForm action={grantCertificate} success="Certificate granted" resetOnSuccess className="grant-form">
          <div className="grid g2">
            <div className="field">
              <label htmlFor="g-user">Student</label>
              <select id="g-user" name="user_id" required defaultValue="">
                <option value="" disabled>Choose a student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{(s.name || '(no name)') + (s.email ? ' - ' + s.email : '')}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-exam">Course or exam</label>
              <select id="g-exam" name="exam_id" required defaultValue="">
                <option value="" disabled>Choose an exam</option>
                {(exams ?? []).map((e) => <option key={e.id} value={e.id}>{e.code + ' - ' + e.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-title">Title on the certificate <span className="muted small">(optional)</span></label>
              <input id="g-title" name="title" maxLength={160} placeholder="Leave empty to use the exam title" />
            </div>
            <div className="field">
              <label htmlFor="g-score">Overall score (%) <span className="muted small">(optional)</span></label>
              <input id="g-score" name="score" type="number" min={0} max={100} placeholder="Defaults to the final exam score" />
            </div>
            <div className="field">
              <label htmlFor="g-when">Completion date and time</label>
              <input id="g-when" name="completed" type="datetime-local" max={nowLocal} defaultValue={nowLocal} required />
              <small className="muted">Date, year and time, in UTC.</small>
            </div>
          </div>
          <fieldset className="stages">
            <legend>Exam scores shown when the QR code is scanned <span className="muted small">(leave a box empty to skip it)</span></legend>
            <div className="stage-grid">
              {STAGES.map((s) => (
                <div className="field" key={s.key}>
                  <label htmlFor={'g-' + s.key}>{s.label} (%)</label>
                  <input id={'g-' + s.key} name={'r_' + s.key} type="number" min={0} max={100} inputMode="numeric" />
                </div>
              ))}
            </div>
          </fieldset>
          <button className="btn" type="submit"><Icon name="award" size={18} /> Grant certificate</button>
        </ActionForm>
      </details>

      <form className="card filters" action="/admin/certificates" role="search">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="cq">Search by ID, student or exam</label>
          <input id="cq" name="q" type="search" defaultValue={searchParams.q ?? ''} />
        </div>
        <button className="btn" type="submit"><Icon name="search" size={18} /> Search</button>
        {q && <Link className="btn ghost" href="/admin/certificates">Clear</Link>}
      </form>

      {shown.length ? (
        <div className="tablewrap">
          <table className="rtable">
            <thead><tr><th>ID</th><th>Student</th><th>Exam</th><th>Score</th><th>Completed</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td data-label="ID"><Link href={'/certificates/' + c.serial}>{c.serial}</Link></td>
                  <td data-label="Student">{c.student_name}</td>
                  <td data-label="Exam">{c.exam_title}</td>
                  <td data-label="Score">{c.score}%</td>
                  <td data-label="Completed">{day(c.issued_at)}<div className="muted small">{new Date(c.issued_at).toISOString().slice(11, 16)} UTC</div></td>
                  <td data-label="Status"><span className={'badge ' + (c.revoked ? 'rejected' : 'approved')}>{c.revoked ? 'revoked' : 'valid'}</span></td>
                  <td className="nolabel">
                    <details className="datefix">
                      <summary className="btn ghost sm">Edit</summary>
                      <ActionForm action={updateCertificateDate} success="Certificate updated" className="datefix-form">
                        <input type="hidden" name="id" value={c.id} />
                        <input name="completed" type="datetime-local" max={nowLocal} defaultValue={new Date(c.issued_at).toISOString().slice(0, 16)} required aria-label="Completion date and time" />
                        <div className="stage-grid">
                          {STAGES.map((s) => (
                            <label key={s.key} className="stage-mini">{s.label} (%)
                              <input name={'r_' + s.key} type="number" min={0} max={100} inputMode="numeric" defaultValue={readResults(c.results).find((r) => r.label === s.label)?.score ?? ''} />
                            </label>
                          ))}
                        </div>
                        <button className="btn sm" type="submit">Save</button>
                      </ActionForm>
                    </details>
                    {c.revoked ? (
                      <ActionForm action={setCertificateRevoked} success="Certificate restored">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="revoked" value="false" />
                        <button className="btn ghost sm" type="submit">Restore</button>
                      </ActionForm>
                    ) : (
                      <ActionForm action={setCertificateRevoked} success="Certificate revoked" confirm={{ title: 'Revoke this certificate?', body: 'Certificate ' + c.serial + ' will show as revoked on its verification page and can no longer be downloaded.', label: 'Revoke' }}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="revoked" value="true" />
                        <button className="btn danger sm" type="submit">Revoke</button>
                      </ActionForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>No certificates found</h3><p>Certificates appear here when students pass an exam.</p></div>
      )}
      <Pager base="/admin/certificates" page={page} total={rows.length} params={{ q: searchParams.q }} />
    </>
  );
}
