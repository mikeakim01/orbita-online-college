import Link from 'next/link';
import Icon, { ProgramIcon } from '@/components/Icon';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';
import { requireSession, day } from '@/lib/portal';

export const metadata = { title: 'My applications' };
export const dynamic = 'force-dynamic';

const FILTERS = ['all', 'submitted', 'approved', 'rejected'];

export default async function Applications({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase, user } = await requireSession('/applications');
  const status = FILTERS.includes(searchParams.status ?? '') ? (searchParams.status as string) : 'all';
  const { data: all } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const ids = (all ?? []).map((a) => a.id as string);
  const docRows = ids.length ? ((await supabase.from('application_documents').select('application_id, doc_type').in('application_id', ids)).data ?? []) : [];
  const apps = (all ?? []).filter((a) => status === 'all' || a.status === status);
  const count = (s: string) => (s === 'all' ? all?.length ?? 0 : (all ?? []).filter((a) => a.status === s).length);

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>My applications</span></p>
          <h1>My applications</h1>
        </div>
        <Link className="btn" href="/apply"><Icon name="plus" size={18} /> New application</Link>
      </div>

      <div className="tabs" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link key={f} href={f === 'all' ? '/applications' : '/applications?status=' + f} className={'btn sm ' + (status === f ? '' : 'ghost')} aria-current={status === f ? 'true' : undefined}>
            {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)} ({count(f)})
          </Link>
        ))}
      </div>

      {apps.length ? (
        <div className="grid">
          {apps.map((a) => {
            const slug = site.programs.find((p) => p.name === a.program)?.slug;
            const rules = slotsFor(a.level);
            const miss = rules.length ? missingFor(a.level, docRows.filter((d) => d.application_id === a.id).map((d) => d.doc_type as string)) : [];
            const required = rules.filter((r) => r.required).length;
            const done = required - miss.length;
            return (
              <article className="card prog-card" key={a.id}>
                <div className="between">
                  <ProgramIcon slug={slug} size={22} />
                  <span className={'badge ' + a.status}>{a.status}</span>
                </div>
                <h3>{a.program}</h3>
                <div className="meta"><span className="badge violet">{a.level}</span><span className="badge">Sent {day(a.created_at)}</span></div>
                {rules.length > 0 && (
                  <div>
                    <div className="between small muted"><span>Required documents</span><span>{done} of {required}</span></div>
                    <div className="progress" style={{ marginTop: 6 }} role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={required}><span style={{ width: (required ? (done / required) * 100 : 100) + '%' }} /></div>
                  </div>
                )}
                {a.docs_note && <p className="notebox" style={{ margin: 0 }}><strong>Admissions:</strong> {a.docs_note}</p>}
                <div className="row">
                  <Link className="btn sm" href={'/applications/' + a.id}>View details</Link>
                  {rules.length > 0 && <Link className="btn ghost sm" href={'/documents/' + a.id}>{a.status === 'submitted' ? 'Upload documents' : 'View documents'}</Link>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h3>{all?.length ? 'No applications with that status' : 'No applications yet'}</h3>
          <p>{all?.length ? 'Try another filter.' : 'Choose a faculty and send your first application.'}</p>
          <Link className="btn" href="/apply">Start an application</Link>
        </div>
      )}
    </>
  );
}
