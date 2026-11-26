import Link from 'next/link';
import { site } from '@/lib/site';
import { feeLabel } from '@/lib/catalog';
import PageHeader, { FAQ, SectionHeading } from '@/components/PageHeader';
import FeeCalculator from '@/components/FeeCalculator';
import { i18n } from '@/lib/i18n';
import Reveal from '@/components/Reveal';

export const metadata = {
  title: 'Admissions',
  description: 'How to apply to ' + site.name + ': requirements, application process, tuition and fees, and frequently asked questions. Next intake ' + site.intake + '.',
  alternates: { canonical: '/admissions' },
  openGraph: { title: 'Admissions at ' + site.name, url: '/admissions', type: 'website' as const },
};

const process = (t: (a: string, b: string) => string) => [
  [t('Choose your program', 'Выберите программу'), t('Pick a faculty and a level: Bachelor, Master or PhD.', 'Выберите факультет и уровень: бакалавриат, магистратура или аспирантура.')],
  [t('Apply online', 'Подайте заявление онлайн'), t('Create an account and send the application. The application fee is ' + site.appFee + '.', 'Создайте аккаунт и отправьте заявление. Регистрационный сбор — ' + site.appFee + '.')],
  [t('Upload your documents', 'Загрузите документы'), t('The next screen lists the files your level needs. Add or replace them until a decision is made.', 'На следующем экране перечислены нужные файлы. Добавляйте или заменяйте их до принятия решения.')],
  [t('Admissions review', 'Рассмотрение заявления'), t('An officer checks your documents and decides. You see the result on your dashboard.', 'Сотрудник проверяет документы и принимает решение. Результат виден в личном кабинете.')],
  [t('Start learning', 'Начните учиться'), t('Once approved, sign in to your portal to take exams and earn certificates.', 'После зачисления войдите в кабинет, сдавайте экзамены и получайте сертификаты.')],
];

export default function Admissions() {
  const { lang, t, d } = i18n();
  const PROCESS = process(t);
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home', 'Главная'), href: '/' }, { label: t('Admissions', 'Поступление') }]} kicker={t('Next intake: ' + site.intake, 'Ближайший набор: ' + d(site.intake))} title={t('Admissions', 'Поступление')} lead={t('Everything you need to apply: requirements by level, the application process, tuition and answers to common questions.', 'Всё для подачи заявления: требования по уровням, порядок поступления, стоимость и ответы на частые вопросы.')}>
        <p style={{ marginTop: 26 }}><Link className="btn gold-solid lg" href="/apply">{t('Start your application', 'Подать заявление')}</Link></p>
      </PageHeader>

      <section className="band" id="process">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Application process', 'Порядок поступления')} title={t('How to apply', 'Как поступить')} /></Reveal>
          <Reveal>
            <ol className="proc">
              {PROCESS.map(([t, d], i) => (
                <li key={t}><span className="no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="requirements">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Entry requirements', 'Требования для поступления')} title={t('Requirements by qualification level', 'Требования по уровням квалификации')} /></Reveal>
          <Reveal>
            <div className="scroll-x">
              <table className="table2">
                <thead><tr><th>{t('Level', 'Уровень')}</th><th>{t('Duration', 'Срок')}</th><th>{t('Entry requirement', 'Требование')}</th><th>{t('Documents', 'Документы')}</th></tr></thead>
                <tbody>
                  {site.levels.map((l) => (
                    <tr key={l.name}>
                      <td><strong>{d(l.name)}</strong></td>
                      <td>{d(l.duration)}</td>
                      <td>{d(l.entry)}</td>
                      <td>{(site.docRules?.[l.name] ?? []).filter((x) => x.required).map((x) => d(x.label)).join(', ') || d('None required')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band" id="fees">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Tuition and fees', 'Стоимость обучения')} title={t('What it costs', 'Сколько это стоит')} lead={d(site.feeNote)} /></Reveal>
          <Reveal>
            <div className="scroll-x" style={{ marginBottom: 36 }}>
              <table className="table2">
                <thead><tr><th>{t('Level', 'Уровень')}</th>{site.programs.map((p) => <th key={p.slug}>{d(p.name)}</th>)}</tr></thead>
                <tbody>
                  {site.levels.map((l) => (
                    <tr key={l.name}><td><strong>{d(l.name)}</strong></td>{site.programs.map((p) => <td key={p.slug}>{d(feeLabel(l.name, p.name))}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <FeeCalculator lang={lang} />
          <p className="muted" style={{ marginTop: 16 }}>{t('Application fee: ' + site.appFee + '. Next intake: ' + site.intake + '.', 'Регистрационный сбор: ' + site.appFee + '. Ближайший набор: ' + d(site.intake) + '.')}</p>
        </div>
      </section>

      <section className="band alt" id="faq">
        <div className="container">
          <Reveal><SectionHeading kicker={t('Questions', 'Вопросы')} title={t('Frequently asked questions', 'Частые вопросы')} /></Reveal>
          <Reveal><FAQ items={site.faq.map((f) => ({ q: d(f.q), a: d(f.a) }))} /></Reveal>
          <p style={{ marginTop: 26 }}>{t('Still unsure? ', 'Остались вопросы? ')}<Link href="/contact">{t('Visit the contact page', 'Перейдите на страницу контактов')}</Link>.</p>
        </div>
      </section>
    </>
  );
}
