'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';
import { STAGES, type StageResult } from '@/lib/results';

type R = { error?: string };
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin/certificates');
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!prof || prof.role !== 'admin') redirect('/dashboard');
  return user;
}

/** "2026-11-25T13:50" (from a date-time field) to a Date, or null when it is empty, invalid or implausible. */
function parseWhen(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(v)) return null;
  const d = new Date(v.length === 10 ? v + 'T12:00:00Z' : v + ':00Z');
  if (isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (y < 2000 || d.getTime() > Date.now() + 86400000) return null;
  return d;
}

/** Reads the five optional exam scores from the form. */
function parseResults(f: FormData): { results: StageResult[]; error?: string } {
  const results: StageResult[] = [];
  for (const s of STAGES) {
    const raw = str(f, 'r_' + s.key);
    if (!raw) continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 100) return { results, error: s.label + ' score must be between 0 and 100.' };
    results.push({ label: s.label, score: Math.round(n) });
  }
  return { results };
}

/** Admin only: award a certificate to a student with the completion date and time the admin chooses. */
export async function grantCertificate(f: FormData): Promise<R> {
  await requireAdmin();
  const userId = str(f, 'user_id');
  const examId = str(f, 'exam_id');
  const title = str(f, 'title').slice(0, 160);
  const { results, error: rErr } = parseResults(f);
  if (rErr) return { error: rErr };
  const finalScore = results.find((r) => r.label === 'Final exam')?.score;
  const avg = results.length ? Math.round(results.reduce((t, r) => t + r.score, 0) / results.length) : undefined;
  const rawScore = str(f, 'score');
  const score = rawScore ? Number(rawScore) : finalScore ?? avg ?? NaN;
  const when = parseWhen(str(f, 'completed'));
  if (!userId || !examId) return { error: 'Choose a student and a course or exam.' };
  if (!when) return { error: 'Enter a valid completion date and time that is not in the future.' };
  if (!Number.isFinite(score) || score < 0 || score > 100) return { error: rawScore || results.length ? 'The score must be between 0 and 100.' : 'Enter an overall score or at least one exam score.' };

  const admin = createAdminClient();
  const [{ data: prof }, { data: exam }, { data: authUser }] = await Promise.all([
    admin.from('profiles').select('id, full_name').eq('id', userId).maybeSingle(),
    admin.from('exams').select('id, title').eq('id', examId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  if (!prof || !exam) return { error: 'That student or exam no longer exists.' };
  const name = ((prof.full_name as string) || authUser?.user?.email || 'Student').trim();

  for (let i = 0; i < 6; i++) {
    const serial = site.prefix + '-' + when.getUTCFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await admin.from('certificates').insert({
      serial,
      user_id: userId,
      exam_id: examId,
      student_name: name,
      exam_title: title || (exam.title as string),
      score: Math.round(score),
      ...(results.length ? { results } : {}),
      issued_at: when.toISOString(),
    });
    if (error && /results/i.test(error.message)) return { error: 'The exam results column is missing. Run supabase/add-exam-results.sql in the Supabase SQL editor once, then try again.' };
    if (!error) {
      revalidatePath('/admin');
      revalidatePath('/admin/certificates');
      revalidatePath('/certificates');
      return {};
    }
  }
  return { error: 'Could not save the certificate. Please try again.' };
}

/** Admin only: change the completion date and time, and the exam scores, of an existing certificate. */
export async function updateCertificateDate(f: FormData): Promise<R> {
  await requireAdmin();
  const id = str(f, 'id');
  const when = parseWhen(str(f, 'completed'));
  if (!id) return { error: 'Certificate not found.' };
  if (!when) return { error: 'Enter a valid completion date and time that is not in the future.' };
  const { results, error: rErr } = parseResults(f);
  if (rErr) return { error: rErr };
  const { error } = await createAdminClient().from('certificates').update({ issued_at: when.toISOString(), results: results.length ? results : null }).eq('id', id);
  if (error) return { error: /results/i.test(error.message) ? 'The exam results column is missing. Run supabase/add-exam-results.sql in the Supabase SQL editor once, then try again.' : 'Could not save the changes.' };
  revalidatePath('/admin/certificates');
  revalidatePath('/certificates');
  return {};
}

/** Saves which certificate design is used for all certificate PDFs. */
export async function chooseDesign(f: FormData): Promise<void> {
  await requireAdmin();
  const id = str(f, 'design');
  const { isDesign } = await import('@/lib/certStyles');
  if (!isDesign(id)) redirect('/admin/designs?error=Unknown+design');
  const { error } = await createAdminClient().from('site_settings').upsert({ key: 'certificate_design', value: id });
  if (error) {
    const hint = /site_settings/i.test(error.message) ? 'Run supabase/add-site-settings.sql in the Supabase SQL editor first.' : error.message;
    redirect('/admin/designs?error=' + encodeURIComponent(hint));
  }
  revalidatePath('/admin/designs');
  redirect('/admin/designs?saved=1');
}
