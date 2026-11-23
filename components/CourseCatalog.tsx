'use client';
import { useState } from 'react';
import Link from 'next/link';
import { site } from '@/lib/site';

const TIERS: [string, string, string][] = [
  ['Entry', 'Entry level', 'No experience needed. Start here if you are new to the subject.'],
  ['Mid', 'Mid level', 'For learners who know the basics and want working skills.'],
  ['Pro', 'Pro level', 'For practitioners who want advanced, job-ready expertise.'],
];

export default function CourseCatalog() {
  const courses = site.courses;
  const [tier, setTier] = useState('Entry');
  if (!courses || !courses.length) return null;
  const info = TIERS.find((t) => t[0] === tier) ?? TIERS[0];
  return (
    <section className="section bordered" id="courses">
      <div className="container">
        <h2>Short courses and certificates</h2>
        <p className="lead">Fifteen certificate courses in three levels. Take one on its own, or build up from Entry to Pro.</p>
        <div className="tabs" role="group" aria-label="Course level">
          {TIERS.map(([k, label]) => (
            <button key={k} type="button" className={'btn sm' + (tier === k ? '' : ' ghost')} aria-pressed={tier === k} onClick={() => setTier(k)}>
              {label}
            </button>
          ))}
        </div>
        <p className="muted">{info[2]}</p>
        <div className="grid">
          {courses.filter((c) => c.tier === tier).map((c) => {
            const fac = site.programs.find((p) => p.slug === c.faculty);
            return (
              <article className="card" key={c.name}>
                <div className="kicker">{fac?.name}</div>
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
                <p className="muted small">
                  {c.weeks} weeks · ${c.fee.toLocaleString('en-US')} · Prerequisite: {c.prerequisite}
                </p>
                <Link className="btn sm" href={'/apply?program=' + c.faculty + '&level=Certificate&course=' + encodeURIComponent(c.name)}>
                  Apply for this course
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
