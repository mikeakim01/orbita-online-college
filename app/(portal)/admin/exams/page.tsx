import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Exams (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminExams() {
  const admin = createAdminClient();
  const [{ data: exams }, { data: qs }, { data: attempts }] = await Promise.all([
    admin.from('exams').select('*').order('code'),
    admin.from('questions').select('exam_id'),
    admin.from('attempts').select('exam_id, passed'),
  ]);
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Exams</span></p>
          <h1>Exams</h1>
          <p className="muted" style={{ margin: 0 }}>Exams and questions are loaded from <code>supabase/seed.sql</code>. Answers are never shown here or sent to browsers.</p>
        </div>
      </div>
      {exams && exams.length ? (
        <div className="tablewrap">
          <table className="rtable">
            <thead><tr><th>Code</th><th>Exam</th><th>Faculty</th><th>Questions</th><th>Time</th><th>Pass mark</th><th>Attempts</th><th>Pass rate</th></tr></thead>
            <tbody>
              {exams.map((e) => {
                const at = (attempts ?? []).filter((a) => a.exam_id === e.id);
                return (
                  <tr key={e.id}>
                    <td data-label="Code"><strong>{e.code}</strong></td>
                    <td data-label="Exam">{e.title}</td>
                    <td data-label="Faculty">{e.program}</td>
                    <td data-label="Questions">{(qs ?? []).filter((q) => q.exam_id === e.id).length}</td>
                    <td data-label="Time">{e.duration_min} min</td>
                    <td data-label="Pass mark">{e.pass_mark}%</td>
                    <td data-label="Attempts">{at.length}</td>
                    <td data-label="Pass rate">{at.length ? Math.round((at.filter((a) => a.passed).length / at.length) * 100) + '%' : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>No exams loaded</h3><p>Run <code>supabase/seed.sql</code> in the SQL editor.</p></div>
      )}
    </>
  );
}
