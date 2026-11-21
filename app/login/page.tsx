import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signIn } from '@/app/actions';

export const metadata = { title: 'Sign in' };

export default function Login({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <section className="section narrow">
      <div className="container">
        <h1>Sign in</h1>
        {searchParams.error === 'link' && (
          <p role="alert" className="alert">
            That link has expired or was already used. Sign in, or request a new reset link.
          </p>
        )}
        <div className="card">
          <AuthForm
            action={signIn}
            submit="Sign in"
            hidden={{ next: searchParams.next ?? '' }}
            fields={[
              { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
              { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
            ]}
          />
          <p>
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
          <p className="muted">
            New here? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
