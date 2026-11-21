'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { submitExam } from '@/app/actions';
import type { ExamResult } from '@/lib/types';

type Q = { id: string; prompt: string; options: string[] };

export default function ExamForm({
  code,
  questions,
  minutes,
  passMark,
}: {
  code: string;
  questions: Q[];
  minutes: number;
  passMark: number;
}) {
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [left, setLeft] = useState(minutes * 60);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const done = useRef(false);

  async function send(a: number[]) {
    if (done.current) return;
    done.current = true;
    setBusy(true);
    const r = await submitExam(code, a);
    setResult(r);
    setBusy(false);
  }

  useEffect(() => {
    if (result) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [result]);

  useEffect(() => {
    if (left <= 0 && !done.current) void send(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (result) {
    return (
      <div className="card" role="status">
        {result.error ? (
          <p className="alert">{result.error}</p>
        ) : (
          <>
            <h2>{result.passed ? 'You passed' : 'Not passed this time'}</h2>
            <p>
              You scored <strong>{result.score}%</strong> ({result.correct} of {result.total} correct). The pass mark is{' '}
              {passMark}%.
            </p>
            {result.passed && result.serial ? (
              <p>
                <Link className="btn" href={'/certificates/' + result.serial}>
                  View your certificate
                </Link>
              </p>
            ) : (
              <p className="muted">You can try again later. The attempt limit is 3 per exam every 24 hours.</p>
            )}
          </>
        )}
        <p>
          <Link href="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    );
  }

  const mm = String(Math.max(0, Math.floor(left / 60))).padStart(2, '0');
  const ss = String(Math.max(0, left % 60)).padStart(2, '0');
  const unanswered = answers.filter((x) => x < 0).length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send(answers);
      }}
    >
      <p className="timer" aria-live="off">
        Time left: <strong>{mm}:{ss}</strong>
      </p>
      {questions.map((q, i) => (
        <fieldset className="card q" key={q.id}>
          <legend>
            {i + 1}. {q.prompt}
          </legend>
          {q.options.map((o, j) => (
            <label className="opt" key={j}>
              <input
                type="radio"
                name={'q' + i}
                checked={answers[i] === j}
                onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))}
              />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <p className="muted">{unanswered === 0 ? 'All questions answered.' : unanswered + ' unanswered.'}</p>
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Marking...' : 'Submit exam'}
      </button>
    </form>
  );
}
