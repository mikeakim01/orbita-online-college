import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/portal';

export const dynamic = 'force-dynamic';

// Every page under /admin is for administrators only. The data is read with the service key on the server.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession('/admin');
  if (s.role !== 'admin') redirect('/dashboard');
  return <>{children}</>;
}
