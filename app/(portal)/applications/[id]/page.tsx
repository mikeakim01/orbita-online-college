import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon, { ProgramIcon } from '@/components/Icon';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';
import { requireSession, day } from '@/lib/portal';

export const metadata = { title: 'Application' };
export const dynamic = 'force-dynamic';

export default async function ApplicationDetail({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireSession('/applications/' + params.id);
  const { data: a } = await supabase.from('applications').select('*').eq('id', params.id).eq('user_id', user.id).maybeSingle();
  if (!a) notFound();

  const { data: docs } = await supabase.from('application_documents').select('id, doc_type, file_name, verified').eq('application_id', a.id);
  const rules = slotsFor(a.level);
  const miss = missingFor(a.level, (docs ?? []).map((d) => d.doc_type as string));
  const prog = site.programs.find((p) => p.name === a.program);
  const level = site.levels.find((l) => l.name === a.level);
  const course = /^Course: (.+)$/m.exec(a.statement ?? '')?.[1];
  const statement = (a.statement ?? '').replace(/^Course: .+\n?/m, '').trim();

  // Progress through the four stages. A rejected application stops at the review stage.
  const stage = a.status === 'submitted' ? (rules.length && miss.length ? 1 : 2) : 3;
  const steps = ['Sent', 'Documents', 'Review', a.status === 'rejected' ? 'Decision' : 'Approved'];

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <Link href="/applications">My applications</Link> / <span>Details</span></p>
          <h1>{a.program}</h1>
        </div>
        <span className={'badge ' + a.status} style={{ fontSize: 14 }}>{a.status}</span>
      </div>

      <section className="card" aria-label="Progress">
        <ol className="stepper">
          {steps.map((s, i) => {
            const cls = i < stage || (i === 3 && a.status === 'approved') ? 'done' : i === stage ? (a.status === 'rejected' && i === 3 ? 'bad' : 'now') : '';
            return <li key={s} className={cls} aria-current={i === stage ? 'step' : undefined}>{s}</li>;
          })}
        </ol>
      </section>

      <div className="g21">
        <div className="stack">
          <section className="card">
            <div className="row" style={{ marginBottom: 14 }}>
              <ProgramIcon slug={prog?.slug} size={22} />
              <div><h2 style={{ margin: 0, fontSize: 20 }}>{a.program}</h2><span className="muted small">{prog?.native}</span></div>
            </div>
            <dl className="facts">
              <div><dt>Level</dt><dd>{a.level}</dd></div>
              <div><dt>Sent</dt><dd>{day(a.created_at)}</dd></div>
              <div><dt>Duration</dt><dd>{level?.duration ?? '-'}</dd></div>
              <div><dt>Entry requirement</dt><dd>{level?.entry ?? '-'}</dd></div>
              {course && <div><dt>Course</dt><dd>{course}</dd></div>}
            </dl>
            {statement && (
              <>
                <h3 className="sub1">Your statement</h3>
                <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{statement}</p>
              </>
            )}
          </section>

          <section className="card">
            <div className="between"><h2 style={{ fontSize: 20, margin: 0 }}>Documents</h2>{rules.length > 0 && <Link className="btn sm" href={'/documents/' + a.id}><Icon name="upload" size={16} /> {a.status === 'submitted' ? 'Upload' : 'View'}</Link>}</div>
            {rules.length ? (
              <ul className="list" style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
                {rules.map((r) => {
                  const d = (docs ?? []).find((x) => x.doc_type === r.key);
                  return (
                    <li key={r.key}>
                      <span className={'nt ' + (d ? 'ok' : r.required ? 'warn' : '')}><Icon name={d ? 'check' : 'file'} size={18} /></span>
                      <div className="grow"><strong>{r.label}</strong><div className="muted small">{d ? d.file_name : r.required ? 'Required' : 'Optional'}</div></div>
                      {d?.verified && <span className="badge ok">verified</span>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted" style={{ margin: '12px 0 0' }}>No documents are needed for this application.</p>
            )}
          </section>
        </div>

        <aside className="stack">
          {a.docs_note && (
            <div className="card" style={{ borderColor: 'rgba(245,185,66,.5)' }}>
              <h3><Icon name="mail" size={18} /> Message from admissions</h3>
              <p style={{ margin: 0 }}>{a.docs_note}</p>
            </div>
          )}
          <div className="card">
            <h3>What happens next</h3>
            <p className="muted" style={{ margin: 0 }}>
              {a.status === 'approved'
                ? 'Your application is approved. Your exams are open on the Exams page.'
                : a.status === 'rejected'
                  ? 'This application was not approved. Contact admissions if you would like to talk it through.'
                  : miss.length
                    ? 'Upload the missing required documents so admissions can review your application.'
                    : 'Admissions is reviewing your application. You will see the decision here.'}
            </p>
            {a.status === 'approved' && <p style={{ marginTop: 14, marginBottom: 0 }}><Link className="btn sm" href="/exams">Go to exams</Link></p>}
          </div>
        </aside>
      </div>
    </>
  );
}
