import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify certificate' };

export default async function Verify({ params }: { params: { serial: string } }) {
  const serial = decodeURIComponent(params.serial).toUpperCase();
  const { data: c } = await createAdminClient()
    .from('certificates')
    .select('serial, student_name, exam_title, score, issued_at, revoked')
    .eq('serial', serial)
    .maybeSingle();

  return (
    <section className="section narrow">
      <div className="container">
        <h1>Certificate verification</h1>
        {!c ? (
          <div className="card" role="alert">
            <h2>Not found</h2>
            <p>No certificate with the ID <strong>{serial}</strong> was issued by this institution. Check the ID and try again.</p>
          </div>
        ) : (
          <div className="card">
            <p>
              <span className={'badge ' + (c.revoked ? 'rejected' : 'approved')}>{c.revoked ? 'Revoked' : 'Valid'}</span>
            </p>
            <h2>{c.student_name}</h2>
            <p>{c.exam_title}</p>
            <dl className="facts">
              <div><dt>Certificate ID</dt><dd>{c.serial}</dd></div>
              <div><dt>Score</dt><dd>{c.score}%</dd></div>
              <div><dt>Issued</dt><dd>{new Date(c.issued_at).toISOString().slice(0, 10)}</dd></div>
            </dl>
            {!c.revoked && (
              <p>
                <a className="btn" href={'/certificates/' + c.serial + '/pdf'}>
                  Download PDF
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
