import Link from 'next/link';
import Icon from '@/components/Icon';
import Pager from '@/components/Pager';
import { createAdminClient } from '@/lib/supabase/admin';
import { people, pageOf, slice } from '@/lib/admin';
import { day } from '@/lib/portal';

export const metadata = { title: 'Students (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminStudents({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const page = pageOf(searchParams.page);
  const admin = createAdminClient();
  const [who, { data: apps }, { data: certs }] = await Promise.all([
    people(),
    admin.from('applications').select('user_id, status'),
    admin.from('certificates').select('user_id, revoked'),
  ]);
  const rows = who.profs
    .map((p) => ({
      id: p.id as string,
      name: (p.full_name as string) || '',
      role: p.role as string,
      created: p.created_at as string,
      email: who.email.get(p.id as string) ?? '',
      apps: (apps ?? []).filter((a) => a.user_id === p.id).length,
      approved: (apps ?? []).filter((a) => a.user_id === p.id && a.status === 'approved').length,
      certs: (certs ?? []).filter((c) => c.user_id === p.id && !c.revoked).length,
    }))
    .filter((r) => !q || (r.name + ' ' + r.email).toLowerCase().includes(q))
    .sort((a, b) => (a.created < b.created ? 1 : -1));
  const shown = slice(rows, page);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Students</span></p>
          <h1>Students</h1>
          <p className="muted" style={{ margin: 0 }}>{rows.length} account{rows.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <form className="card filters" action="/admin/students" role="search">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="sq">Search by name or email</label>
          <input id="sq" name="q" type="search" defaultValue={searchParams.q ?? ''} />
        </div>
        <button className="btn" type="submit"><Icon name="search" size={18} /> Search</button>
        {q && <Link className="btn ghost" href="/admin/students">Clear</Link>}
      </form>

      {shown.length ? (
        <div className="tablewrap">
          <table className="rtable">
            <thead><tr><th>Student</th><th>Role</th><th>Applications</th><th>Approved</th><th>Certificates</th><th>Joined</th><th /></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td data-label="Student"><strong>{r.name || '(no name)'}</strong><div className="muted small">{r.email}</div></td>
                  <td data-label="Role"><span className={'badge ' + (r.role === 'admin' ? 'gold' : 'violet')}>{r.role}</span></td>
                  <td data-label="Applications">{r.apps}</td>
                  <td data-label="Approved">{r.approved}</td>
                  <td data-label="Certificates">{r.certs}</td>
                  <td data-label="Joined">{day(r.created)}</td>
                  <td className="nolabel"><Link className="btn ghost sm" href={'/admin/applications?q=' + encodeURIComponent(r.email)}>Applications</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>No students found</h3><p>Try a different search.</p></div>
      )}
      <Pager base="/admin/students" page={page} total={rows.length} params={{ q: searchParams.q }} />
    </>
  );
}
