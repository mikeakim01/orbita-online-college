import Link from 'next/link';
import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container foot-in">
        <div>
          <strong>{site.name}</strong>
          <div>Recognition: {site.accreditation}</div>
          <div>
            {site.email} &middot; {site.phone} &middot; {site.city}
          </div>
        </div>
        <nav className="links" aria-label="Footer">
          <Link href="/programs">Programs</Link>
          <Link href="/legal#privacy">Privacy</Link>
          <Link href="/legal#terms">Terms</Link>
          <Link href="/legal#cookies">Cookies</Link>
        </nav>
      </div>
      <div className="container fine">&copy; {new Date().getFullYear()} {site.name}. {site.disclaimer}</div>
    </footer>
  );
}
