import ShellServer from '@/components/ShellServer';
import { requireSession } from '@/lib/portal';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/dashboard');
  return <ShellServer session={session}>{children}</ShellServer>;
}
