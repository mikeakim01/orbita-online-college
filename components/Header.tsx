import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { site } from '@/lib/site';
import Logo from './Logo';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <header className="nav">
      <div className="container nav-in">
        <Link href="/" className="brand">
          <Logo />
          <span>
            {site.short}
            {site.native ? <small> {site.native}</small> : null}
          </span>
        </Link>
        <nav className="links" aria-label="Main">
          <Link href="/programs">Programs</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button className="linkbtn" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login">Sign in</Link>
          )}
          <Link className="btn sm" href="/apply">
            Apply
          </Link>
        </nav>
      </div>
    </header>
  );
}
