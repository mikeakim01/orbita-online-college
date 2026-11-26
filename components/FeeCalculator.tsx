'use client';
import { useState } from 'react';
import { Line } from './Calc.shared';
import { makeD, type Lang } from '@/lib/ru';

const BASE: Record<string, { annual: number; years: number }> = {
  Bachelor: { annual: 3500, years: 4 },
  Master: { annual: 4000, years: 2 },
  PhD: { annual: 4500, years: 3 },
};
const SUPP: Record<string, number> = { 'Information Technology': 0, 'Cyber Security': 0, 'Satellite Systems': 600 };
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/** Tuition estimate for a whole degree. Figures match the fee table on the same page. */
export default function FeeCalculator({ lang = 'en' }: { lang?: Lang }) {
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const d = makeD(lang);
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
  const yrs = (y: number) => d(y + ' years');

  return (
    <div className="calc">
      <div className="card">
        <div className="field"><label htmlFor="c2">{t('Level', 'Уровень')}</label>
          <select id="c2" value={level} onChange={(e) => setLevel(e.target.value)}>
            {Object.keys(BASE).map((k) => <option key={k} value={k}>{d(k)} ({yrs(BASE[k].years)})</option>)}
          </select></div>
        <div className="field"><label htmlFor="c1">{t('Faculty', 'Факультет')}</label>
          <select id="c1" value={program} onChange={(e) => setProgram(e.target.value)}>
            {Object.keys(SUPP).map((k) => <option key={k} value={k}>{d(k)}</option>)}
          </select></div>
        <div className="field"><label htmlFor="c3">{t('Scholarship tier', 'Стипендия')}</label>
          <select id="c3" value={sch} onChange={(e) => setSch(e.target.value)}>
            <option value="0">{t('No scholarship', 'Без стипендии')}</option><option value="25">{t('25% of tuition', '25% стоимости')}</option><option value="50">{t('50% of tuition', '50% стоимости')}</option>
          </select></div>
        <div className="field"><label htmlFor="c4">{t('Payment plan', 'План оплаты')}</label>
          <select id="c4" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="full">{t('Pay in full (5% off)', 'Оплата целиком (скидка 5%)')}</option><option value="term">{t('Each semester', 'По семестрам')}</option><option value="monthly">{t('Monthly (3% charge)', 'Ежемесячно (сбор 3%)')}</option>
          </select></div>
      </div>
      <div className="card" aria-live="polite">
        <Line label={t('Tuition per year', 'Стоимость за год')} value={usd(annual)} />
        <Line label={t('Length of degree', 'Срок обучения')} value={yrs(b.years)} />
        <Line label={t('Tuition for the degree', 'Стоимость всей программы')} value={usd(tuition)} />
        <Line label={t('Scholarship', 'Стипендия')} value={schAmt ? '-' + usd(schAmt) : t('None', 'Нет')} />
        <Line label={t('Payment plan adjustment', 'Корректировка по плану оплаты')} value={adj < 0 ? '-' + usd(-adj) : adj > 0 ? '+' + usd(adj) : t('None', 'Нет')} />
        <Line label={t('Application fee (once)', 'Регистрационный сбор (один раз)')} value={usd(appFee)} />
        <div className="total">{usd(payable + appFee)}</div>
        <p className="muted">{lang === 'ru' ? (n === 1 ? '1 платёж' : n + ' платежей') + ' по ' + usd(payable / n) : (n === 1 ? '1 payment' : n + ' instalments') + ' of ' + usd(payable / n)}</p>
        <p className="muted small">{t('Estimate in US dollars. Satellite Systems adds $600 per year for lab infrastructure. Scholarships apply to degree programs.', 'Оценка в долларах США. Спутниковые системы: дополнительно $600 в год на лабораторную инфраструктуру. Стипендии распространяются на программы степеней.')}</p>
      </div>
    </div>
  );
}
