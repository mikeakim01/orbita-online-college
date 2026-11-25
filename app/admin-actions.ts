'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';

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

/** Admin only: award a certificate to a student with the completion date and time the admin chooses. */
export async function grantCertificate(f: FormData): Promise<R> {
  await requireAdmin();
  const userId = str(f, 'user_id');
  const examId = str(f, 'exam_id');
  const title = str(f, 'title').slice(0, 160);
  const score = Number(str(f, 'score') || '100');
  const when = parseWhen(str(f, 'completed'));
  if (!userId || !examId) return { error: 'Choose a student and a course or exam.' };
  if (!when) return { error: 'Enter a valid completion date and time that is not in the future.' };
  if (!Number.isFinite(score) || score < 0 || score > 100) return { error: 'The score must be between 0 and 100.' };

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
      issued_at: when.toISOString(),
    });
    if (!error) {
      revalidatePath('/admin');
      revalidatePath('/admin/certificates');
      revalidatePath('/certificates');
      return {};
    }
  }
  return { error: 'Could not save the certificate. Please try again.' };
}

/** Admin only: change the completion date and time printed on an existing certificate. */
export async function updateCertificateDate(f: FormData): Promise<R> {
  await requireAdmin();
  const id = str(f, 'id');
  const when = parseWhen(str(f, 'completed'));
  if (!id) return { error: 'Certificate not found.' };
  if (!when) return { error: 'Enter a valid completion date and time that is not in the future.' };
  const { error } = await createAdminClient().from('certificates').update({ issued_at: when.toISOString() }).eq('id', id);
  if (error) return { error: 'Could not change the date.' };
  revalidatePath('/admin/certificates');
  revalidatePath('/certificates');
  return {};
}
