import Link from 'next/link';
import Icon from '@/components/Icon';
import { requireSession, getNotices, day } from '@/lib/portal';

export const metadata = { title: 'Notifications' };
export const dynamic = 'force-dynamic';

export default async function Notifications() {
  const { supabase, user } = await requireSession('/notifications');
  const items = await getNotices(supabase, user.id);
  const todo = items.filter((n) => n.action);
  const rest = items.filter((n) => !n.action);

  const row = (n: (typeof items)[number]) => (
    <div key={n.id}>
      <span className={'nt ' + (n.kind === 'info' ? '' : n.kind)}><Icon name={n.icon} size={18} /></span>
      <div className="grow">
        <strong>{n.title}</strong>
        <div className="muted">{n.body}</div>
        <div className="muted small">{day(n.at)}</div>
      </div>
      <Link className="btn ghost sm" href={n.href}>Open</Link>
    </div>
  );

  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/dashboard">Dashboard</Link> / <span>Notifications</span></p>
          <h1>Notifications</h1>
          <p className="muted" style={{ margin: 0 }}>Built from your applications, exams and certificates.</p>
        </div>
      </div>

      <section className="card" aria-labelledby="h-todo">
        <h2 id="h-todo" style={{ fontSize: 20 }}>Needs your attention ({todo.length})</h2>
        {todo.length ? <div className="list">{todo.map(row)}</div> : <p className="muted" style={{ margin: 0 }}>Nothing needs your action right now.</p>}
      </section>

      <section className="card" aria-labelledby="h-act">
        <h2 id="h-act" style={{ fontSize: 20 }}>Recent activity</h2>
        {rest.length ? <div className="list">{rest.map(row)}</div> : <div className="empty"><p style={{ margin: 0 }}>Your activity will appear here.</p></div>}
      </section>
    </>
  );
}
