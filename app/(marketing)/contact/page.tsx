import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader from '@/components/PageHeader';
import Icon from '@/components/Icon';

export const metadata = {
  title: 'Contact',
  description: 'Contact the ' + site.name + ' admissions team by email.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact ' + site.name, url: '/contact', type: 'website' as const },
};

export default function Contact() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} kicker="Get in touch" title="Contact us" lead="Questions about programs, admissions or your application? Write to the admissions team." />
      <section className="band">
        <div className="container">
          <div className="cards">
            <div className="contact-card">
              <span className="ic"><Icon name="mail" size={22} /></span>
              <h3>Email</h3>
              <a href={'mailto:' + site.email}>{site.email}</a>
              <span className="muted small" style={{ fontWeight: 400 }}>Best for admissions and program questions.</span>
            </div>
            <div className="contact-card">
              <span className="ic"><Icon name="phone" size={22} /></span>
              <h3>Telephone</h3>
              <span>{site.phone}</span>
            </div>
            <div className="contact-card">
              <span className="ic"><Icon name="home" size={22} /></span>
              <h3>Location</h3>
              <span>{site.city}</span>
            </div>
          </div>
          <div className="prose2" style={{ marginTop: 48 }}>
            <h2>Already a student?</h2>
            <p>Sign in and open <Link href="/help">Help and Support</Link> from your portal for answers about applications, documents, exams and certificates.</p>
            <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn" href="/login">Student portal</Link>
              <Link className="btn ghost" href="/admissions#faq">Read the FAQ</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
