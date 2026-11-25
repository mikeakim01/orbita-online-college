import Link from 'next/link';
import Icon, { ProgramIcon } from '@/components/Icon';
import EarthBanner from '@/components/EarthBanner';
import { site } from '@/lib/site';
import { slotsFor, missingFor } from '@/lib/documents';
import { requireSession, getNotices, day } from '@/lib/portal';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const slugOf = (program: string) => site.programs.find((p) => p.name === program)?.slug;

export default async function Dashboard() {
  const { supabase, user, name, role } = await requireSession('/dashboard');
  const [{ data: apps }, { data: certs }, { data: exams }, notices] = await Promise.all([
    supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
    supabase.from('exams').select('*').order('code'),
    getNotices(supabase, user.id),
  ]);
  const ids = (apps ?? []).map((a) => a.id as string);
  const docRows = ids.length ? ((await supabase.from('application_documents').select('application_id, doc_type').in('application_id', ids)).data ?? []) : [];
  const missingOf = (a: { id: string; level: string }) => missingFor(a.level, docRows.filter((d) => d.application_id === a.id).map((d) => d.doc_type as string));

  const approved = (apps ?? []).filter((a) => a.status === 'approved').map((a) => a.program as string);
  const open = (exams ?? []).filter((e) => approved.some((p) => p === e.program || (site.programAccess[p] ?? []).includes(e.program)));
  const first = (name || user.email || 'there').split(/[\s@]/)[0];
  const outstanding = (apps ?? []).filter((a) => a.status === 'submitted' && slotsFor(a.level).length && missingOf(a).length);
  const messages = (apps ?? []).filter((a) => a.docs_note);
  const validCerts = (certs ?? []).filter((c) => !c.revoked);

  return (
    <>
      <section className="welcome" aria-label="Welcome">
        <EarthBanner className="earth" />
        <div className="copy">
          <h1>Welcome, {first}</h1>
          <p style={{ color: '#d6defa' }}>Access your applications, take exams and manage your certificates all in one place.</p>
          <div className="row">
            {role === 'admin' ? (
              <Link className="btn" href="/admin">
                <Icon name="rocket" size={18} /> Open admin panel <Icon name="arrow" size={16} />
              </Link>
            ) : (
              <Link className="btn" href="/apply">
                <Icon name="plus" size={18} /> New application
              </Link>
            )}
            <Link className="btn ghost" href="/programs">
              Browse programs
            </Link>
          </div>
        </div>
      </section>

      <section className="g4" aria-label="Summary">
        <div className="tile"><span className="ico blue"><Icon name="grid" /></span><div><b>{apps?.length ?? 0}</b><span>Applications</span></div></div>
        <div className="tile"><span className="ico cyan"><Icon name="check" /></span><div><b>{approved.length}</b><span>Approved</span></div></div>
        <div className="tile"><span className="ico"><Icon name="file" /></span><div><b>{open.length}</b><span>Exams open</span></div></div>
        <div className="tile"><span className="ico gold"><Icon name="award" /></span><div><b>{validCerts.length}</b><span>Certificates</span></div></div>
      </section>

      <section aria-labelledby="h-apps">
        <div className="sec-title">
          <h2 id="h-apps"><Icon name="grid" /> Your applications</h2>
          <Link href="/applications">View all &rarr;</Link>
        </div>
        {apps && apps.length ? (
          <div className="tablewrap">
            <table className="rtable">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Documents</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map((a) => {
                  const miss = slotsFor(a.level).length ? missingOf(a) : null;
                  return (
                    <tr key={a.id}>
                      <td data-label="Program"><span className="progname"><ProgramIcon slug={slugOf(a.program)} />{a.program}</span></td>
                      <td data-label="Level"><span className="badge violet">{a.level}</span></td>
                      <td data-label="Status"><span className={'badge ' + a.status}>{a.status}</span></td>
                      <td data-label="Sent">{day(a.created_at)}</td>
                      <td data-label="Documents">
                        {miss === null ? <span className="muted">None needed</span> : miss.length ? <Link href={'/documents/' + a.id}>{miss.length} still needed</Link> : <span className="badge ok">Complete</span>}
                      </td>
                      <td className="nolabel"><Link className="btn ghost sm" href={'/applications/' + a.id}>View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <h3>No applications yet</h3>
            <p>Choose a faculty and send your first application.</p>
            <Link className="btn" href="/apply">Start an application</Link>
          </div>
        )}
      </section>

      <div className="g2" style={{ alignItems: 'start' }}>
        <section aria-labelledby="h-ex">
          <div className="sec-title">
            <h2 id="h-ex"><Icon name="book" /> Exams</h2>
            <Link href="/exams">View all &rarr;</Link>
          </div>
          {open.length ? (
            <div className="stack">
              {open.slice(0, 2).map((e) => (
                <div className={'exam-card' + (slugOf(e.program) === 'satellite' ? ' cyan' : '')} key={e.id}>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <ProgramIcon slug={slugOf(e.program)} size={22} />
                    <div>
                      <h3 style={{ margin: 0 }}>{e.title}</h3>
                      <span className="muted small"><Icon name="clock" size={14} /> {e.code} &middot; {e.duration_min} min &middot; pass mark {e.pass_mark}%</span>
                    </div>
                  </div>
                  <div><Link className={'btn sm ' + (slugOf(e.program) === 'satellite' ? 'cyan' : '')} href={'/exams/' + e.code}>Take exam <Icon name="arrow" size={16} /></Link></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty"><h3>No exams yet</h3><p>Exams unlock when an application is approved.</p></div>
          )}
        </section>

        <section aria-labelledby="h-ce">
          <div className="sec-title">
            <h2 id="h-ce"><Icon name="award" /> Certificates</h2>
            <Link href="/certificates">View all &rarr;</Link>
          </div>
          {certs && certs.length ? (
            <div className="stack">
              {certs.slice(0, 2).map((c, i) => (
                <div className={'cert-card' + (i % 2 ? ' alt' : '') + (c.revoked ? ' revoked' : '')} key={c.id}>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <span className="medal"><Icon name="star" size={26} /></span>
                    <div>
                      <h3 style={{ margin: 0 }}>{c.exam_title}</h3>
                      <span className="muted small">{c.serial} &middot; {c.score}% {c.revoked ? '(revoked)' : ''}</span>
                    </div>
                  </div>
                  <div><Link className="btn gold sm" href={'/certificates/' + c.serial}>View and download <Icon name="download" size={16} /></Link></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty"><h3>No certificates yet</h3><p>Pass an exam to earn your first certificate.</p></div>
          )}
        </section>
      </div>

      <div className="g2" style={{ alignItems: 'start' }}>
        <section className="card" aria-labelledby="h-todo">
          <h2 id="h-todo" style={{ fontSize: 19 }}>Needs your attention</h2>
          {outstanding.length || messages.length ? (
            <div className="list">
              {messages.map((a) => (
                <div key={'m' + a.id}>
                  <span className="nt warn"><Icon name="mail" size={18} /></span>
                  <div className="grow"><strong>Message from admissions</strong><div className="muted small">{a.docs_note}</div></div>
                  <Link className="btn ghost sm" href={'/documents/' + a.id}>Open</Link>
                </div>
              ))}
              {outstanding.map((a) => (
                <div key={'d' + a.id}>
                  <span className="nt warn"><Icon name="upload" size={18} /></span>
                  <div className="grow"><strong>{a.program} ({a.level})</strong><div className="muted small">Still needed: {missingOf(a).map((m) => m.label).join(', ')}</div></div>
                  <Link className="btn ghost sm" href={'/documents/' + a.id}>Upload</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Nothing to do right now. You are all caught up.</p>
          )}
        </section>

        <section className="card" aria-labelledby="h-act">
          <div className="between"><h2 id="h-act" style={{ fontSize: 19 }}>Recent activity</h2><Link href="/notifications">All activity</Link></div>
          {notices.length ? (
            <div className="list">
              {notices.slice(0, 5).map((n) => (
                <div key={n.id}>
                  <span className={'nt ' + (n.kind === 'info' ? '' : n.kind)}><Icon name={n.icon} size={18} /></span>
                  <div className="grow"><strong>{n.title}</strong><div className="muted small">{day(n.at)}</div></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Your activity will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}
