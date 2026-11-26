import Link from 'next/link';
import { site } from '@/lib/site';
import { feeLabel, programmes } from '@/lib/catalog';
import { i18n } from '@/lib/i18n';
import Icon from '@/components/Icon';
import Scene, { sceneFor } from '@/components/Art';
import SpaceHero from '@/components/SpaceHero';
import Reveal from '@/components/Reveal';
import ProgramExplorer from '@/components/ProgramExplorer';
import { FAQ, SectionHeading } from '@/components/PageHeader';

export const metadata = {
  title: { absolute: site.name + ': IT, Cyber Security and Satellite Systems online' },
  description: site.hero.text,
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.hero.text, url: '/', type: 'website' as const },
};

const steps = (t: (a: string, b: string) => string) => [
  [t('Explore academic programs', 'Изучите программы'), t('Browse faculties and qualification levels.', 'Познакомьтесь с факультетами и уровнями образования.')],
  [t('Submit your application', 'Подайте заявление'), t('Choose a faculty and level, then send the online application.', 'Выберите факультет и уровень, затем отправьте онлайн-заявление.')],
  [t('Receive admission information', 'Получите решение о приёме'), t('Upload your documents and follow the decision on your dashboard.', 'Загрузите документы и следите за решением в личном кабинете.')],
  [t('Access your learning environment', 'Войдите в учебную среду'), t('Sign in to your student portal for applications, exams and notices.', 'Войдите в личный кабинет: заявления, экзамены и уведомления.')],
  [t('Complete your academic journey', 'Завершите обучение'), t('Pass your assessments and receive a certificate you can verify online.', 'Сдайте экзамены и получите сертификат, который можно проверить онлайн.')],
];

const why = (t: (a: string, b: string) => string) =>
  [
    ['laptop', t('Flexible online learning', 'Гибкое онлайн-обучение'), t('Apply, upload documents, sit exams and manage your studies online, wherever you are.', 'Подавайте заявление, загружайте документы, сдавайте экзамены и управляйте учёбой онлайн из любой точки мира.')],
    ['satellite', t('Technology-focused education', 'Технологическое образование'), t('Three faculties built around Information Technology, Cyber Security and Satellite Systems.', 'Три факультета: информационные технологии, кибербезопасность и спутниковые системы.')],
    ['book', t('Structured academic pathways', 'Понятный путь обучения'), t('Move from a Bachelor to a Master and on to a PhD in the same faculty.', 'Переходите от бакалавриата к магистратуре и аспирантуре на том же факультете.')],
    ['shield', t('Digital assessment', 'Цифровая оценка знаний'), t('Timed online exams are graded on the server, with limited attempts for fairness.', 'Онлайн-экзамены с ограничением по времени проверяются на сервере, число попыток ограничено.')],
    ['award', t('Verifiable certificates', 'Проверяемые сертификаты'), t('Every certificate has its own ID and a public page where anyone can confirm it.', 'У каждого сертификата есть собственный номер и публичная страница, где любой может его проверить.')],
    ['file', t('Transparent admissions', 'Прозрачное поступление'), t('See the documents you need, track your application and read the decision online.', 'Узнайте, какие документы нужны, отслеживайте заявление и читайте решение онлайн.')],
  ] as const;

const portal = (t: (a: string, b: string) => string) => [
  t('Track your applications and their status', 'Отслеживайте заявления и их статус'),
  t('Upload documents and see when each one is verified', 'Загружайте документы и видите, когда каждый проверен'),
  t('Take timed online exams with instant results', 'Сдавайте онлайн-экзамены с мгновенным результатом'),
  t('Download certificates with a public verification page', 'Скачивайте сертификаты с публичной страницей проверки'),
  t('Receive notices about your application and documents', 'Получайте уведомления о заявлении и документах'),
];

