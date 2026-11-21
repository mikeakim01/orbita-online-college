import AuthForm from '@/components/AuthForm';
import { updatePassword } from '@/app/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Choose a new password' };

export default async function ResetPassword() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/forgot-password');
  return (
    <section className="section narrow">
      <div className="container">
        <h1>Choose a new password</h1>
        <div className="card">
          <AuthForm
            action={updatePassword}
            submit="Save new password"
            fields={[
              { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 8 characters with a number.' },
              { name: 'confirm', label: 'Confirm new password', type: 'password', autoComplete: 'new-password' },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
