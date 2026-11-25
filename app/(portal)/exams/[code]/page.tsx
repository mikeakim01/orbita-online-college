import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';
import ExamForm from '@/components/ExamForm';
import { requireSession } from '@/lib/portal';

export const dynamic = 'force-dynamic';

export default async function ExamPage({ params }: { params: { code: string } }) {
  const { supabase, user } = await requireSession('/exams/' + params.code);
  const { data: exam } = await supabase.from('exams').select('*').eq('code', params.code).single();
  if (!exam) notFound();

  const { data: apps } = await supabase.from('applications').select('program').eq('user_id', user.id).eq('status', 'approved');
  const allowed = (apps ?? []).some((a) => a.program === exam.program || (site.programAccess[a.program] ?? []).includes(exam.program));

  const crumbs = (
    <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <Link href="/exams">Exams</Link> / <span>{exam.code}</span></p>
  );

  if (!allowed) {
    return (
      <>
        <div>{crumbs}<h1>{exam.title}</h1></div>
        <div className="card verify" role="alert">
          <div className="seal bad"><Icon name="lock" size={34} /></div>
          <h2>This exam is locked</h2>
          <p className="muted">It opens when your application for {exam.program} is approved.</p>
          <p style={{ margin: 0 }}><Link className="btn" href="/applications">View my applications</Link></p>
        </div>
      </>
    );
  }

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('exam_id', exam.id).gte('created_at', since);
  const attemptsLeft = Math.max(0, 3 - (count ?? 0));

  // Correct answers are never sent to the browser.
  const { data: qs } = await createAdminClient().from('questions').select('id, position, prompt, options').eq('exam_id', exam.id).order('position');

  return (
    <>
      <div>
        {crumbs}
        <h1>{exam.title}</h1>
        <p className="muted" style={{ margin: 0 }}>{exam.description}</p>
      </div>
      <ExamForm
        code={exam.code}
        minutes={exam.duration_min}
        passMark={exam.pass_mark}
        attemptsLeft={attemptsLeft}
        questions={(qs ?? []).map((q) => ({ id: q.id, prompt: q.prompt, options: q.options as string[] }))}
      />
    </>
  );
}
