import Link from 'next/link';
import Icon from '@/components/Icon';
import { site } from '@/lib/site';
import { requireSession, day } from '@/lib/portal';

export const metadata = { title: 'Certificates' };
export const dynamic = 'force-dynamic';

export default async function Certificates() {
  const { supabase, user } = await requireSession('/certificates');
  const { data: certs } = await supabase.from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false });

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Certificates</span></p>
          <h1>Certificates</h1>
          <p className="muted" style={{ margin: 0 }}>Each certificate has an ID that anyone can check on the verification page.</p>
        </div>
      </div>

      {certs && certs.length ? (
        <div className="grid">
          {certs.map((c, i) => (
            <article className={'cert-card' + (i % 2 ? ' alt' : '') + (c.revoked ? ' revoked' : '')} key={c.id}>
              <div className="between">
                <span className="medal"><Icon name="star" size={26} /></span>
                <span className={'badge ' + (c.revoked ? 'rejected' : 'gold')}>{c.revoked ? 'Revoked' : 'Verified'}</span>
              </div>
              <div>
                <h3 style={{ marginBottom: 4 }}>{c.exam_title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{c.student_name}</p>
              </div>
              <dl className="facts">
                <div><dt>ID</dt><dd style={{ fontSize: 13 }}>{c.serial}</dd></div>
                <div><dt>Score</dt><dd>{c.score}%</dd></div>
                <div><dt>Issued</dt><dd>{day(c.issued_at)}</dd></div>
              </dl>
              <div className="row">
                {!c.revoked && <a className="btn gold sm" href={'/certificates/' + c.serial + '/pdf'}><Icon name="download" size={16} /> Download PDF</a>}
                <Link className="btn ghost sm" href={'/certificates/' + c.serial}><Icon name="external" size={16} /> Verification page</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>No certificates yet</h3>
          <p>Pass an exam to earn your first {site.short} certificate.</p>
          <Link className="btn" href="/exams">Go to exams</Link>
        </div>
      )}
    </>
  );
}
