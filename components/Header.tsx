import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n';
import SiteNav from './SiteNav';

export default async function Header() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return <SiteNav signedIn={Boolean(user)} lang={getLang()} />;
}
