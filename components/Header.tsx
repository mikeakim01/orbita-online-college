import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { site } from '@/lib/site';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

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
            <small>Online Institute</small>
          </span>
        </Link>
        <nav className="links" aria-label="Main">
          <Link href="/programs">Programs</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          {user ? (
            <Link className="btn sm" href="/dashboard">
              Open portal
            </Link>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link className="btn sm" href="/apply">
                Apply now
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
