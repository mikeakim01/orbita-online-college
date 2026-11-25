import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { updatePassword } from '@/app/actions';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Choose a new password' };

export default async function ResetPassword() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/forgot-password');
  return (
    <AuthShell title="Choose a new password" intro="Use at least 8 characters, including a number.">
      <AuthForm
        action={updatePassword}
        submit="Save new password"
        fields={[
          { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 8 characters with a number.' },
          { name: 'confirm', label: 'Confirm new password', type: 'password', autoComplete: 'new-password' },
        ]}
      />
    </AuthShell>
  );
}
