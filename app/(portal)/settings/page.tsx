import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import Icon from '@/components/Icon';
import { changePassword } from '@/app/portal-actions';
import { requireSession } from '@/lib/portal';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function Settings() {
  const { user } = await requireSession('/settings');
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Settings</span></p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="g2" style={{ alignItems: 'start' }}>
        <section className="card" aria-labelledby="h-pw">
          <h2 id="h-pw" style={{ fontSize: 20 }}><Icon name="lock" size={20} /> Change password</h2>
          <AuthForm
            action={changePassword}
            submit="Change password"
            fields={[
              { name: 'current', label: 'Current password', type: 'password', autoComplete: 'current-password' },
              { name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 8 characters with a number.' },
              { name: 'confirm', label: 'Confirm new password', type: 'password', autoComplete: 'new-password' },
            ]}
          />
        </section>

        <div className="stack">
          <section className="card" aria-labelledby="h-acc">
            <h2 id="h-acc" style={{ fontSize: 20 }}><Icon name="mail" size={20} /> Account</h2>
            <dl className="facts">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Sign-in</dt><dd>Email and password</dd></div>
            </dl>
            <p className="muted small" style={{ margin: '14px 0 0' }}>To change your email address or close your account, contact admissions from the Help page.</p>
          </section>
          <section className="card" aria-labelledby="h-not">
            <h2 id="h-not" style={{ fontSize: 20 }}><Icon name="bell" size={20} /> Notifications</h2>
            <p className="muted" style={{ margin: 0 }}>
              Notifications are shown in the portal. The bell counts items that need your action, such as missing documents or a message from admissions. Email notifications are not available yet.
            </p>
            <p style={{ margin: '14px 0 0' }}><Link className="btn ghost sm" href="/notifications">Open notifications</Link></p>
          </section>
          <section className="card" aria-labelledby="h-ses">
            <h2 id="h-ses" style={{ fontSize: 20 }}><Icon name="logout" size={20} /> Session</h2>
            <form action="/auth/signout" method="post"><button className="btn danger" type="submit">Sign out of this device</button></form>
          </section>
        </div>
      </div>
    </>
  );
}
