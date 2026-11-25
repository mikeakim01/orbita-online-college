import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { updateProfile } from '@/app/portal-actions';
import { requireSession, day } from '@/lib/portal';

export const metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function Profile() {
  const { supabase, user, name, role } = await requireSession('/profile');
  const [{ count: apps }, { count: approved }, { count: certs }, { count: attempts }] = await Promise.all([
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved'),
    supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('revoked', false),
    supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);
  const initials = (name || user.email || '?').split(/[\s@]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('');

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Profile</span></p>
          <h1>Profile</h1>
        </div>
      </div>

      <section className="card row" style={{ gap: 20 }}>
        <span className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>{initials}</span>
        <div>
          <h2 style={{ margin: 0 }}>{name || 'Your name'}</h2>
          <p className="muted" style={{ margin: 0 }}>{user.email} <span className={'badge ' + (role === 'admin' ? 'gold' : 'violet')} style={{ marginLeft: 8 }}>{role}</span></p>
          <p className="muted small" style={{ margin: '6px 0 0' }}>Member since {day(user.created_at)}</p>
        </div>
      </section>

      <div className="g2" style={{ alignItems: 'start' }}>
        <section className="card" aria-labelledby="h-det">
          <h2 id="h-det" style={{ fontSize: 20 }}>Personal details</h2>
          <AuthForm
            action={updateProfile}
            submit="Save changes"
            fields={[
              { name: 'name', label: 'Full name (as it should appear on certificates)', autoComplete: 'name', defaultValue: name },
              { name: 'email', label: 'Email address', type: 'email', defaultValue: user.email ?? '', readOnly: true, hint: 'To change your email, contact admissions.' },
            ]}
          />
          <p className="muted small" style={{ margin: 0 }}>Certificates already issued keep the name they were issued with.</p>
        </section>

        <section className="card" aria-labelledby="h-acad">
          <h2 id="h-acad" style={{ fontSize: 20 }}>Academic record</h2>
          <dl className="facts">
            <div><dt>Applications</dt><dd>{apps ?? 0}</dd></div>
            <div><dt>Approved</dt><dd>{approved ?? 0}</dd></div>
            <div><dt>Exam attempts</dt><dd>{attempts ?? 0}</dd></div>
            <div><dt>Certificates</dt><dd>{certs ?? 0}</dd></div>
          </dl>
          <p style={{ margin: '18px 0 0' }}><Link className="btn ghost sm" href="/certificates">View certificates</Link></p>
        </section>
      </div>
    </>
  );
}
