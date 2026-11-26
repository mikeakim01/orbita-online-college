import Link from 'next/link';
import { site } from '@/lib/site';
import Logo from './Logo';
import { i18n } from '@/lib/i18n';

export default function Footer() {
  const { t, d } = i18n();
  return (
    <footer className="sf on-dark">
      <div className="container sf-grid">
        <div className="sf-brand">
          <Link href="/" className="sn-brand" aria-label={site.name + t(' home', ': главная')}>
            <Logo />
            <span>
              <strong>{site.short}</strong>
              <small>{t('Engineering Institute', 'Инженерный институт')}</small>
            </span>
          </Link>
          <p>{t('A technology-focused online institute offering Bachelor, Master and PhD degrees in Information Technology, Cyber Security and Satellite Systems.', 'Онлайн-институт технологической направленности: бакалавриат, магистратура и аспирантура по информационным технологиям, кибербезопасности и спутниковым системам.')}</p>
          {site.accreditation && <p className="sf-status">{t('Recognition', 'Признание')}: {site.accreditation}</p>}
        </div>

        <nav aria-label="Explore">
          <h2>{t('Explore', 'Разделы')}</h2>
          <ul>
            <li><Link href="/about">{t('About Us', 'Об институте')}</Link></li>
            <li><Link href="/programs">{t('Academic Programs', 'Программы')}</Link></li>
            <li><Link href="/contact">{t('Contact', 'Контакты')}</Link></li>
          </ul>
        </nav>

        <nav aria-label="Faculties">
          <h2>{t('Faculties', 'Факультеты')}</h2>
          <ul>
            {site.programs.map((p) => (
              <li key={p.slug}><Link href={'/faculties/' + p.slug}>{d(p.name)}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Admissions and portal">
          <h2>{t('Admissions', 'Поступление')}</h2>
          <ul>
            <li><Link href="/admissions">{t('Requirements and process', 'Требования и порядок')}</Link></li>
            <li><Link href="/admissions#fees">{t('Tuition and fees', 'Стоимость обучения')}</Link></li>
            <li><Link href="/apply">{t('Apply now', 'Подать заявление')}</Link></li>
            <li><Link href="/login">{t('Student portal', 'Личный кабинет')}</Link></li>
          </ul>
        </nav>

        <div>
          <h2>{t('Contact', 'Контакты')}</h2>
          <ul className="sf-contact">
            {site.email && <li><a href={'mailto:' + site.email}>{site.email}</a></li>}
            {site.phone && <li>{site.phone}</li>}
            {site.city && <li>{site.city}</li>}
            {!site.email && <li><Link href="/contact">{t('Contact us', 'Связаться с нами')}</Link></li>}
          </ul>
        </div>
      </div>
      <div className="container sf-fine">
        <p>
          &copy; {new Date().getFullYear()} {site.name}.{site.disclaimer ? ' ' + site.disclaimer : ''}
        </p>
        <nav aria-label="Legal">
          <Link href="/legal#privacy">{t('Privacy policy', 'Политика конфиденциальности')}</Link>
          <Link href="/legal#terms">{t('Terms and conditions', 'Условия использования')}</Link>
          <Link href="/legal#cookies">{t('Cookies', 'Файлы cookie')}</Link>
        </nav>
      </div>
    </footer>
  );
}
