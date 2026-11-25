import Link from 'next/link';
import Icon from '@/components/Icon';
import ActionForm from '@/components/ActionForm';
import Pager from '@/components/Pager';
import { createAdminClient } from '@/lib/supabase/admin';
import { setCertificateRevoked } from '@/app/actions';
import { pageOf, slice } from '@/lib/admin';
import { day } from '@/lib/portal';

export const metadata = { title: 'Certificates (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminCertificates({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const page = pageOf(searchParams.page);
  const { data } = await createAdminClient().from('certificates').select('*').order('issued_at', { ascending: false }).limit(1000);
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
            <thead><tr><th>ID</th><th>Student</th><th>Exam</th><th>Score</th><th>Issued</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td data-label="ID"><Link href={'/certificates/' + c.serial}>{c.serial}</Link></td>
                  <td data-label="Student">{c.student_name}</td>
                  <td data-label="Exam">{c.exam_title}</td>
                  <td data-label="Score">{c.score}%</td>
                  <td data-label="Issued">{day(c.issued_at)}</td>
                  <td data-label="Status"><span className={'badge ' + (c.revoked ? 'rejected' : 'approved')}>{c.revoked ? 'revoked' : 'valid'}</span></td>
                  <td className="nolabel">
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
