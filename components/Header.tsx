import { createClient } from '@/lib/supabase/server';
import SiteNav from './SiteNav';

export default async function Header() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return <SiteNav signedIn={Boolean(user)} />;
}
