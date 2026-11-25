import Link from 'next/link';
import ActionForm from '@/components/ActionForm';
import Pager from '@/components/Pager';
import { createAdminClient } from '@/lib/supabase/admin';
import { setDocumentVerified } from '@/app/actions';
import { slotsFor, prettySize } from '@/lib/documents';
import { people, pageOf, slice } from '@/lib/admin';
import { day } from '@/lib/portal';

export const metadata = { title: 'Document verification' };
export const dynamic = 'force-dynamic';

export default async function AdminDocuments({ searchParams }: { searchParams: { show?: string; page?: string } }) {
  const show = searchParams.show === 'verified' ? 'verified' : 'pending';
  const page = pageOf(searchParams.page);
  const admin = createAdminClient();
  const [{ data: docs }, { data: apps }, who] = await Promise.all([
    admin.from('application_documents').select('id, application_id, user_id, doc_type, file_name, size_bytes, created_at, verified').order('created_at', { ascending: false }).limit(1000),
    admin.from('applications').select('id, program, level, status'),
    people(),
  ]);
  const app = new Map((apps ?? []).map((a) => [a.id as string, a]));
  const all = docs ?? [];
  const rows = all.filter((d) => (show === 'verified' ? d.verified : !d.verified));
  const shown = slice(rows, page);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Documents</span></p>
          <h1>Document verification</h1>
          <p className="muted" style={{ margin: 0 }}>Open each file, check it, then mark it verified.</p>
        </div>
      </div>

      <div className="tabs" role="group" aria-label="Show">
        <Link className={'btn sm ' + (show === 'pending' ? '' : 'ghost')} href="/admin/documents">To verify ({all.filter((d) => !d.verified).length})</Link>
        <Link className={'btn sm ' + (show === 'verified' ? '' : 'ghost')} href="/admin/documents?show=verified">Verified ({all.filter((d) => d.verified).length})</Link>
      </div>

      {shown.length ? (
        <div className="tablewrap">
          <table className="rtable">
            <thead><tr><th>Applicant</th><th>Document</th><th>Application</th><th>Uploaded</th><th /></tr></thead>
            <tbody>
              {shown.map((d) => {
                const a = app.get(d.application_id);
                return (
                  <tr key={d.id}>
                    <td data-label="Applicant"><strong>{who.name.get(d.user_id) || '(no name)'}</strong><div className="muted small">{who.email.get(d.user_id)}</div></td>
                    <td data-label="Document">
                      <a href={'/documents/file/' + d.id} target="_blank" rel="noopener noreferrer">{a ? slotsFor(a.level).find((s) => s.key === d.doc_type)?.label ?? d.doc_type : d.doc_type}</a>
                      <div className="muted small">{d.file_name} &middot; {prettySize(d.size_bytes)}</div>
                    </td>
                    <td data-label="Application">{a ? <>{a.program} <span className="badge violet">{a.level}</span> <span className={'badge ' + a.status}>{a.status}</span></> : '-'}</td>
                    <td data-label="Uploaded">{day(d.created_at)}</td>
                    <td className="nolabel">
                      <ActionForm action={setDocumentVerified} success={d.verified ? 'Verification removed' : 'Document verified'}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="verified" value={d.verified ? 'false' : 'true'} />
                        <button className={'btn sm ' + (d.verified ? 'ghost' : '')} type="submit">{d.verified ? 'Unverify' : 'Verify'}</button>
                      </ActionForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>{show === 'pending' ? 'Nothing to verify' : 'No verified documents yet'}</h3><p>{show === 'pending' ? 'Every uploaded document has been checked.' : 'Verified documents will be listed here.'}</p></div>
      )}
      <Pager base="/admin/documents" page={page} total={rows.length} params={{ show: show === 'verified' ? 'verified' : undefined }} />
    </>
  );
}
