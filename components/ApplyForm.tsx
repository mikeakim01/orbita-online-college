'use client';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitApplication } from '@/app/actions';
import { site } from '@/lib/site';
import type { FormState } from '@/lib/types';

// Reads the yearly fee for a program from the text in lib/site.ts, so fees are edited in one place.
function yearlyFee(feeText: string, program: string) {
  const special = feeText.match(/\(([^$]+)\$([\d,]+)\)/);
  if (special && special[1].trim() === program) return '$' + special[2];
  const base = feeText.match(/\$([\d,]+)/);
  return base ? '$' + base[1] : feeText;
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send application'}
    </button>
  );
}

export default function ApplyForm({ initialProgram }: { initialProgram?: string }) {
  const first = site.programs.find((p) => p.slug === initialProgram) ?? site.programs[0];
  const [program, setProgram] = useState(first.name);
  const [level, setLevel] = useState(site.applyLevels[0]);
  const [statement, setStatement] = useState('');
  const [agree, setAgree] = useState(false);
  const [state, formAction] = useFormState(submitApplication, {} as FormState);

  const p = site.programs.find((x) => x.name === program) ?? first;
  const l = site.levels.find((x) => x.name === level) ?? site.levels[0];

  return (
    <div className="apply-grid">
      <form action={formAction} noValidate className="card apply-form">
        <h2 className="sub0">Your application</h2>
        <div className="field">
          <label htmlFor="f-program">Program</label>
          <select id="f-program" name="program" value={program} onChange={(e) => setProgram(e.target.value)}>
            {site.programs.map((x) => (
              <option key={x.slug} value={x.name}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-level">Level</label>
          <select id="f-level" name="level" value={level} onChange={(e) => setLevel(e.target.value)}>
            {site.applyLevels.map((x) => (
              <option key={x} value={x}>
                {x} ({site.levels.find((v) => v.name === x)?.duration})
              </option>
            ))}
          </select>
          <small className="muted">You need: {l.entry}.</small>
        </div>
        <div className="field">
          <label htmlFor="f-statement">Why do you want to study {p.name}? (optional)</label>
          <textarea id="f-statement" name="statement" rows={6} maxLength={1000} value={statement} onChange={(e) => setStatement(e.target.value)} aria-describedby="f-count" />
          <small id="f-count" className="muted">
            {statement.length} / 1000 characters. Two or three sentences about your goals and background is enough.
          </small>
        </div>
        <div className="field check">
          <input id="f-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <label htmlFor="f-agree">
            I confirm the information is true and I accept the <a href="/legal#terms">terms of use</a> and <a href="/legal#privacy">privacy policy</a>.
          </label>
        </div>
        {state.error && (
          <p role="alert" className="alert">
            {state.error}
          </p>
        )}
        <div aria-disabled={!agree} className={agree ? '' : 'gated'}>
          {agree ? <Submit /> : <button className="btn" type="button" disabled>Send application</button>}
        </div>
        {!agree && <small className="muted">Tick the box above to send your application.</small>}
      </form>

      <aside className="card apply-summary" aria-live="polite">
        <p className="eyebrow">{p.native}</p>
        <h2 className="sub0">{p.name}</h2>
        <p>{p.blurb}</p>
        <dl className="facts">
          <div>
            <dt>Level</dt>
            <dd>{l.name}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{l.duration}</dd>
          </div>
          <div>
            <dt>Entry requirement</dt>
            <dd>{l.entry}</dd>
          </div>
          <div>
            <dt>Tuition</dt>
            <dd>{yearlyFee(l.fee, p.name)} per year</dd>
          </div>
          <div>
            <dt>Next intake</dt>
            <dd>{site.intake}</dd>
          </div>
          <div>
            <dt>Application fee</dt>
            <dd>{site.appFee}</dd>
          </div>
        </dl>
        <h3 className="sub1">Core modules</h3>
        <ul className="ticks">
          {p.modules.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <h3 className="sub1">Typical careers</h3>
        <p className="muted">{p.careers}</p>
      </aside>
    </div>
  );
}
