import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { facultyBySlug, feeLabel, levelBySlug, levelSlug } from '@/lib/catalog';
import { curriculum } from '@/lib/curriculum';
import { i18n } from '@/lib/i18n';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';

type P = { params: { faculty: string; level: string } };

export function generateMetadata({ params }: P): Metadata {
  const f = facultyBySlug(params.faculty);
  const l = levelBySlug(params.level);
  if (!f || !l) return { title: 'Program not found' };
  const title = l.name + ' in ' + f.name;
  return { title, description: title + ' at ' + site.name + '. Duration ' + l.duration + '. ' + f.blurb, alternates: { canonical: '/programs/' + f.slug + '/' + levelSlug(l.name) }, openGraph: { title: title + ' | ' + site.name, description: f.blurb, type: 'website' } };
}

export default function Programme({ params }: P) {
  const f = facultyBySlug(params.faculty);
  const l = levelBySlug(params.level);
  if (!f || !l) notFound();
  const { t, d } = i18n();
  const docs = site.docRules?.[l.name] ?? [];
  const plan = curriculum(f.slug, l.name);
  const apply = '/apply?program=' + f.slug + '&level=' + encodeURIComponent(l.name);
  const title = t(l.name + ' in ' + f.name, d(l.name) + ': ' + d(f.name));
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('Academic Programs', 'Программы'), href: '/programs' }, { label: title }]} kicker={d(f.name)} title={title} lead={d(f.blurb)}>
        <p style={{ marginTop: 26 }}><Link className="btn gold-solid lg" href={apply}>{t('Apply for this program', 'Подать заявление на программу')}</Link></p>
      </PageHeader>

      <section className="band" style={{ paddingBottom: 0 }}>
        <div className="container">
          <dl className="facts2">
            <div><dt>{t('Qualification', 'Квалификация')}</dt><dd>{d(l.name)}</dd></div>
            <div><dt>{t('Faculty', 'Факультет')}</dt><dd>{d(f.name)}</dd></div>
            <div><dt>{t('Duration', 'Срок обучения')}</dt><dd>{d(l.duration)}</dd></div>
            <div><dt>{t('Tuition', 'Стоимость')}</dt><dd>{d(feeLabel(l.name, f.name))}</dd></div>
            <div><dt>{t('Entry requirement', 'Требование для поступления')}</dt><dd>{d(l.entry)}</dd></div>
            <div><dt>{t('Application fee', 'Регистрационный сбор')}</dt><dd>{site.appFee}</dd></div>
            <div><dt>{t('Next intake', 'Ближайший набор')}</dt><dd>{d(site.intake)}</dd></div>
            <div><dt>{t('Study mode', 'Форма обучения')}</dt><dd>{d('Online')}</dd></div>
          </dl>
        </div>
      </section>

      <section className="band">
        <div className="container two-col">
          <Reveal className="prose2">
            <h2>{t('Program overview', 'О программе')}</h2>
            <p>{t(f.blurb + ' This ' + l.name + ' program is delivered online and takes ' + l.duration + '.', d(f.blurb) + ' Программа (' + d(l.name) + ') проходит онлайн, срок обучения — ' + d(l.duration) + '.')}</p>
            {plan ? (
              <>
                <h2>{l.name === 'PhD' ? t('Research timeline', 'Этапы исследования') : l.name === 'Bachelor' ? t('What you will study, year by year', 'Что вы будете изучать по годам') : t('What you will study', 'Что вы будете изучать')}</h2>
                <div className="curr">
                  {plan.map((b) => (
                    <div className="curr-block" key={b.title}>
                      <h3>{d(b.title)}</h3>
                      <ul>{b.items.map((m) => <li key={m}>{d(m)}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2>{t('Core modules', 'Основные модули')}</h2>
                <ul className="checks">{f.modules.map((m) => <li key={m}>{d(m)}</li>)}</ul>
              </>
            )}
            <h2>{t('Admission requirements', 'Требования для поступления')}</h2>
            <p><strong>{t('Entry requirement:', 'Требование:')}</strong> {d(l.entry)}</p>
            {docs.length > 0 && (
              <>
                <p>{t('Documents you upload after applying:', 'Документы, которые вы загружаете после подачи заявления:')}</p>
                <ul className="checks">{docs.map((x) => <li key={x.key}>{d(x.label)}{x.required ? '' : t(' (optional)', ' (по желанию)')}</li>)}</ul>
              </>
            )}
            <h2>{t('Tuition', 'Стоимость обучения')}</h2>
            <p>{d(feeLabel(l.name, f.name))}. {d(site.feeNote)}</p>
          </Reveal>
          <Reveal delay={100}>
            <aside className="aside-card on-dark">
              <h3>{t('Ready to apply?', 'Готовы подать заявление?')}</h3>
              <p>{t('The next intake is ' + site.intake + '. Application fee ' + site.appFee + '.', 'Ближайший набор: ' + d(site.intake) + '. Регистрационный сбор ' + site.appFee + '.')}</p>
              <Link className="btn gold-solid lg" href={apply}>{t('Start your application', 'Начать заявление')}</Link>
              <Link className="btn on-navy" href={'/faculties/' + f.slug}>{t('About the faculty', 'О факультете')}</Link>
              <Link className="btn on-navy" href="/admissions">{t('Admissions information', 'Информация о поступлении')}</Link>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <p className="more"><Link href={'/faculties/' + f.slug} className="more"><Icon name="back" size={16} /> {t('Back to ' + f.name, 'Назад: ' + d(f.name))}</Link></p>
        </div>
      </section>
    </>
  );
}
