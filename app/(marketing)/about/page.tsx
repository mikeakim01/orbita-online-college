import Link from 'next/link';
import { site } from '@/lib/site';
import PageHeader, { SectionHeading } from '@/components/PageHeader';
import Scene, { sceneFor } from '@/components/Art';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';

export const metadata = {
  title: 'About Us',
  description: 'About ' + site.name + ': our mission, approach to online learning, technology and recognition status.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About ' + site.name, description: 'Mission, approach and recognition status.', url: '/about', type: 'website' as const },
};

export default function About() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} kicker="About the institute" title={'About ' + site.name} lead="A technology-focused online institute for Information Technology, Cyber Security and Satellite Systems." />

      <section className="band">
        <div className="container split">
          <Reveal className="prose2">
            <h2>Who we are</h2>
            <p>{site.name} is an online institute offering short certificate courses, diplomas and Bachelor, Master and PhD programs in three faculties: {site.programs.map((p) => p.name).join(', ')}.</p>
            <p>Students apply, upload their documents, sit exams and receive certificates through one online portal. Our programs are designed for learners who want practical technical skills and a clear route from a first course to an advanced degree.</p>
            <h2>Mission</h2>
            <p>To make rigorous technology education accessible online, and to give every graduate a credential that can be verified by anyone, anywhere.</p>
            <h2>Vision</h2>
            <p>A connected generation of engineers, defenders and builders who understand the systems on the ground, in the cloud and in orbit.</p>
          </Reveal>
          <Reveal delay={120}>
            <figure className="frame" style={{ margin: 0 }}>
              <Scene kind="satellite" label="A satellite above Earth" />
              <figcaption>Technology beyond the horizon</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="container">
          <Reveal><SectionHeading kicker="How we teach" title="Educational philosophy and academic approach" /></Reveal>
          <Reveal>
            <div className="feats">
              {[
                ['laptop', 'Learn by doing', 'Courses and degrees centre on practical skills in software, networks, security and satellite communication.'],
                ['book', 'Clear pathways', 'Start with a certificate course and continue to a diploma, Bachelor, Master or PhD in the same faculty.'],
                ['shield', 'Fair assessment', 'Online exams are timed, graded on the server and limited to a fixed number of attempts.'],
                ['award', 'Credentials you can verify', 'Each certificate carries a unique ID and a public verification page.'],
                ['satellite', 'Technology and innovation', 'Our Satellite Systems faculty includes a remote ground-station lab.'],
                ['users', 'Open to adult learners', 'Entry requirements are listed for every level, and the short courses need no prior study.'],
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
          <Reveal><SectionHeading kicker="Faculties" title="Three areas of study" /></Reveal>
          <div className="fac-grid">
            {site.programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link href={'/faculties/' + p.slug} className="fac" style={{ height: '100%' }}>
                  <div className="img"><Scene kind={sceneFor(p.name, p.slug)} label={p.name} /></div>
                  <div className="txt"><h3>{p.name}</h3><p>{p.blurb}</p><span className="go">Explore faculty <Icon name="arrow" size={16} /></span></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="container two-col">
          <Reveal className="prose2">
            <h2>Recognition and accreditation</h2>
            <p>Current status: {site.accreditation.charAt(0).toUpperCase() + site.accreditation.slice(1)}</p>
            <p>We do not claim accreditation, registration or degree-awarding authority that we do not hold. Please read this status before you apply, and contact admissions if you need a recognition letter for an employer or another institution.</p>
            <p className="muted small">{site.disclaimer}</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 14 }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>Institute officers</h2>
              <div className="officer"><b>{site.signatory.name}</b><span className="muted">{site.signatory.title}</span></div>
              <div className="officer"><b>{site.registrar.name}</b><span className="muted">{site.registrar.title}</span></div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
