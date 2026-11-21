import AuthForm from '@/components/AuthForm';
import { submitApplication } from '@/app/actions';
import { site } from '@/lib/site';

export const metadata = { title: 'Apply' };

export default function Apply() {
  return (
    <section className="section narrow">
      <div className="container">
        <h1>Start your application</h1>
        <p className="lead">
          Choose what you want to study. An admissions officer reviews every application. Application fee: {site.appFee}.
        </p>
        <div className="card">
          <AuthForm
            action={submitApplication}
            submit="Send application"
            fields={[
              { name: 'program', label: 'Program', type: 'select', options: site.programs.map((p) => p.name) },
              { name: 'level', label: 'Level', type: 'select', options: site.applyLevels },
              { name: 'statement', label: 'Why do you want to study this? (optional)', type: 'textarea' },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
