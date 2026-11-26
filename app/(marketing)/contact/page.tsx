import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader from '@/components/PageHeader';
import Icon from '@/components/Icon';
import { i18n } from '@/lib/i18n';

export const metadata = {
  title: 'Contact',
  description: 'Contact the ' + site.name + ' admissions team.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact ' + site.name, url: '/contact', type: 'website' as const },
};

export default function Contact() {
  const { t } = i18n();
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('Contact', 'Контакты') }]} kicker={t('Get in touch', 'Свяжитесь с нами')} title={t('Contact us', 'Контакты')} lead={t('Questions about programs, admissions or your application? Write to the admissions team.', 'Вопросы о программах, поступлении или заявлении? Напишите приёмной комиссии.')} />
      <section className="band">
        <div className="container">
          <div className="cards">
            {site.email && (
              <div className="contact-card">
                <span className="ic"><Icon name="mail" size={22} /></span>
                <h3>{t('Email', 'Эл. почта')}</h3>
                <a href={'mailto:' + site.email}>{site.email}</a>
                <span className="muted small" style={{ fontWeight: 400 }}>{t('Best for admissions and program questions.', 'Лучше всего для вопросов о поступлении и программах.')}</span>
              </div>
            )}
            {site.phone && (
              <div className="contact-card">
                <span className="ic"><Icon name="phone" size={22} /></span>
                <h3>{t('Telephone', 'Телефон')}</h3>
                <span>{site.phone}</span>
              </div>
            )}
            {site.city && (
              <div className="contact-card">
                <span className="ic"><Icon name="home" size={22} /></span>
                <h3>{t('Location', 'Адрес')}</h3>
                <span>{site.city}</span>
              </div>
            )}
            {!site.email && !site.phone && !site.city && (
              <div className="contact-card">
                <span className="ic"><Icon name="mail" size={22} /></span>
                <h3>{t('Admissions', 'Поступление')}</h3>
                <span>{t('Create an account and send your application. The admissions team replies through your student portal.', 'Создайте аккаунт и отправьте заявление. Приёмная комиссия отвечает через личный кабинет.')}</span>
                <Link href="/register">{t('Create an account', 'Создать аккаунт')}</Link>
              </div>
            )}
          </div>
          <div className="prose2" style={{ marginTop: 48 }}>
            <h2>{t('Already a student?', 'Уже студент?')}</h2>
            <p>{t('Sign in and open ', 'Войдите и откройте раздел ')}<Link href="/help">{t('Help and Support', 'Помощь и поддержка')}</Link>{t(' from your portal for answers about applications, documents, exams and certificates.', ' в личном кабинете: там ответы о заявлениях, документах, экзаменах и сертификатах.')}</p>
            <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn" href="/login">{t('Student portal', 'Личный кабинет')}</Link>
              <Link className="btn ghost" href="/admissions#faq">{t('Read the FAQ', 'Читать частые вопросы')}</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
