'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { submitExam } from '@/app/actions';
import type { ExamResult } from '@/lib/types';
import Icon from './Icon';

type Q = { id: string; prompt: string; options: string[] };

export default function ExamForm({ code, questions, minutes, passMark, attemptsLeft }: { code: string; questions: Q[]; minutes: number; passMark: number; attemptsLeft?: number }) {
  const [started, setStarted] = useState(false);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [left, setLeft] = useState(minutes * 60);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const done = useRef(false);
  const dlg = useRef<HTMLDialogElement>(null);

  async function send(a: number[]) {
    if (done.current) return;
    done.current = true;
    setBusy(true);
    dlg.current?.close();
    const r = await submitExam(code, a);
    setResult(r);
    setBusy(false);
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    if (!started || result) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [started, result]);

  useEffect(() => {
    if (started && left <= 0 && !done.current) void send(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, started]);

  // Warn before leaving a running exam by accident.
  useEffect(() => {
    if (!started || result) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [started, result]);

  if (result) {
    return (
      <div className="card verify" role="status">
        {result.error ? (
          <>
            <div className="seal bad"><Icon name="alert" size={36} /></div>
            <p className="alert">{result.error}</p>
          </>
        ) : (
          <>
            <div className={'seal' + (result.passed ? '' : ' bad')}><Icon name={result.passed ? 'award' : 'close'} size={38} /></div>
            <h2>{result.passed ? 'You passed' : 'Not passed this time'}</h2>
            <p className="total" style={{ margin: 0 }}>{result.score}%</p>
            <p className="muted">{result.correct} of {result.total} correct. The pass mark is {passMark}%.</p>
            {result.passed && result.serial ? (
              <p><Link className="btn gold" href={'/certificates/' + result.serial}><Icon name="award" size={18} /> View your certificate</Link></p>
            ) : (
              <p className="muted">You can try again later. The attempt limit is 3 per exam every 24 hours.</p>
            )}
          </>
        )}
        <p style={{ margin: 0 }}><Link href="/exams">Back to exams</Link></p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card stack">
        <h2 style={{ margin: 0 }}>Before you begin</h2>
        <ul className="ticks" style={{ margin: 0 }}>
          <li>{questions.length} questions. You have {minutes} minutes once you press Begin.</li>
          <li>The pass mark is {passMark}%. Your answers are marked when you submit.</li>
          <li>When the timer reaches zero your answers are submitted automatically.</li>
          <li>You can attempt this exam 3 times every 24 hours{attemptsLeft !== undefined ? ' (' + attemptsLeft + ' left now)' : ''}.</li>
          <li>Do not close or reload the page during the exam.</li>
        </ul>
        <div><button className="btn" onClick={() => setStarted(true)} disabled={attemptsLeft === 0}><Icon name="clock" size={18} /> Begin exam</button></div>
        {attemptsLeft === 0 && <p className="alert" role="alert" style={{ margin: 0 }}>You have used all attempts for now. Try again in 24 hours.</p>}
      </div>
    );
  }

  const q = questions[cur];
  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, '0');
  const ss = String(Math.max(0, left % 60)).padStart(2, '0');
  const answered = answers.filter((x) => x >= 0).length;
  const unanswered = questions.length - answered;

  return (
    <div className="stack">
      <div className="exam-top">
        <div>
          <div className="small muted">Question {cur + 1} of {questions.length}</div>
          <div className="progress" style={{ width: 200, marginTop: 6 }} role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={questions.length} aria-label="Questions answered"><span style={{ width: (answered / questions.length) * 100 + '%' }} /></div>
        </div>
        <div className={'timer' + (left < 60 ? ' low' : '')} role="timer" aria-label="Time left"><Icon name="clock" size={22} /> {mm}:{ss}</div>
      </div>

      <div className="exam-layout">
        <form onSubmit={(e) => { e.preventDefault(); dlg.current?.showModal(); }} className="card">
          <fieldset className="q">
            <legend>{cur + 1}. {q.prompt}</legend>
            {q.options.map((o, j) => (
              <label className="opt" key={j}>
                <input type="radio" name={'q' + cur} checked={answers[cur] === j} onChange={() => setAnswers((a) => a.map((x, k) => (k === cur ? j : x)))} />
                <span>{o}</span>
              </label>
            ))}
          </fieldset>
          <div className="between" style={{ marginTop: 10 }}>
            <button type="button" className="btn ghost" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0}><Icon name="back" size={18} /> Previous</button>
            {cur < questions.length - 1 ? (
              <button type="button" className="btn" onClick={() => setCur((c) => c + 1)}>Next <Icon name="arrow" size={18} /></button>
            ) : (
              <button type="submit" className="btn cyan" disabled={busy}>{busy ? <span className="spin" /> : null} Review and submit</button>
            )}
          </div>
        </form>

        <aside className="card" aria-label="Question navigator">
          <h3 style={{ fontSize: 15 }}>Questions</h3>
          <div className="qnav">
            {questions.map((_, i) => (
              <button key={i} type="button" className={(answers[i] >= 0 ? 'done ' : '') + (i === cur ? 'cur' : '')} onClick={() => setCur(i)} aria-label={'Question ' + (i + 1) + (answers[i] >= 0 ? ', answered' : ', not answered')} aria-current={i === cur ? 'step' : undefined}>
                {i + 1}
              </button>
            ))}
          </div>
          <p className="muted small" style={{ margin: '12px 0 10px' }}>{unanswered === 0 ? 'All questions answered.' : unanswered + ' unanswered.'}</p>
          <button type="button" className="btn ghost block sm" onClick={() => dlg.current?.showModal()}>Review and submit</button>
        </aside>
      </div>

      <dialog ref={dlg} aria-labelledby="sub-t">
        <h3 id="sub-t">Submit your exam?</h3>
        <p className="muted">{unanswered === 0 ? 'You answered every question.' : 'You have ' + unanswered + ' unanswered question' + (unanswered === 1 ? '' : 's') + '.'} You cannot change your answers after submitting.</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost sm" onClick={() => dlg.current?.close()}>Keep working</button>
          <button type="button" className="btn sm" onClick={() => send(answers)} disabled={busy}>{busy ? 'Marking...' : 'Submit exam'}</button>
        </div>
      </dialog>
    </div>
  );
}
