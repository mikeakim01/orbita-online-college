import Link from 'next/link';
import { site } from '@/lib/site';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="sf on-dark">
      <div className="container sf-grid">
        <div className="sf-brand">
          <Link href="/" className="sn-brand" aria-label={site.name + ' home'}>
            <Logo />
            <span>
              <strong>{site.short}</strong>
              <small>Online Institute</small>
            </span>
          </Link>
          <p>A technology-focused online institute offering certificates, diplomas and degrees in Information Technology, Cyber Security and Satellite Systems.</p>
          {site.accreditation && <p className="sf-status">Recognition: {site.accreditation}</p>}
        </div>

        <nav aria-label="Explore">
          <h2>Explore</h2>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/programs">Academic Programs</Link></li>
            <li><Link href="/courses">Short Courses</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>

        <nav aria-label="Faculties">
          <h2>Faculties</h2>
          <ul>
            {site.programs.map((p) => (
              <li key={p.slug}><Link href={'/faculties/' + p.slug}>{p.name}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Admissions and portal">
          <h2>Admissions</h2>
          <ul>
            <li><Link href="/admissions">Requirements and process</Link></li>
            <li><Link href="/admissions#fees">Tuition and fees</Link></li>
            <li><Link href="/apply">Apply now</Link></li>
            <li><Link href="/login">Student portal</Link></li>
          </ul>
        </nav>

        <div>
          <h2>Contact</h2>
          <ul className="sf-contact">
            {site.email && <li><a href={'mailto:' + site.email}>{site.email}</a></li>}
            {site.phone && <li>{site.phone}</li>}
            {site.city && <li>{site.city}</li>}
            {!site.email && <li><Link href="/contact">Contact us</Link></li>}
          </ul>
        </div>
      </div>
      <div className="container sf-fine">
        <p>
          &copy; {new Date().getFullYear()} {site.name}.{site.disclaimer ? ' ' + site.disclaimer : ''}
        </p>
        <nav aria-label="Legal">
          <Link href="/legal#privacy">Privacy policy</Link>
          <Link href="/legal#terms">Terms and conditions</Link>
          <Link href="/legal#cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
