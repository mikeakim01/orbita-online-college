import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container" id="main">
        <div className="empty" style={{ margin: '64px auto', maxWidth: 520 }}>
          <p className="eyebrow">Error 404</p>
          <h1>We could not find that page</h1>
          <p className="muted">The link may be old or the page may have moved.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn" href="/">Go home</Link>
            <Link className="btn ghost" href="/dashboard">My dashboard</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
