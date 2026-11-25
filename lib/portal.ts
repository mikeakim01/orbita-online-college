import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { missingFor } from '@/lib/documents';

export type Notice = { id: string; kind: 'warn' | 'ok' | 'bad' | 'info' | 'gold'; icon: string; title: string; body: string; href: string; at: string; action: boolean };

/** The signed-in person and their profile, or null. */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: prof } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle();
  return {
    supabase,
    user,
    name: (prof?.full_name as string | undefined) ?? '',
    role: (prof?.role as string | undefined) ?? 'student',
  };
}

export async function requireSession(next: string) {
  const s = await getSession();
  if (!s) redirect('/login?next=' + encodeURIComponent(next));
  return s;
}

/**
 * Notices are built from the person's own records. Nothing is stored, so there is no unread state:
 * the bell counts the items that need an action from the student.
 */
export async function getNotices(supabase: ReturnType<typeof createClient>, userId: string): Promise<Notice[]> {
  const [{ data: apps }, { data: certs }, { data: attempts }] = await Promise.all([
    supabase.from('applications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
    supabase.from('certificates').select('id, serial, exam_title, issued_at, revoked').eq('user_id', userId).order('issued_at', { ascending: false }).limit(10),
    supabase.from('attempts').select('id, score, passed, created_at, exams(title)').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ]);
  const appIds = (apps ?? []).map((a) => a.id as string);
  const docs = appIds.length ? ((await supabase.from('application_documents').select('application_id, doc_type').in('application_id', appIds)).data ?? []) : [];

  const out: Notice[] = [];
  for (const a of apps ?? []) {
    if (a.docs_note)
      out.push({ id: 'n' + a.id, kind: 'warn', icon: 'mail', title: 'Message from admissions', body: a.docs_note as string, href: '/documents/' + a.id, at: (a.docs_note_at as string) ?? a.created_at, action: true });
    if (a.status === 'submitted') {
      const miss = missingFor(a.level as string, docs.filter((d) => d.application_id === a.id).map((d) => d.doc_type as string));
      if (miss.length)
        out.push({ id: 'm' + a.id, kind: 'warn', icon: 'upload', title: 'Documents needed for ' + a.program + ' (' + a.level + ')', body: 'Still needed: ' + miss.map((m) => m.label).join(', ') + '.', href: '/documents/' + a.id, at: a.created_at as string, action: true });
    }
    if (a.status === 'approved') out.push({ id: 'a' + a.id, kind: 'ok', icon: 'check', title: 'Application approved', body: a.program + ' (' + a.level + ') is approved. Your exams are open.', href: '/applications/' + a.id, at: a.created_at as string, action: false });
    if (a.status === 'rejected') out.push({ id: 'r' + a.id, kind: 'bad', icon: 'alert', title: 'Application not approved', body: a.program + ' (' + a.level + ') was not approved. Contact admissions if you have questions.', href: '/applications/' + a.id, at: a.created_at as string, action: false });
  }
  for (const c of certs ?? []) out.push({ id: 'c' + c.id, kind: 'gold', icon: 'award', title: c.revoked ? 'Certificate revoked' : 'Certificate issued', body: c.exam_title + ' (' + c.serial + ')', href: '/certificates', at: c.issued_at as string, action: false });
  for (const t of attempts ?? []) {
    const title = (t.exams as unknown as { title: string } | null)?.title ?? 'Exam';
    out.push({ id: 't' + t.id, kind: t.passed ? 'ok' : 'info', icon: 'file', title: (t.passed ? 'Passed: ' : 'Attempt: ') + title, body: 'You scored ' + t.score + '%.', href: '/exams', at: t.created_at as string, action: false });
  }
  return out.sort((x, y) => (x.at < y.at ? 1 : -1));
}

export const day = (iso?: string | null) => {
  const t = iso ? new Date(iso) : null;
  return t && !isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : '-';
};
