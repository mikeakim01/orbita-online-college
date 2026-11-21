'use client';
import { useState } from 'react';
import { Line } from './Calc.shared';

const BASE: Record<string, { annual: number; years: number }> = {
  Bachelor: { annual: 3500, years: 4 },
  Master: { annual: 4000, years: 2 },
  PhD: { annual: 4500, years: 3 },
};
const SUPP: Record<string, number> = { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 600 };
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function Calculator() {
  const [program, setProgram] = useState('Information Technology');
  const [level, setLevel] = useState('Bachelor');
  const [sch, setSch] = useState('0');
  const [plan, setPlan] = useState('term');

  const b = BASE[level];
  const annual = b.annual + SUPP[program];
  const tuition = annual * b.years;
  const schAmt = (tuition * parseInt(sch, 10)) / 100;
  const net = tuition - schAmt;
  const adj = plan === 'full' ? -0.05 * net : plan === 'monthly' ? 0.03 * net : 0;
  const payable = net + adj;
  const n = plan === 'full' ? 1 : plan === 'term' ? b.years * 2 : b.years * 10;
  const appFee = 50;

  return (
    <div className="calc">
      <div className="card">
        <div className="field"><label htmlFor="c1">Faculty</label>
          <select id="c1" value={program} onChange={(e) => setProgram(e.target.value)}>
            {Object.keys(SUPP).map((k) => <option key={k}>{k}</option>)}
          </select></div>
        <div className="field"><label htmlFor="c2">Level</label>
          <select id="c2" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Bachelor">Bachelor (4 years)</option>
            <option value="Master">Master (2 years)</option>
            <option value="PhD">PhD (3 years)</option>
          </select></div>
        <div className="field"><label htmlFor="c3">Scholarship tier</label>
          <select id="c3" value={sch} onChange={(e) => setSch(e.target.value)}>
            <option value="0">No scholarship</option><option value="25">25% of tuition</option><option value="50">50% of tuition</option>
          </select></div>
        <div className="field"><label htmlFor="c4">Payment plan</label>
          <select id="c4" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="full">Pay in full (5% off)</option><option value="term">Each semester</option><option value="monthly">Monthly (3% charge)</option>
          </select></div>
      </div>
      <div className="card" aria-live="polite">
        <Line label="Tuition per year" value={usd(annual)} />
        <Line label="Length of degree" value={b.years + ' years'} />
        <Line label="Tuition for the degree" value={usd(tuition)} />
        <Line label="Scholarship" value={schAmt ? '-' + usd(schAmt) : 'None'} />
        <Line label="Payment plan adjustment" value={adj < 0 ? '-' + usd(-adj) : adj > 0 ? '+' + usd(adj) : 'None'} />
        <Line label="Application fee (once)" value={usd(appFee)} />
        <div className="total">{usd(payable + appFee)}</div>
        <p className="muted">{n === 1 ? '1 payment' : n + ' instalments'} of {usd(payable / n)}</p>
        <p className="muted small">Estimate in US dollars. Satellite Systems adds $600 per year for lab infrastructure.</p>
      </div>
    </div>
  );
}
