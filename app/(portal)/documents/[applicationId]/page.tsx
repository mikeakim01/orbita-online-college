import Link from 'next/link';
import { notFound } from 'next/navigation';
import DocUploader from '@/components/DocUploader';
import { requireSession, day } from '@/lib/portal';
import { slotsFor, missingFor, MAX_BYTES, prettySize, type DocRow } from '@/lib/documents';

export const metadata = { title: 'Your documents' };
export const dynamic = 'force-dynamic';

export default async function Documents({ params }: { params: { applicationId: string } }) {
  const { supabase, user } = await requireSession('/documents/' + params.applicationId);
  const { data: app } = await supabase.from('applications').select('id, program, level, status, user_id, docs_note, created_at').eq('id', params.applicationId).maybeSingle();
  const slots = app ? slotsFor(app.level) : [];
  if (!app || app.user_id !== user.id || !slots.length) notFound();

  const { data: docs } = await supabase.from('application_documents').select('id, doc_type, file_name, size_bytes, created_at, verified').eq('application_id', app.id).order('created_at');
  const rows = (docs ?? []) as DocRow[];
  const missing = missingFor(app.level, rows.map((d) => d.doc_type));
  const locked = app.status !== 'submitted';
  const required = slots.filter((s) => s.required).length;
  const done = required - missing.length;

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <Link href="/applications">My applications</Link> / <Link href={'/applications/' + app.id}>Details</Link> / <span>Documents</span></p>
          <h1>Your documents</h1>
          <p className="muted" style={{ margin: 0 }}>{app.program} &middot; {app.level} &middot; sent {day(app.created_at)} &middot; <span className={'badge ' + app.status}>{app.status}</span></p>
        </div>
      </div>

      <div className="narrow-doc stack">
        {app.docs_note && (
          <p role="status" className="okmsg warn" style={{ margin: 0 }}>
            <strong>Message from admissions:</strong> {app.docs_note}
          </p>
        )}
        <div className="card">
          <div className="between small"><strong>{missing.length ? 'Still needed: ' + missing.map((m) => m.label).join(', ') : 'All required documents are uploaded'}</strong><span className="muted">{done} of {required}</span></div>
          <div className="progress" style={{ margin: '10px 0' }} role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={required}><span style={{ width: (required ? (done / required) * 100 : 100) + '%' }} /></div>
          <p className="muted small" style={{ margin: 0 }}>
            PDF, JPG or PNG, up to {prettySize(MAX_BYTES)} each. Only you and the admissions team can open your files.
            {locked && ' Your application has been decided, so uploads are closed. Contact admissions if something needs to change.'}
          </p>
        </div>
        <DocUploader applicationId={app.id} userId={user.id} slots={slots} docs={rows} locked={locked} />
      </div>
    </>
  );
}
