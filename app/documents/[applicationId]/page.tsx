import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DocUploader from '@/components/DocUploader';
import { slotsFor, missingFor, MAX_BYTES, prettySize, type DocRow } from '@/lib/documents';

export const metadata = { title: 'Your documents' };
export const dynamic = 'force-dynamic';

export default async function Documents({ params, searchParams }: { params: { applicationId: string }; searchParams: { applied?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/documents/' + params.applicationId);

  const { data: app } = await supabase.from('applications').select('id, program, level, status, user_id').eq('id', params.applicationId).maybeSingle();
  const slots = app ? slotsFor(app.level) : [];
  if (!app || app.user_id !== user.id || !slots.length) notFound();

  const { data: docs } = await supabase.from('application_documents').select('id, doc_type, file_name, size_bytes, created_at').eq('application_id', app.id).order('created_at');
  const rows = (docs ?? []) as DocRow[];
  const missing = missingFor(app.level, rows.map((d) => d.doc_type));
  const locked = app.status !== 'submitted';

  return (
    <section className="section">
      <div className="container narrow-doc">
        <p className="muted small"><Link href="/dashboard">&larr; Back to dashboard</Link></p>
        <h1>Your documents</h1>
        <p className="lead">{app.program} &middot; {app.level} &middot; <span className={'badge ' + app.status}>{app.status}</span></p>
        {searchParams.applied && <p role="status" className="okmsg">Application received. Upload your documents below so we can review it.</p>}
        {missing.length > 0 ? (
          <p role="status" className="okmsg warn">Still needed: {missing.map((m) => m.label).join(', ')}.</p>
        ) : (
          <p role="status" className="okmsg">All required documents are uploaded. An admissions officer will review your application.</p>
        )}
        <p className="muted small">PDF, JPG or PNG, up to {prettySize(MAX_BYTES)} each. Only you and the admissions team can open your files.{locked && ' Your application has been decided, so uploads are closed. Contact admissions if something needs to change.'}</p>
        <DocUploader applicationId={app.id} userId={user.id} slots={slots} docs={rows} locked={locked} />
      </div>
    </section>
  );
}
