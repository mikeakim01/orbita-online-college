import type { ReactNode } from 'react';
import Shell from './Shell';
import ToastProvider, { UrlToast } from './Toast';
import { getNotices } from '@/lib/portal';
import type { createClient } from '@/lib/supabase/server';

const TOASTS = {
  applied: 'Application received. Upload your documents next.',
  saved: 'Changes saved.',
  password: 'Your password was changed.',
};

export default async function ShellServer({
  session,
  children,
}: {
  session: { supabase: ReturnType<typeof createClient>; user: { id: string; email?: string }; name: string; role: string };
  children: ReactNode;
}) {
  const notices = await getNotices(session.supabase, session.user.id);
  return (
    <ToastProvider>
      <UrlToast messages={TOASTS} />
      <Shell name={session.name} email={session.user.email ?? ''} role={session.role} notifCount={notices.filter((n) => n.action).length}>
        {children}
      </Shell>
    </ToastProvider>
  );
}