export default function Home() {
  const { lang, t, d } = i18n();
  const STEPS = steps(t);
  const WHY = why(t);
  const PORTAL = portal(t);
  const rows = programmes().map((p) => ({ title: p.title, href: p.href, faculty: p.faculty.name, facultySlug: p.faculty.slug, level: p.level.name, duration: p.level.duration, entry: p.level.entry, fee: feeLabel(p.level.name, p.faculty.name) }));
  const ld = { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: site.name, description: site.hero.text, ...(site.email ? { email: site.email } : {}) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hx" aria-labelledby="hx-h">
        <SpaceHero />
        <div className="container">
          <div className="hx-in">
            <span className="hx-badge"><i aria-hidden="true" /> {t(site.intake + ' intake', 'Набор: ' + d(site.intake))}</span>
            <h1 id="hx-h">{t('Your Future.', 'Ваше будущее.')} <em>{t('Beyond Boundaries.', 'Без границ.')}</em></h1>
            <p className="sub">{t('Discover a new dimension of education through technology-driven learning, innovative academic programs and globally connected opportunities.', 'Откройте новое измерение образования: обучение на основе технологий, современные программы и международные возможности.')}</p>
            <div className="hx-cta">
              <Link className="btn lg" href="/programs">{t('Explore programs', 'Изучить программы')}</Link>
              <Link className="btn lg gold-solid" href="/apply">{t('Apply now', 'Подать заявление')}</Link>
            </div>
            <div className="hx-facts">
              <div><b>{site.programs.length}</b><span>{t('Faculties', 'Факультета')}</span></div>
              <div><b>{site.applyLevels.length}</b><span>{t('Levels', 'Уровня')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="intro-h">
        <div className="container split">
          <Reveal>
            <p className="kicker" style={{ color: 'var(--t-blue)' }}>{t('About the institute', 'Об институте')}</p>
            <h2 id="intro-h" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.025em', margin: '0 0 16px', maxWidth: '18ch' }}>{t('Education Designed for the Future.', 'Образование, созданное для будущего.')}</h2>
            <p className="lead">{t(site.name + ' is an online institute for people who want to work with the systems that run modern life: software, networks, security and satellites.', site.name + ' — онлайн-институт для тех, кто хочет работать с системами, на которых держится современная жизнь: программами, сетями, безопасностью и спутниками.')}</p>
            <ul className="checks">
              <li>{t('Technology education from Bachelor to doctoral level', 'Технологическое образование от бакалавриата до аспирантуры')}</li>
              <li>{t('Cyber security taught as a practical discipline', 'Кибербезопасность как практическая дисциплина')}</li>
              <li>{t('Satellite systems, from orbits to ground operations', 'Спутниковые системы: от орбит до наземных операций')}</li>
              <li>{t('Flexible digital learning and professional development', 'Гибкое цифровое обучение и профессиональное развитие')}</li>
            </ul>
            <p style={{ marginTop: 26 }}><Link className="more" href="/about">{t('Read about the institute', 'Подробнее об институте')} <Icon name="arrow" size={16} /></Link></p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}>
              <Scene kind="learn" label={t('Studying online: laptop, progress chart and graduation cap', 'Онлайн-обучение: ноутбук, диаграмма прогресса и академическая шапочка')} />
              <figcaption>{t('Study online, anywhere', 'Учитесь онлайн, где угодно')}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt" aria-labelledby="fac-h">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Academic faculties', 'Факультеты')} title={t('Three faculties. One institute.', 'Три факультета. Один институт.')} lead={d(site.programsIntro)} action={<Link className="more" href="/faculties">{t('All faculties', 'Все факультеты')} <Icon name="arrow" size={16} /></Link>} /></Reveal>
          <div className="fac-grid">
            {site.programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={'/faculties/' + p.slug} className="fac" style={{ height: '100%' }}>
                  <div className="img"><Scene kind={sceneFor(p.name, p.slug)} label={d(p.name)} /></div>
                  <div className="txt">
                    <h3>{d(p.name)}</h3>
                    <p>{d(p.blurb)}</p>
                    <span className="go">{t('Explore faculty', 'О факультете')} <Icon name="arrow" size={16} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="programs" aria-labelledby="prog-h">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Academic programs', 'Программы')} title={t('Find your qualification', 'Найдите свою квалификацию')} lead={t('Every faculty is offered at three levels. Filter by faculty and level to compare duration, entry requirements and tuition.', 'Каждый факультет предлагает три уровня. Фильтруйте по факультету и уровню, чтобы сравнить срок, требования и стоимость.')} action={<Link className="more" href="/programs">{t('All programs', 'Все программы')} <Icon name="arrow" size={16} /></Link>} /></Reveal>
          <ProgramExplorer rows={rows} faculties={site.programs.map((p) => ({ slug: p.slug, name: p.name }))} levels={site.applyLevels} limit={9} lang={lang} />
        </div>
      </section>

      <section className="band" aria-labelledby="why-h">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Why ' + site.short, 'Почему ' + site.short)} title={t('Built for serious online learners', 'Создано для серьёзных онлайн-студентов')} center /></Reveal>
          <Reveal>
            <div className="feats">
              {WHY.map(([ic, t, d]) => (
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

      <section className="band navy on-dark" id="how" aria-labelledby="how-h">
        <div className="container">
          <Reveal><SectionHeading kicker={t('How online learning works', 'Как устроено онлайн-обучение')} title={t('Five steps from curiosity to certificate', 'Пять шагов от интереса до сертификата')} /></Reveal>
          <Reveal>
            <ol className="proc">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <span className="no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="band" aria-labelledby="exp-h">
        <div className="container split">
          <Reveal>
            <p className="kicker" style={{ color: 'var(--t-blue)' }}>{t('Student experience', 'Опыт студента')}</p>
            <h2 id="exp-h" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.025em', margin: '0 0 16px', maxWidth: '18ch' }}>{t('Your learning environment, in one portal.', 'Ваша учебная среда в одном кабинете.')}</h2>
            <p className="lead">{t('After you apply, the student portal is where your studies happen. Everything listed here works today.', 'После подачи заявления вся учёба проходит в личном кабинете. Всё перечисленное здесь работает уже сейчас.')}</p>
            <ul className="checks">{PORTAL.map((x) => <li key={x}>{x}</li>)}</ul>
            <p style={{ marginTop: 28 }}><Link className="btn" href="/login">{t('Access student portal', 'Войти в личный кабинет')}</Link></p>
          </Reveal>
          <Reveal delay={120}>
            <div className="pv" aria-hidden="true">
              <aside><b>{site.short}</b><span className="on">{t('Dashboard', 'Главная')}</span><span>{t('My Applications', 'Заявления')}</span><span>{t('Exams', 'Экзамены')}</span><span>{t('Certificates', 'Сертификаты')}</span><span>{t('Profile', 'Профиль')}</span></aside>
              <div className="main">
                <div className="tilt">{t('Welcome back', 'С возвращением')}</div>
                <div className="row3"><span>{t('Applications', 'Заявления')}</span><span>{t('Exams', 'Экзамены')}</span><span>{t('Certificates', 'Сертификаты')}</span></div>
                <div className="bar"><i /></div>
                <div className="row3"><span>{t('Documents', 'Документы')}</span><span>{t('Notices', 'Уведомления')}</span><span>{t('Settings', 'Настройки')}</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="admissions" aria-labelledby="adm-h">
        <div className="container two-col">
          <Reveal>
            <SectionHeading kicker={t('Admissions', 'Поступление')} title={t('Applications open for ' + site.intake, 'Приём заявлений: ' + d(site.intake))} lead={t('Choose your faculty and level, send the online application (application fee ' + site.appFee + ') and upload your documents. You can follow the decision on your dashboard.', 'Выберите факультет и уровень, отправьте онлайн-заявление (регистрационный сбор ' + site.appFee + ') и загрузите документы. Решение можно отслеживать в личном кабинете.')} />
            <FAQ items={site.faq.slice(0, 4).map((f) => ({ q: d(f.q), a: d(f.a) }))} />
            <p style={{ marginTop: 22 }}><Link className="more" href="/admissions">{t('Full admissions information', 'Всё о поступлении')} <Icon name="arrow" size={16} /></Link></p>
          </Reveal>
          <Reveal delay={120}>
            <aside className="aside-card on-dark">
              <h3>{t('Next intake: ', 'Ближайший набор: ')}{d(site.intake)}</h3>
              <p>{t('Application fee ' + site.appFee + '. Documents are uploaded after you apply.', 'Регистрационный сбор ' + site.appFee + '. Документы загружаются после подачи заявления.')}</p>
              <Link className="btn gold-solid lg" href="/apply">{t('Start your application', 'Подать заявление')}</Link>
              <Link className="btn on-navy" href="/admissions#fees">{t('See tuition and fees', 'Стоимость обучения')}</Link>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-h">
        <SpaceHero />
        <div className="container">
          <h2 id="cta-h">{t('Your Next Chapter Starts Here.', 'Ваша следующая глава начинается здесь.')}</h2>
          <p>{t('Take the next step towards a future shaped by knowledge, technology and innovation.', 'Сделайте следующий шаг к будущему, в котором главное — знания, технологии и инновации.')}</p>
          <Link className="btn lg gold-solid" href="/apply">{t('Apply to ' + site.short, 'Подать заявление в ' + site.short)}</Link>
        </div>
      </section>
    </>
  );
}
