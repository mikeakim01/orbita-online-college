import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShellServer from '@/components/ShellServer';
import { getSession } from '@/lib/portal';

// Programs, legal pages and certificate verification are public. Signed-in people see them inside the portal shell.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) {
    return (
      <ShellServer session={session}>
        {children}
      </ShellServer>
    );
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="public-main">
        <div className="container" style={{ padding: '40px 28px 20px', display: 'grid', gap: 26 }}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
