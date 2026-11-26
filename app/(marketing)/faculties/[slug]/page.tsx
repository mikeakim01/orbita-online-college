import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { facultyBySlug, feeLabel, levelSlug } from '@/lib/catalog';
import { i18n } from '@/lib/i18n';
import PageHeader, { SectionHeading } from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = facultyBySlug(params.slug);
  if (!f) return { title: 'Faculty not found' };
  return { title: f.name, description: f.blurb + ' Bachelor, Master and PhD programs at ' + site.name + '.', alternates: { canonical: '/faculties/' + f.slug }, openGraph: { title: f.name + ' | ' + site.name, description: f.blurb, url: '/faculties/' + f.slug, type: 'website' } };
}

export default function Faculty({ params }: { params: { slug: string } }) {
  const f = facultyBySlug(params.slug);
  if (!f) notFound();
  const { t, d } = i18n();
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('Faculties', 'Факультеты'), href: '/faculties' }, { label: d(f.name) }]} kicker={t('Faculty', 'Факультет')} title={d(f.name)} lead={d(f.blurb)}>
        <p style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn gold-solid lg" href={'/apply?program=' + f.slug}>{t('Apply to this faculty', 'Подать заявление на факультет')}</Link>
          <Link className="btn on-navy lg" href="#programs">{t('See programs', 'Программы')}</Link>
        </p>
      </PageHeader>

      <section className="band">
        <div className="container split">
          <Reveal className="prose2">
            <h2>{t('What you will study', 'Что вы будете изучать')}</h2>
            <p>{t('Degree programs in this faculty build on a common core. At Bachelor level the core modules are:', 'Программы факультета опираются на общее ядро. На уровне бакалавриата основные модули:')}</p>
            <ul className="checks">{f.modules.map((m) => <li key={m}>{d(m)}</li>)}</ul>
            <h2>{t('Where it leads', 'Куда ведёт обучение')}</h2>
            <p>{t('Graduates work as ', 'Выпускники работают: ')}{d(f.careers)}</p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}><Scene kind={sceneFor(f.name, f.slug)} label={d(f.name)} /></figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="programs">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Academic programs', 'Программы')} title={t('Qualifications in ' + f.name, 'Квалификации: ' + d(f.name))} /></Reveal>
          <div className="cards">
            {site.levels.map((l, i) => (
              <Reveal key={l.name} delay={i * 60}>
                <Link href={'/programs/' + f.slug + '/' + levelSlug(l.name)} className="pc" style={{ height: '100%' }}>
                  <div className="tags"><span className="badge violet">{d(l.name)}</span></div>
                  <h3>{t(l.name + ' in ' + f.name, d(l.name) + ': ' + d(f.name))}</h3>
                  <dl>
                    <div><dt>{t('Duration', 'Срок')}</dt><dd>{d(l.duration)}</dd></div>
                    <div><dt>{t('Entry', 'Поступление')}</dt><dd>{d(l.entry)}</dd></div>
                    <div><dt>{t('Tuition', 'Стоимость')}</dt><dd>{d(feeLabel(l.name, f.name))}</dd></div>
                  </dl>
                  <span className="go">{t('Program details', 'О программе')} <Icon name="arrow" size={16} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
