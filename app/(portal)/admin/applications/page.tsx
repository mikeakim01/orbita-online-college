import Link from 'next/link';
import Icon from '@/components/Icon';
import ActionForm from '@/components/ActionForm';
import Pager from '@/components/Pager';
import { createAdminClient } from '@/lib/supabase/admin';
import { setApplicationStatus, setDocumentVerified, setDocsNote } from '@/app/actions';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';
import { people, pageOf, slice } from '@/lib/admin';
import { day } from '@/lib/portal';

export const metadata = { title: 'Applications (admin)' };
export const dynamic = 'force-dynamic';

const FILTERS = ['all', 'submitted', 'approved', 'rejected'];

export default async function AdminApplications({ searchParams }: { searchParams: { status?: string; q?: string; page?: string; blocked?: string } }) {
  const status = FILTERS.includes(searchParams.status ?? '') ? (searchParams.status as string) : 'all';
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const page = pageOf(searchParams.page);
  const admin = createAdminClient();
  const [{ data: all }, { data: docs }, who] = await Promise.all([
    admin.from('applications').select('*').order('created_at', { ascending: false }).limit(1000),
    admin.from('application_documents').select('id, application_id, doc_type, file_name, verified'),
    people(),
  ]);
  const D = docs ?? [];
  const missOf = (a: { id: string; level: string }) => (site.docRules ? missingFor(a.level, D.filter((d) => d.application_id === a.id).map((d) => d.doc_type as string)) : []);
  const count = (s: string) => (s === 'all' ? (all ?? []).length : (all ?? []).filter((a) => a.status === s).length);

  const rows = (all ?? []).filter(
    (a) =>
      (status === 'all' || a.status === status) &&
      (!q || [who.name.get(a.user_id), who.email.get(a.user_id), a.program, a.level].join(' ').toLowerCase().includes(q))
  );
  const shown = slice(rows, page);
  const blocked = (all ?? []).find((a) => a.id === searchParams.blocked);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Applications</span></p>
          <h1>Applications</h1>
        </div>
      </div>

      {blocked && (
        <p role="alert" className="alert">
          Not approved: {who.name.get(blocked.user_id) || 'this applicant'} is missing {missOf(blocked).map((m) => m.label).join(', ') || 'required documents'}. Use the message box to ask for them.
        </p>
      )}

      <form className="card filters" action="/admin/applications" role="search">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="aq">Search by name, email, program or level</label>
          <input id="aq" name="q" type="search" defaultValue={searchParams.q ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="as">Status</label>
          <select id="as" name="status" defaultValue={status}>
            {FILTERS.map((f) => (
              <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)} ({count(f)})</option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit"><Icon name="filter" size={18} /> Apply filters</button>
        {(q || status !== 'all') && <Link className="btn ghost" href="/admin/applications">Clear</Link>}
      </form>

      {shown.length ? (
        <div className="tablewrap">
          <table className="rtable">
            <thead>
              <tr><th>Applicant</th><th>Program</th><th>Status</th>{site.docRules && <th>Documents</th>}<th>Decision</th></tr>
            </thead>
            <tbody>
              {shown.map((a) => {
                const mine = D.filter((d) => d.application_id === a.id);
                const miss = missOf(a);
                const locked = a.status === 'approved';
                return (
                  <tr key={a.id} style={{ verticalAlign: 'top' }}>
                    <td data-label="Applicant">
                      <strong>{who.name.get(a.user_id) || '(no name)'}</strong>
                      <div className="muted small">{who.email.get(a.user_id)}</div>
                      <div className="muted small">Sent {day(a.created_at)}</div>
                    </td>
                    <td data-label="Program">
                      {a.program}
                      <div><span className="badge violet">{a.level}</span></div>
                      {a.statement && <details style={{ border: 0 }}><summary style={{ minHeight: 32, fontSize: 13 }}>Statement</summary><p className="small muted" style={{ whiteSpace: 'pre-wrap', maxWidth: 280 }}>{a.statement}</p></details>}
                    </td>
                    <td data-label="Status"><span className={'badge ' + a.status}>{a.status}</span></td>
                    {site.docRules && (
                      <td data-label="Documents" className="docbox">
                        {mine.map((d) => (
                          <div key={d.id} className="docrow">
                            <a href={'/documents/file/' + d.id} target="_blank" rel="noopener noreferrer">{slotsFor(a.level).find((s) => s.key === d.doc_type)?.label ?? d.doc_type}</a>
                            {d.verified && <span className="badge ok">verified</span>}
                            <ActionForm action={setDocumentVerified} success={d.verified ? 'Verification removed' : 'Document verified'}>
                              <input type="hidden" name="id" value={d.id} />
                              <input type="hidden" name="verified" value={d.verified ? 'false' : 'true'} />
                              <button className="btn ghost sm" type="submit">{d.verified ? 'Unverify' : 'Verify'}</button>
                            </ActionForm>
                          </div>
                        ))}
                        {miss.length > 0 && <span className="muted">Missing: {miss.map((m) => m.label).join(', ')}</span>}
                        {!mine.length && !miss.length && <span className="muted">None</span>}
                        {(miss.length > 0 || a.docs_note) && (
                          <ActionForm action={setDocsNote} success="Message saved" className="notefrm">
                            <input type="hidden" name="id" value={a.id} />
                            <label className="sr-only" htmlFor={'n-' + a.id}>Message to applicant</label>
                            <textarea id={'n-' + a.id} name="note" rows={3} maxLength={500} defaultValue={a.docs_note ?? 'Please upload: ' + miss.map((m) => m.label).join(', ') + '.'} />
                            <button className="btn ghost sm" type="submit">{a.docs_note ? 'Update or clear message' : 'Send request'}</button>
                          </ActionForm>
                        )}
                      </td>
                    )}
                    <td data-label="Decision">
                      <div className="row">
                        <ActionForm action={setApplicationStatus} success="Application approved">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button className="btn sm" type="submit" disabled={locked || miss.length > 0} title={miss.length ? 'Required documents are missing' : undefined}>Approve</button>
                        </ActionForm>
                        <ActionForm action={setApplicationStatus} success="Application rejected" confirm={{ title: 'Reject this application?', body: (who.name.get(a.user_id) || 'The applicant') + ' will see the application as rejected.', label: 'Reject' }}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button className="btn danger sm" type="submit" disabled={a.status === 'rejected'}>Reject</button>
                        </ActionForm>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>No applications found</h3><p>Try another filter or search.</p></div>
      )}
      <Pager base="/admin/applications" page={page} total={rows.length} params={{ q: searchParams.q, status: status === 'all' ? undefined : status }} />
    </>
  );
}
