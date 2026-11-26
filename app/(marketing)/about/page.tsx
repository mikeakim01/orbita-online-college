import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader, { SectionHeading } from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';
import { i18n } from '@/lib/i18n';

export const metadata = {
  title: 'About Us',
  description: 'About ' + site.name + ': our mission, approach to online learning, technology and recognition status.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About ' + site.name, description: 'Mission, approach and recognition status.', url: '/about', type: 'website' as const },
};

export default function About() {
  const { t, d } = i18n();
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('About Us', 'Об институте') }]} kicker={t('About the institute', 'Об институте')} title={t('About ' + site.name, site.name + ': об институте')} lead={t('A technology-focused online institute for Information Technology, Cyber Security and Satellite Systems.', 'Онлайн-институт технологической направленности: информационные технологии, кибербезопасность и спутниковые системы.')} />

      <section className="band">
        <div className="container split">
          <Reveal className="prose2">
            <h2>{t('Who we are', 'Кто мы')}</h2>
            <p>{t(site.name + ' is an online institute offering Bachelor, Master and PhD programs in three faculties: ' + site.programs.map((p) => p.name).join(', ') + '.', site.name + ' — онлайн-институт, предлагающий программы бакалавриата, магистратуры и аспирантуры на трёх факультетах: ' + site.programs.map((p) => d(p.name)).join(', ') + '.')}</p>
            <p>{t('Students apply, upload their documents, sit exams and receive certificates through one online portal. Our programs are designed for learners who want practical technical skills and a clear route from a first degree to an advanced one.', 'Студенты подают заявления, загружают документы, сдают экзамены и получают сертификаты в одном онлайн-кабинете. Наши программы рассчитаны на тех, кто хочет получить практические технические навыки и понятный путь от первой степени к более высокой.')}</p>
            <h2>{t('Mission', 'Миссия')}</h2>
            <p>{t('To make rigorous technology education accessible online, and to give every graduate a credential that can be verified by anyone, anywhere.', 'Сделать серьёзное технологическое образование доступным онлайн и дать каждому выпускнику документ, который может проверить кто угодно и где угодно.')}</p>
            <h2>{t('Vision', 'Видение')}</h2>
            <p>{t('A connected generation of engineers, defenders and builders who understand the systems on the ground, in the cloud and in orbit.', 'Поколение инженеров, защитников и создателей, которые понимают системы на земле, в облаке и на орбите.')}</p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}>
              <Scene kind="satellite" label={t('A satellite above Earth', 'Спутник над Землёй')} />
              <figcaption>{t('Technology beyond the horizon', 'Технологии за горизонтом')}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="container">
          <Reveal><SectionHeading kicker={t('How we teach', 'Как мы учим')} title={t('Educational philosophy and academic approach', 'Образовательная философия и подход')} /></Reveal>
          <Reveal>
            <div className="feats">
              {[
                ['laptop', t('Learn by doing', 'Учимся на практике'), t('Degrees centre on practical skills in software, networks, security and satellite communication.', 'Программы строятся вокруг практических навыков в программировании, сетях, безопасности и спутниковой связи.')],
                ['book', t('Clear pathways', 'Понятный путь'), t('Start with a Bachelor and continue to a Master and PhD in the same faculty.', 'Начните с бакалавриата и продолжите в магистратуре и аспирантуре на том же факультете.')],
                ['shield', t('Fair assessment', 'Честная оценка'), t('Online exams are timed, graded on the server and limited to a fixed number of attempts.', 'Онлайн-экзамены ограничены по времени, проверяются на сервере и допускают ограниченное число попыток.')],
                ['award', t('Credentials you can verify', 'Документы, которые можно проверить'), t('Each certificate carries a unique ID and a public verification page.', 'У каждого сертификата есть уникальный номер и публичная страница проверки.')],
                ['satellite', t('Technology and innovation', 'Технологии и инновации'), t('Our Satellite Systems faculty teaches orbits, communications and ground operations.', 'Факультет спутниковых систем преподаёт орбиты, связь и наземные операции.')],
                ['users', t('Open to adult learners', 'Открыто для взрослых студентов'), t('Entry requirements are listed for every level.', 'Требования для поступления указаны для каждого уровня.')],
              ].map(([ic, t, d]) => (
                <div className="feat" key={t}>
                  <span className="ic"><Icon name={ic} size={22} /></span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Faculties', 'Факультеты')} title={t('Three areas of study', 'Три направления обучения')} /></Reveal>
          <div className="fac-grid">
            {site.programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={'/faculties/' + p.slug} className="fac" style={{ height: '100%' }}>
                  <div className="img"><Scene kind={sceneFor(p.name, p.slug)} label={d(p.name)} /></div>
                  <div className="txt"><h3>{d(p.name)}</h3><p>{d(p.blurb)}</p><span className="go">{t('Explore faculty', 'О факультете')} <Icon name="arrow" size={16} /></span></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {(site.accreditation || site.signatory.name || site.registrar.name) && (
        <section className="band alt">
          <div className="container two-col">
            {site.accreditation && (
              <Reveal className="prose2">
                <h2>{t('Recognition and accreditation', 'Признание и аккредитация')}</h2>
                <p>{site.accreditation.charAt(0).toUpperCase() + site.accreditation.slice(1)}</p>
                <p>{t('Please read this status before you apply, and contact admissions if you need a recognition letter for an employer or another institution.', 'Прочтите этот статус до подачи заявления; если вам нужно письмо о признании для работодателя или другого учебного заведения, свяжитесь с приёмной комиссией.')}</p>
              </Reveal>
            )}
            {(site.signatory.name || site.registrar.name) && (
              <Reveal delay={100}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <h2 style={{ fontSize: 20, margin: 0 }}>{t('Institute officers', 'Руководство института')}</h2>
                  {site.signatory.name && <div className="officer"><b>{site.signatory.name}</b><span className="muted">{t(site.signatory.title, 'Ректор')}</span></div>}
                  {site.registrar.name && <div className="officer"><b>{site.registrar.name}</b><span className="muted">{t(site.registrar.title, 'Регистратор')}</span></div>}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}
    </>
  );
}
