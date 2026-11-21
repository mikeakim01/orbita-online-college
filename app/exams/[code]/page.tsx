import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';
import ExamForm from '@/components/ExamForm';

export const dynamic = 'force-dynamic';

export default async function ExamPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/exams/' + params.code);

  const { data: exam } = await supabase.from('exams').select('*').eq('code', params.code).single();
  if (!exam) notFound();

  const { data: apps } = await supabase
    .from('applications')
    .select('program')
    .eq('user_id', user.id)
    .eq('status', 'approved');
  const allowed = (apps ?? []).some(
    (a) => a.program === exam.program || (site.programAccess[a.program] ?? []).includes(exam.program)
  );

  if (!allowed) {
    return (
      <section className="section narrow">
        <div className="container">
          <h1>{exam.title}</h1>
          <p className="alert" role="alert">
            This exam opens when your application for {exam.program} is approved.
          </p>
          <Link href="/dashboard">Back to dashboard</Link>
        </div>
      </section>
    );
  }

  // Correct answers are never sent to the browser.
  const { data: qs } = await createAdminClient()
    .from('questions')
    .select('id, position, prompt, options')
    .eq('exam_id', exam.id)
    .order('position');

  return (
    <section className="section narrow">
      <div className="container">
        <p className="muted">{exam.code}</p>
        <h1>{exam.title}</h1>
        <p className="lead">
          {exam.description} You have {exam.duration_min} minutes. Pass mark {exam.pass_mark}%. You can attempt this exam 3 times
          every 24 hours.
        </p>
        <ExamForm
          code={exam.code}
          minutes={exam.duration_min}
          passMark={exam.pass_mark}
          questions={(qs ?? []).map((q) => ({ id: q.id, prompt: q.prompt, options: q.options as string[] }))}
        />
      </div>
    </section>
  );
}
