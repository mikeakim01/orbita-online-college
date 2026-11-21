import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { requestReset } from '@/app/actions';

export const metadata = { title: 'Reset password' };

export default function Forgot() {
  return (
    <section className="section narrow">
      <div className="container">
        <h1>Reset your password</h1>
        <div className="card">
          <p className="muted">Enter your email address and we will send a link to choose a new password.</p>
          <AuthForm
            action={requestReset}
            submit="Send reset link"
            fields={[{ name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' }]}
          />
          <p>
            <Link href="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
