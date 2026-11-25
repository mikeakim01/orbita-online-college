import Link from 'next/link';
import { site } from '@/lib/site';
import { CATEGORIES, categoryOf, courseSlug, courses, feeLabel, programmes } from '@/lib/catalog';
import Icon from '@/components/Icon';
import Scene, { sceneFor } from '@/components/Art';
import SpaceHero from '@/components/SpaceHero';
import Reveal from '@/components/Reveal';
import ProgramExplorer from '@/components/ProgramExplorer';
import CourseExplorer from '@/components/CourseExplorer';
import { FAQ, SectionHeading } from '@/components/PageHeader';

export const metadata = {
  title: { absolute: site.name + ': IT, Cyber Security and Satellite Systems online' },
  description: site.hero.text,
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.hero.text, url: '/', type: 'website' as const },
};

const STEPS = [
  ['Explore academic programs', 'Browse faculties, qualification levels and short courses.'],
  ['Submit your application', 'Choose a faculty and level, then send the online application.'],
  ['Receive admission information', 'Upload your documents and follow the decision on your dashboard.'],
  ['Access your learning environment', 'Sign in to your student portal for applications, exams and notices.'],
  ['Complete your academic journey', 'Pass your assessments and receive a certificate you can verify online.'],
];

const WHY = [
  ['laptop', 'Flexible online learning', 'Apply, upload documents, sit exams and manage your studies online, wherever you are.'],
  ['satellite', 'Technology-focused education', 'Three faculties built around Information Technology, Cyber Security and Satellite Systems.'],
  ['book', 'Structured academic pathways', 'Move from a short certificate course to a Diploma, Bachelor, Master or PhD.'],
  ['shield', 'Digital assessment', 'Timed online exams are graded on the server, with limited attempts for fairness.'],
  ['award', 'Verifiable certificates', 'Every certificate has its own ID and a public page where anyone can confirm it.'],
  ['file', 'Transparent admissions', 'See the documents you need, track your application and read the decision online.'],
] as const;

const PORTAL = ['Track your applications and their status', 'Upload documents and see when each one is verified', 'Take timed online exams with instant results', 'Download certificates with a public verification page', 'Receive notices about your application and documents'];

