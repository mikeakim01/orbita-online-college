'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FormState } from '@/lib/types';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

/** Changes the name on the profile. Certificates already issued keep the name they were issued with. */
export async function updateProfile(_: FormState, f: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Please sign in again.' };
  const name = str(f, 'name').replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80) return { error: 'Enter your full name (2 to 80 characters).' };
  const { error } = await createAdminClient().from('profiles').update({ full_name: name }).eq('id', user.id);
  if (error) return { error: 'We could not save your name. Please try again.' };
  revalidatePath('/', 'layout');
  return { message: 'Your name was updated.' };
}

/** Changes the password after checking the current one. */
export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: 'Please sign in again.' };
  const current = String(f.get('current') ?? '');
  const next = String(f.get('password') ?? '');
  if (!current) return { error: 'Enter your current password.' };
  if (next.length < 8 || !/[0-9]/.test(next)) return { error: 'Use at least 8 characters, including a number.' };
  if (next !== String(f.get('confirm') ?? '')) return { error: 'The two passwords do not match.' };
  if (next === current) return { error: 'Choose a password that is different from the current one.' };
  const check = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (check.error) return { error: 'Your current password is not correct.' };
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };
  return { message: 'Your password was changed.' };
}
