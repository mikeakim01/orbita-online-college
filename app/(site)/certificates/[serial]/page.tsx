import Icon from '@/components/Icon';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify a certificate' };

export default async function Verify({ params }: { params: { serial: string } }) {
  const serial = decodeURIComponent(params.serial).toUpperCase();
  const { data: c } = await createAdminClient()
    .from('certificates')
    .select('serial, student_name, exam_title, score, issued_at, revoked')
    .eq('serial', serial)
    .maybeSingle();

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <p className="kicker">Certificate verification</p>
      {!c ? (
        <div className="card verify" role="alert">
          <div className="seal bad"><Icon name="alert" size={36} /></div>
          <h1>Not found</h1>
          <p className="muted">
            No certificate with the ID <strong>{serial}</strong> was issued by {site.name}. Check the ID and try again.
          </p>
        </div>
      ) : (
        <div className="card verify" style={{ borderColor: c.revoked ? undefined : 'rgba(245,185,66,.5)' }}>
          <div className={'seal' + (c.revoked ? ' bad' : '')}>
            <Icon name={c.revoked ? 'alert' : 'award'} size={38} />
          </div>
          <span className={'badge ' + (c.revoked ? 'rejected' : 'gold')}>{c.revoked ? 'Revoked' : 'Verified by ' + site.short}</span>
          <h1 style={{ marginTop: 14 }}>{c.student_name}</h1>
          <p className="lead" style={{ margin: '0 auto 20px' }}>{c.exam_title}</p>
          <dl className="facts" style={{ textAlign: 'left' }}>
            <div><dt>Certificate ID</dt><dd>{c.serial}</dd></div>
            <div><dt>Score</dt><dd>{c.score}%</dd></div>
            <div><dt>Issued</dt><dd>{new Date(c.issued_at).toISOString().slice(0, 10)}</dd></div>
          </dl>
          {!c.revoked && (
            <p style={{ marginTop: 22 }}>
              <a className="btn gold" href={'/certificates/' + c.serial + '/pdf'}>
                <Icon name="download" size={18} /> Download PDF
              </a>
            </p>
          )}
          {site.disclaimer && <p className="muted small" style={{ margin: 0 }}>{site.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}