export default function Home() {
  const rows = programmes().map((p) => ({ title: p.title, href: p.href, faculty: p.faculty.name, facultySlug: p.faculty.slug, level: p.level.name, duration: p.level.duration, entry: p.level.entry, fee: feeLabel(p.level.name, p.faculty.name) }));
  const courseRows = courses().map((c) => ({ slug: courseSlug(c), name: c.name, blurb: c.blurb, category: categoryOf(c), tier: c.tier, weeks: c.weeks, fee: c.fee, faculty: c.faculty, scene: sceneFor(c.name, c.faculty) }));
  const ld = { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: site.name, description: site.hero.text, ...(site.email ? { email: site.email } : {}) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="hx" aria-labelledby="hx-h">
        <SpaceHero />
        <div className="container">
          <div className="hx-in">
            <span className="hx-badge"><i aria-hidden="true" /> {site.intake} intake</span>
            <h1 id="hx-h">Your Future. <em>Beyond Boundaries.</em></h1>
            <p className="sub">Discover a new dimension of education through technology-driven learning, innovative academic programs and globally connected opportunities.</p>
            <div className="hx-cta">
              <Link className="btn lg" href="/programs">Explore programs</Link>
              <Link className="btn lg gold-solid" href="/apply">Apply now</Link>
            </div>
            <div className="hx-facts">
              <div><b>{site.programs.length}</b><span>Faculties</span></div>
              <div><b>{site.applyLevels.length}</b><span>Levels</span></div>
              <div><b>{courses().length}</b><span>Short courses</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="intro-h">
        <div className="container split">
          <Reveal>
            <p className="kicker" style={{ color: 'var(--t-blue)' }}>About the institute</p>
            <h2 id="intro-h" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.025em', margin: '0 0 16px', maxWidth: '18ch' }}>Education Designed for the Future.</h2>
            <p className="lead">{site.name} is an online institute for people who want to work with the systems that run modern life: software, networks, security and satellites.</p>
            <ul className="checks">
              <li>Technology education from short courses to doctoral level</li>
              <li>Cyber security taught as a practical discipline</li>
              <li>Satellite systems, from orbits to ground operations</li>
              <li>Flexible digital learning and professional development</li>
            </ul>
            <p style={{ marginTop: 26 }}><Link className="more" href="/about">Read about the institute <Icon name="arrow" size={16} /></Link></p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}>
              <Scene kind="learn" label="Studying online: laptop, progress chart and graduation cap" />
              <figcaption>Study online, anywhere</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt" aria-labelledby="fac-h">
        <div className="container">
          <Reveal><SectionHeading kicker="Academic faculties" title="Three faculties. One institute." lead={site.programsIntro} action={<Link className="more" href="/faculties">All faculties <Icon name="arrow" size={16} /></Link>} /></Reveal>
          <div className="fac-grid">
            {site.programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={'/faculties/' + p.slug} className="fac" style={{ height: '100%' }}>
                  <div className="img"><Scene kind={sceneFor(p.name, p.slug)} label={p.name} /></div>
                  <div className="txt">
                    <h3>{p.name}</h3>
                    <p>{p.blurb}</p>
                    <span className="go">Explore faculty <Icon name="arrow" size={16} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="programs" aria-labelledby="prog-h">
        <div className="container">
          <Reveal><SectionHeading kicker="Academic programs" title="Find your qualification" lead="Every faculty is offered at five levels. Filter by faculty and level to compare duration, entry requirements and tuition." action={<Link className="more" href="/programs">All programs <Icon name="arrow" size={16} /></Link>} /></Reveal>
          <ProgramExplorer rows={rows} faculties={site.programs.map((p) => ({ slug: p.slug, name: p.name }))} levels={site.applyLevels} limit={6} />
        </div>
      </section>

      {courseRows.length > 0 && (
        <section className="band alt" id="courses" aria-labelledby="crs-h">
          <div className="container">
            <Reveal><SectionHeading kicker="Short courses" title={'Learn a skill in weeks: ' + courseRows.length + ' short courses'} lead="Entry, Mid and Pro courses in cloud, networking, blockchain, software, security and satellite systems." action={<Link className="more" href="/courses">Browse the catalogue <Icon name="arrow" size={16} /></Link>} /></Reveal>
            <CourseExplorer rows={courseRows} categories={CATEGORIES()} limit={8} />
            <p style={{ marginTop: 30, textAlign: 'center' }}><Link className="btn" href="/courses">View all {courseRows.length} courses</Link></p>
          </div>
        </section>
      )}

      <section className="band" aria-labelledby="why-h">
        <div className="container">
          <Reveal><SectionHeading kicker={'Why ' + site.short} title="Built for serious online learners" center /></Reveal>
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
          <Reveal><SectionHeading kicker="How online learning works" title="Five steps from curiosity to certificate" /></Reveal>
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
            <p className="kicker" style={{ color: 'var(--t-blue)' }}>Student experience</p>
            <h2 id="exp-h" style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-0.025em', margin: '0 0 16px', maxWidth: '18ch' }}>Your learning environment, in one portal.</h2>
            <p className="lead">After you apply, the student portal is where your studies happen. Everything listed here works today.</p>
            <ul className="checks">{PORTAL.map((x) => <li key={x}>{x}</li>)}</ul>
            <p style={{ marginTop: 28 }}><Link className="btn" href="/login">Access student portal</Link></p>
          </Reveal>
          <Reveal delay={120}>
            <div className="pv" aria-hidden="true">
              <aside><b>{site.short}</b><span className="on">Dashboard</span><span>My Applications</span><span>Exams</span><span>Certificates</span><span>Profile</span></aside>
              <div className="main">
                <div className="tilt">Welcome back</div>
                <div className="row3"><span>Applications</span><span>Exams</span><span>Certificates</span></div>
                <div className="bar"><i /></div>
                <div className="row3"><span>Documents</span><span>Notices</span><span>Settings</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band alt" id="admissions" aria-labelledby="adm-h">
        <div className="container two-col">
          <Reveal>
            <SectionHeading kicker="Admissions" title={'Applications open for ' + site.intake} lead={'Choose your faculty and level, send the online application (application fee ' + site.appFee + ') and upload your documents. You can follow the decision on your dashboard.'} />
            <FAQ items={site.faq.slice(0, 4)} />
            <p style={{ marginTop: 22 }}><Link className="more" href="/admissions">Full admissions information <Icon name="arrow" size={16} /></Link></p>
          </Reveal>
          <Reveal delay={120}>
            <aside className="aside-card on-dark">
              <h3>Next intake: {site.intake}</h3>
              <p>Application fee {site.appFee}. Documents are uploaded after you apply.</p>
              <Link className="btn gold-solid lg" href="/apply">Start your application</Link>
              <Link className="btn on-navy" href="/admissions#fees">See tuition and fees</Link>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-h">
        <SpaceHero />
        <div className="container">
          <h2 id="cta-h">Your Next Chapter Starts Here.</h2>
          <p>Take the next step towards a future shaped by knowledge, technology and innovation.</p>
          <Link className="btn lg gold-solid" href="/apply">Apply to {site.short}</Link>
        </div>
      </section>
    </>
  );
}
