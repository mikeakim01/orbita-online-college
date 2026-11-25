import { createAdminClient } from '@/lib/supabase/admin';
import { PAGE_SIZE } from '@/components/Pager';

/** Names and emails for a set of user ids. */
export async function people() {
  const admin = createAdminClient();
  const [{ data: profs }, users] = await Promise.all([
    admin.from('profiles').select('id, full_name, role, created_at'),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const name = new Map((profs ?? []).map((p) => [p.id as string, (p.full_name as string) || '']));
  const email = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? '']));
  return { profs: profs ?? [], name, email };
}

export const pageOf = (raw: string | undefined) => Math.max(1, parseInt(raw ?? '1', 10) || 1);
export const slice = <T,>(rows: T[], page: number) => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
