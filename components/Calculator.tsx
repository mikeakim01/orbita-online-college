'use client';
import { useState } from 'react';
import { Line } from './Calc.shared';
import { site } from '@/lib/site';

const BASE: Record<string, { annual: number; years: number }> = {
  Diploma: { annual: 2400, years: 2 },
  Bachelor: { annual: 3500, years: 4 },
  Master: { annual: 4000, years: 2 },
  PhD: { annual: 4500, years: 3 },
};
const SUPP: Record<string, Record<string, number>> = {
  Diploma: { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 500 },
  Bachelor: { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 600 },
  Master: { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 600 },
  PhD: { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 600 },
};
const FACULTIES = ['Information Technology', 'Cyber Security', 'Satellite Systems'];
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const courses = site.courses ?? [];

export default function Calculator() {
  const [program, setProgram] = useState('Information Technology');
  const [level, setLevel] = useState('Bachelor');
  const [courseName, setCourseName] = useState(courses[0]?.name ?? '');
  const [sch, setSch] = useState('0');
  const [plan, setPlan] = useState('term');

  const isCert = level === 'Certificate';
  const course = courses.find((c) => c.name === courseName) ?? courses[0];
  const b = isCert ? { annual: course?.fee ?? 0, years: 1 } : BASE[level];
  const annual = isCert ? b.annual : b.annual + SUPP[level][program];
  const tuition = annual * b.years;
  const schAmt = isCert ? 0 : (tuition * parseInt(sch, 10)) / 100;
  const net = tuition - schAmt;
  const adj = plan === 'full' ? -0.05 * net : plan === 'monthly' ? 0.03 * net : 0;
  const payable = net + adj;
  const n = isCert ? (plan === 'full' ? 1 : plan === 'term' ? 2 : 3) : plan === 'full' ? 1 : plan === 'term' ? b.years * 2 : b.years * 10;
  const appFee = 50;

  return (
    <div className="calc">
      <div className="card">
        <div className="field"><label htmlFor="c2">Level</label>
          <select id="c2" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Certificate">Certificate course (6 to 16 weeks)</option>
            <option value="Diploma">Diploma (2 years)</option>
            <option value="Bachelor">Bachelor (4 years)</option>
            <option value="Master">Master (2 years)</option>
            <option value="PhD">PhD (3 years)</option>
          </select></div>
        {isCert ? (
          <div className="field"><label htmlFor="c5">Course</label>
            <select id="c5" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
              {['Entry', 'Mid', 'Pro'].map((t) => (
                <optgroup key={t} label={t + ' level'}>
                  {courses.filter((c) => c.tier === t).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </optgroup>
              ))}
            </select></div>
        ) : (
          <div className="field"><label htmlFor="c1">Faculty</label>
            <select id="c1" value={program} onChange={(e) => setProgram(e.target.value)}>
              {FACULTIES.map((k) => <option key={k}>{k}</option>)}
            </select></div>
        )}
        {!isCert && (
          <div className="field"><label htmlFor="c3">Scholarship tier</label>
            <select id="c3" value={sch} onChange={(e) => setSch(e.target.value)}>
              <option value="0">No scholarship</option><option value="25">25% of tuition</option><option value="50">50% of tuition</option>
            </select></div>
        )}
        <div className="field"><label htmlFor="c4">Payment plan</label>
          <select id="c4" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="full">Pay in full (5% off)</option><option value="term">{isCert ? 'Two instalments' : 'Each semester'}</option><option value="monthly">{isCert ? 'Three monthly payments (3% charge)' : 'Monthly (3% charge)'}</option>
          </select></div>
      </div>
      <div className="card" aria-live="polite">
        <Line label={isCert ? 'Course fee' : 'Tuition per year'} value={usd(annual)} />
        <Line label={isCert ? 'Length of course' : 'Length of degree'} value={isCert ? (course?.weeks ?? 0) + ' weeks' : b.years + ' years'} />
        <Line label={isCert ? 'Total course fee' : 'Tuition for the degree'} value={usd(tuition)} />
        {!isCert && <Line label="Scholarship" value={schAmt ? '-' + usd(schAmt) : 'None'} />}
        <Line label="Payment plan adjustment" value={adj < 0 ? '-' + usd(-adj) : adj > 0 ? '+' + usd(adj) : 'None'} />
        <Line label="Application fee (once)" value={usd(appFee)} />
        <div className="total">{usd(payable + appFee)}</div>
        <p className="muted">{n === 1 ? '1 payment' : n + ' instalments'} of {usd(payable / n)}</p>
        <p className="muted small">Estimate in US dollars. Satellite Systems adds $600 per year ($500 for the Diploma) for lab infrastructure. Scholarships apply to Diploma and degree programs only.</p>
      </div>
    </div>
  );
}
