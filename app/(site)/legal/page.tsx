import { site } from '@/lib/site';

export const metadata = { title: 'Privacy, terms and cookies' };

const sections = [
  {
    id: 'privacy',
    title: 'Privacy policy',
    items: [
      ['What we collect', 'When you apply or create an account we collect your name, email address, the program you choose, and any text you write in your application. We also keep your exam attempts and certificates.'],
      ['Why we use it', 'To assess your application, run your exams, issue certificates you can verify, and contact you about your studies. We do not sell your data.'],
      ['Who sees it', 'Admissions staff who need it, and service providers that process data for us (our hosting and database provider and our email sender), under written agreements.'],
      ['How long we keep it', 'Application records are kept for 12 months if you do not enrol. Certificates are kept so that they can be verified. Ask us to delete anything else.'],
      ['Your rights', 'You can ask to see, correct, export or delete your personal data, subject to record-keeping duties. Write to ' + site.email + '.'],
    ],
  },
  {
    id: 'terms',
    title: 'Terms of use',
    items: [
      ['Your account', 'Give accurate information and keep your password private. You are responsible for activity on your account. Do not share exam questions.'],
      ['Academic integrity', 'Work you submit must be your own. Cheating or impersonation can lead to removal and to your certificates being revoked.'],
      ['Fees', 'Fees are shown before you pay and are confirmed in your offer letter. Refunds follow the published refund policy.'],
      ['Certificates', 'A certificate shows that you passed the named exam on the date shown. Anyone can check it on our verification page. We may revoke a certificate that was obtained by cheating or issued in error.'],
      ['Liability and law', 'We teach with reasonable care but cannot promise a job or salary outcome. To the extent the law allows, our liability is limited to the fees you paid for the course in question. These terms are governed by ' + site.law + '.'],
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie notice',
    items: [
      ['Essential cookies only', 'We use only the cookies needed to keep you signed in and to protect forms. We do not use advertising or tracking cookies.'],
      ['Your choices', 'You can block or delete cookies in your browser. If you block essential cookies you will not be able to stay signed in.'],
    ],
  },
];

export default function Legal() {
  return (
    <>
      <div className="prose">
        <h1>Privacy, terms and cookies</h1>
        <p className="muted">Last updated 18 November 2026. Contact: {site.email}.</p>
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="legal">
            <h2>{s.title}</h2>
            {s.items.map(([h, b]) => (
              <div key={h}>
                <h3>{h}</h3>
                <p>{b}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
