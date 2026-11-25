'use client';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitApplication } from '@/app/actions';
import { site } from '@/lib/site';
import type { FormState } from '@/lib/types';
import Scene, { sceneFor } from './Art';
import Icon from './Icon';

// Reads the yearly fee for a program from the text in lib/site.ts, so fees are edited in one place.
function yearlyFee(feeText: string, program: string) {
  const special = feeText.match(/\(([^$]+)\$([\d,]+)\)/);
  if (special && special[1].trim() === program) return '$' + special[2];
  const base = feeText.match(/\$([\d,]+)/);
  return base ? '$' + base[1] : feeText;
}

const STEPS = ['Faculty', 'Level', 'Your reason', 'Review'];
const TIERS = ['Entry', 'Mid', 'Pro'];

function Send({ ok }: { ok: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending || !ok}>
      {pending ? 'Sending...' : 'Send application'} <Icon name="arrow" size={18} />
    </button>
  );
}

export default function ApplyForm({ initialProgram, initialLevel, initialCourse }: { initialProgram?: string; initialLevel?: string; initialCourse?: string }) {
  const courses = site.courses ?? [];
  const startCourse = courses.find((c) => c.name === initialCourse);
  const first = site.programs.find((p) => p.slug === initialProgram) ?? site.programs.find((p) => p.slug === startCourse?.faculty) ?? site.programs[0];
  const startLevel = site.applyLevels.includes(initialLevel ?? '') ? (initialLevel as string) : startCourse ? 'Certificate' : 'Bachelor';

  const [step, setStep] = useState(initialProgram || startCourse ? (initialLevel || startCourse ? 1 : 1) : 0);
  const [program, setProgram] = useState(first.name);
  const [level, setLevel] = useState(site.applyLevels.includes(startLevel) ? startLevel : site.applyLevels[0]);
  const [courseName, setCourseName] = useState(startCourse?.name ?? '');
  const [tier, setTier] = useState<string>(startCourse?.tier ?? '');
  const [statement, setStatement] = useState('');
  const [agree, setAgree] = useState(false);
  const [state, formAction] = useFormState(submitApplication, {} as FormState);

  const p = site.programs.find((x) => x.name === program) ?? first;
  const l = site.levels.find((x) => x.name === level) ?? site.levels[0];
  const isCert = level === 'Certificate';
  const facultyCourses = courses.filter((c) => c.faculty === p.slug);
  const shown = facultyCourses.filter((c) => !tier || c.tier === tier);
  const course = isCert ? facultyCourses.find((c) => c.name === courseName) : undefined;
  const sentStatement = (course ? 'Course: ' + course.name + '\n' : '') + statement;
  const fee = course ? '$' + course.fee.toLocaleString('en-US') + ' per course' : l.fee.includes('per course') ? l.fee : yearlyFee(l.fee, p.name) + ' per year';
  const need = course ? course.prerequisite : l.entry;
  const go = (n: number) => {
    setStep(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form action={formAction} noValidate className="wiz" onKeyDown={(e) => { if (e.key === 'Enter' && step < 3 && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'BUTTON') e.preventDefault(); }}>
      <input type="hidden" name="program" value={program} />
      <input type="hidden" name="level" value={level} />
      <input type="hidden" name="statement" value={sentStatement} />

      <ol className="wiz-steps" aria-label="Application steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <button type="button" onClick={() => i < step && go(i)} disabled={i >= step} aria-label={'Step ' + (i + 1) + ': ' + s}>
              <span className="n">{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
              <span className="t">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="wiz-pane">
        {step === 0 && (
          <fieldset className="pickset">
            <legend><h2>Which faculty do you want to join?</h2></legend>
            <div className="pick-grid three">
              {site.programs.map((x) => (
                <label key={x.slug} className={'pick' + (x.name === program ? ' on' : '')}>
                  <input type="radio" name="faculty-pick" checked={x.name === program} onChange={() => { setProgram(x.name); setCourseName(''); }} />
                  <span className="pic"><Scene kind={sceneFor(x.name, x.slug)} /></span>
                  <span className="pt">{x.name}</span>
                  <span className="muted small">{x.blurb}</span>
                  <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <>
            <fieldset className="pickset">
              <legend><h2>Choose your level</h2></legend>
              <div className="pick-grid levels">
                {site.applyLevels.map((x) => {
                  const lv = site.levels.find((v) => v.name === x);
                  return (
                    <label key={x} className={'pick tight' + (x === level ? ' on' : '')}>
                      <input type="radio" name="level-pick" checked={x === level} onChange={() => { setLevel(x); setCourseName(''); }} />
                      <span className="pt">{x}</span>
                      <span className="muted small">{lv?.duration}</span>
                      <span className="small"><strong>{lv ? (lv.fee.includes('per course') ? lv.fee : yearlyFee(lv.fee, p.name) + ' / year') : ''}</strong></span>
                      <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {isCert && facultyCourses.length > 0 && (
              <fieldset className="pickset">
                <legend><h2>Pick a course <span className="muted small">(optional)</span></h2></legend>
                <div className="wiz-tabs" role="group" aria-label="Course level">
                  {['', ...TIERS].map((t) => (
                    <button key={t || 'all'} type="button" className={'btn sm ' + (tier === t ? '' : 'ghost')} aria-pressed={tier === t} onClick={() => setTier(t)}>
                      {t ? t + ' level' : 'All'}
                    </button>
                  ))}
                </div>
                <div className="pick-grid three">
                  {shown.map((c) => (
                    <label key={c.name} className={'pick' + (c.name === courseName ? ' on' : '')}>
                      <input type="radio" name="course-pick" checked={c.name === courseName} onChange={() => setCourseName(c.name)} onClick={() => c.name === courseName && setCourseName('')} />
                      <span className="pic short"><Scene kind={sceneFor(c.name, c.faculty)} /></span>
                      <span className="course-meta">
                        <span className={'badge ' + (c.tier === 'Entry' ? 'ok' : c.tier === 'Mid' ? 'violet' : 'gold')}>{c.tier}</span>
                        <span className="muted small">{c.weeks} weeks &middot; ${c.fee.toLocaleString('en-US')}</span>
                      </span>
                      <span className="pt">{c.name}</span>
                      <span className="tick" aria-hidden="true"><Icon name="check" size={16} /></span>
                    </label>
                  ))}
                </div>
                <p className="muted small">Not sure yet? Skip this and continue. You can click a chosen course again to clear it.</p>
              </fieldset>
            )}
          </>
        )}

        {step === 2 && (
          <div className="field">
            <label htmlFor="f-statement"><h2 style={{ margin: 0 }}>Why do you want to study {course ? course.name : p.name}?</h2></label>
            <p className="muted" style={{ margin: '4px 0 12px' }}>Optional. Two or three sentences about your goals and background is enough.</p>
            <textarea id="f-statement" rows={7} maxLength={1000} value={statement} onChange={(e) => setStatement(e.target.value)} aria-describedby="f-count" />
            <small id="f-count" className="muted">{statement.length} / 1000 characters</small>
          </div>
        )}

        {step === 3 && (
          <div className="review">
            <h2>Check and send</h2>
            <dl className="facts">
              <div><dt>Faculty</dt><dd>{p.name}</dd></div>
              <div><dt>Level</dt><dd>{level}</dd></div>
              {course && <div><dt>Course</dt><dd>{course.name}</dd></div>}
              <div><dt>Duration</dt><dd>{course ? course.weeks + ' weeks' : l.duration}</dd></div>
              <div><dt>Tuition</dt><dd>{fee}</dd></div>
              <div><dt>Application fee</dt><dd>{site.appFee}</dd></div>
              <div><dt>Next intake</dt><dd>{site.intake}</dd></div>
              <div><dt>You need</dt><dd>{need}</dd></div>
            </dl>
            {statement && <p className="quote">{statement}</p>}
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
          </div>
        )}
      </div>

      <div className="wiz-bar">
        <p className="sel small" aria-live="polite">
          <strong>{p.name}</strong> &middot; {level}{course ? ' &middot; ' + course.name : ''} &middot; {fee}
        </p>
        <div className="row">
          {step > 0 && <button type="button" className="btn ghost" onClick={() => go(step - 1)}>Back</button>}
          {step < 3 ? (
            <button type="button" className="btn" onClick={() => go(step + 1)}>Continue <Icon name="arrow" size={18} /></button>
          ) : (
            <Send ok={agree} />
          )}
        </div>
      </div>
    </form>
  );
}
