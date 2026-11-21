'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { site } from '@/lib/site';
import type { FormState, ExamResult } from '@/lib/types';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function siteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return proto + '://' + host;
}

const safeNext = (n: unknown) =>
  typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function signIn(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, 'email');
  const password = String(f.get('password') ?? '');
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.' };
  if (!password) return { error: 'Enter your password.' };
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'The email or password is not correct, or the email is not confirmed yet.' };
  redirect(safeNext(f.get('next')));
}

export async function signUp(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, 'name');
  const email = str(f, 'email');
  const password = String(f.get('password') ?? '');
  if (name.length < 2) return { error: 'Enter your full name.' };
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8 || !/[0-9]/.test(password)) return { error: 'Use at least 8 characters, including a number.' };
  if (password !== String(f.get('confirm') ?? '')) return { error: 'The two passwords do not match.' };
  if (!f.get('terms')) return { error: 'Accept the terms and privacy policy to continue.' };
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: siteUrl() + '/auth/callback' },
  });
  if (error) return { error: error.message };
  if (data.session) redirect('/dashboard');
  return { message: 'Check your email and open the link to confirm your account, then sign in.' };
}

export async function requestReset(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, 'email');
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.' };
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl() + '/auth/callback?next=/reset-password',
  });
  // Same answer whether or not the account exists.
  return { message: 'If that email has an account, a reset link is on its way.' };
}

export async function updatePassword(_: FormState, f: FormData): Promise<FormState> {
  const password = String(f.get('password') ?? '');
  if (password.length < 8 || !/[0-9]/.test(password)) return { error: 'Use at least 8 characters, including a number.' };
  if (password !== String(f.get('confirm') ?? '')) return { error: 'The two passwords do not match.' };
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect('/dashboard');
}

export async function submitApplication(_: FormState, f: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/apply');
  const program = str(f, 'program');
  const level = str(f, 'level');
  const statement = str(f, 'statement').slice(0, 1000);
  if (!site.programs.some((p) => p.name === program)) return { error: 'Choose a program.' };
  if (!site.applyLevels.includes(level)) return { error: 'Choose a level.' };
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('program', program)
    .eq('level', level)
    .in('status', ['submitted', 'approved'])
    .limit(1);
  if (existing && existing.length) return { error: 'You already have an active application for this program and level.' };
  const { error } = await supabase.from('applications').insert({ user_id: user.id, program, level, statement });
  if (error) return { error: 'We could not save your application. Please try again.' };
  redirect('/dashboard?applied=1');
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!prof || prof.role !== 'admin') redirect('/dashboard');
  return user;
}

export async function setApplicationStatus(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  const status = str(f, 'status');
  if (!['approved', 'rejected', 'submitted'].includes(status)) return;
  await createAdminClient().from('applications').update({ status }).eq('id', id);
  revalidatePath('/admin');
}

export async function setCertificateRevoked(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  const revoked = str(f, 'revoked') === 'true';
  await createAdminClient().from('certificates').update({ revoked }).eq('id', id);
  revalidatePath('/admin');
}

export async function submitExam(code: string, answers: number[]): Promise<ExamResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Please sign in again.' };
  const admin = createAdminClient();

  const { data: exam } = await admin.from('exams').select('*').eq('code', code).single();
  if (!exam) return { error: 'Exam not found.' };

  // Access: an approved application for the exam's program (or a program that includes it).
  const { data: apps } = await supabase
    .from('applications')
    .select('program')
    .eq('user_id', user.id)
    .eq('status', 'approved');
  const allowed = (apps ?? []).some(
    (a) => a.program === exam.program || (site.programAccess[a.program] ?? []).includes(exam.program)
  );
  if (!allowed) return { error: 'This exam opens when your application for this program is approved.' };

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await admin
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('exam_id', exam.id)
    .gte('created_at', since);
  if ((count ?? 0) >= 3) return { error: 'You have used all 3 attempts for this exam in the last 24 hours.' };

  const { data: qs } = await admin
    .from('questions')
    .select('position, correct')
    .eq('exam_id', exam.id)
    .order('position');
  if (!qs || !qs.length) return { error: 'This exam has no questions yet.' };
  if (!Array.isArray(answers) || answers.length !== qs.length) return { error: 'Invalid submission.' };
  const correct = qs.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
  const score = Math.round((100 * correct) / qs.length);
  const passed = score >= exam.pass_mark;

  await admin.from('attempts').insert({ user_id: user.id, exam_id: exam.id, score, passed });

  let serial: string | undefined;
  if (passed) {
    const { data: have } = await admin
      .from('certificates')
      .select('serial')
      .eq('user_id', user.id)
      .eq('exam_id', exam.id)
      .eq('revoked', false)
      .limit(1);
    if (have && have.length) {
      serial = have[0].serial;
    } else {
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const name = (prof?.full_name || user.email || 'Student').trim();
      for (let i = 0; i < 5 && !serial; i++) {
        const s =
          site.prefix + '-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
        const { error } = await admin.from('certificates').insert({
          serial: s,
          user_id: user.id,
          exam_id: exam.id,
          student_name: name,
          exam_title: exam.title,
          score,
        });
        if (!error) serial = s;
      }
    }
  }
  revalidatePath('/dashboard');
  return { score, correct, total: qs.length, passed, serial };
}
