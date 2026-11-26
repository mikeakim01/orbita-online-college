import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';
import { i18n } from '@/lib/i18n';

export const metadata = {
  title: 'Faculties',
  description: 'The three faculties of ' + site.name + ': ' + site.programs.map((p) => p.name).join(', ') + '.',
  alternates: { canonical: '/faculties' },
  openGraph: { title: 'Faculties at ' + site.name, url: '/faculties', type: 'website' as const },
};

export default function Faculties() {
  const { t, d } = i18n();
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('Faculties', 'Факультеты') }]} kicker={t('Academic faculties', 'Факультеты')} title={t('Our faculties', 'Наши факультеты')} lead={d(site.programsIntro)} />
      <section className="band">
        <div className="container" style={{ display: 'grid', gap: 64 }}>
          {site.programs.map((p, i) => {
            return (
              <Reveal key={p.slug}>
                <div className="split" style={i % 2 ? { direction: 'rtl' } : undefined}>
                  <figure className="frame" style={{ margin: 0, direction: 'ltr' }}>
                    <Scene kind={sceneFor(p.name, p.slug)} label={d(p.name)} />
                  </figure>
                  <div style={{ direction: 'ltr' }}>
                    <p className="kicker" style={{ color: 'var(--t-blue)' }}>{t('Faculty', 'Факультет')}</p>
                    <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>{d(p.name)}</h2>
                    <p className="lead">{d(p.blurb)}</p>
                    <p className="muted">{t('Graduates work as ', 'Выпускники работают: ')}{d(p.careers)}</p>
                    <p className="muted small">{t('Available at ' + site.applyLevels.join(', ') + ' level.', 'Доступно на уровнях: ' + site.applyLevels.map(d).join(', ') + '.')}</p>
                    <p style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <Link className="btn" href={'/faculties/' + p.slug}>{t('Explore faculty', 'О факультете')}</Link>
                      <Link className="btn ghost" href={'/apply?program=' + p.slug}>{t('Apply', 'Подать заявление')} <Icon name="arrow" size={16} /></Link>
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
