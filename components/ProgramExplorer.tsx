'use client';
import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { makeD, type Lang } from '@/lib/ru';

export type ProgrammeRow = { title: string; href: string; faculty: string; facultySlug: string; level: string; duration: string; entry: string; fee: string };

/** Filter degree programmes by faculty and qualification level without leaving the page. */
export default function ProgramExplorer({ rows, faculties, levels, initialFaculty = '', initialLevel = '', limit, lang = 'en' }: { lang?: Lang; rows: ProgrammeRow[]; faculties: { slug: string; name: string }[]; levels: string[]; initialFaculty?: string; initialLevel?: string; limit?: number }) {
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const d = makeD(lang);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [level, setLevel] = useState(initialLevel);
  const shown = rows.filter((r) => (!faculty || r.facultySlug === faculty) && (!level || r.level === level));
  const list = limit && !faculty && !level ? shown.slice(0, limit) : shown;
  return (
    <div>
      <div className="pf">
        <div className="grp">
          <span className="lab" id="pf-fac">{t('Faculty', 'Факультет')}</span>
          <div className="pills" role="group" aria-labelledby="pf-fac">
            <button type="button" className="pill" aria-pressed={!faculty} onClick={() => setFaculty('')}>{t('All', 'Все')}</button>
            {faculties.map((f) => (
              <button key={f.slug} type="button" className="pill" aria-pressed={faculty === f.slug} onClick={() => setFaculty(f.slug)}>{d(f.name)}</button>
            ))}
          </div>
        </div>
        <div className="grp">
          <span className="lab" id="pf-lev">{t('Qualification', 'Квалификация')}</span>
          <div className="pills" role="group" aria-labelledby="pf-lev">
            <button type="button" className="pill" aria-pressed={!level} onClick={() => setLevel('')}>{t('All', 'Все')}</button>
            {levels.map((l) => (
              <button key={l} type="button" className="pill" aria-pressed={level === l} onClick={() => setLevel(l)}>{d(l)}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="result-note" aria-live="polite">{lang === 'ru' ? shown.length + ' ' + (shown.length === 1 ? 'программа' : shown.length < 5 ? 'программы' : 'программ') : shown.length + ' program' + (shown.length === 1 ? '' : 's')}</p>
      {list.length ? (
        <div className="cards">
          {list.map((r) => (
            <Link key={r.href} href={r.href} className="pc">
              <div className="tags"><span className="badge violet">{d(r.level)}</span><span className="badge">{d(r.faculty)}</span></div>
              <h3>{lang === 'ru' ? d(r.level) + ': ' + d(r.faculty) : r.title}</h3>
              <dl>
                <div><dt>{t('Duration', 'Срок')}</dt><dd>{d(r.duration)}</dd></div>
                <div><dt>{t('Entry', 'Поступление')}</dt><dd>{d(r.entry)}</dd></div>
                <div><dt>{t('Tuition', 'Стоимость')}</dt><dd>{d(r.fee)}</dd></div>
              </dl>
              <span className="go">{t('Program details', 'О программе')} <Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty"><h3>{t('No programs match', 'Программ не найдено')}</h3><p>{t('Try another faculty or level.', 'Попробуйте другой факультет или уровень.')}</p></div>
      )}
    </div>
  );
}
