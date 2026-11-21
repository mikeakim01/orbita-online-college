import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signUp } from '@/app/actions';

export const metadata = { title: 'Create account' };

export default function Register() {
  return (
    <section className="section narrow">
      <div className="container">
        <h1>Create your account</h1>
        <div className="card">
          <AuthForm
            action={signUp}
            submit="Create account"
            fields={[
              { name: 'name', label: 'Full name (as it should appear on certificates)', autoComplete: 'name' },
              { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                autoComplete: 'new-password',
                hint: 'At least 8 characters with a number.',
              },
              { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
              { name: 'terms', label: 'I accept the terms and the privacy policy (see Legal).', type: 'checkbox' },
            ]}
          />
          <p className="muted">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
