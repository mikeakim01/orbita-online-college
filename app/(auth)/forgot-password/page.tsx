import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { requestReset } from '@/app/actions';

export const metadata = { title: 'Reset password' };

export default function Forgot() {
  return (
    <AuthShell title="Reset your password" intro="Enter your email address and we will send a link to choose a new password.">
      <AuthForm action={requestReset} submit="Send reset link" fields={[{ name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' }]} />
      <p style={{ margin: 0 }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
