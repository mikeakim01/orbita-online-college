import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { i18n } from '@/lib/i18n';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { t } = i18n();
  return (
    <>
      <a className="skip" href="#main">
        {t('Skip to content', 'Перейти к содержимому')}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
