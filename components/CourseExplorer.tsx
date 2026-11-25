'use client';
import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import Scene, { type SceneKind } from './Art';

export type CourseRow = { slug: string; name: string; blurb: string; category: string; tier: string; weeks: number; fee: number; faculty: string; scene: SceneKind };

/** Search and filter the short-course catalogue. With `limit`, shows only the first few until the visitor searches or filters. */
export default function CourseExplorer({ rows, categories, limit, initialQuery = '', initialCategory = '', initialTier = '' }: { rows: CourseRow[]; categories: string[]; limit?: number; initialQuery?: string; initialCategory?: string; initialTier?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(initialCategory);
  const [tier, setTier] = useState(initialTier);
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((c) => (!cat || c.category === cat) && (!tier || c.tier === tier) && (!needle || (c.name + ' ' + c.blurb + ' ' + c.category).toLowerCase().includes(needle)));
  const filtering = Boolean(needle || cat || tier);
  const list = limit && !filtering ? shown.slice(0, limit) : shown;
  return (
    <div>
      <div className="pf">
        <div className="search">
          <label className="lab" htmlFor="ce-q" style={{ display: 'block', marginBottom: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Search courses</label>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={18} />
            <input id="ce-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cloud, networking, Python..." />
          </div>
        </div>
        <div className="grp">
          <span className="lab" id="ce-cat">Category</span>
          <div className="pills" role="group" aria-labelledby="ce-cat">
            <button type="button" className="pill" aria-pressed={!cat} onClick={() => setCat('')}>All</button>
            {categories.map((c) => (
              <button key={c} type="button" className="pill" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grp">
          <span className="lab" id="ce-tier">Level</span>
          <div className="pills" role="group" aria-labelledby="ce-tier">
            {['', 'Entry', 'Mid', 'Pro'].map((t) => (
              <button key={t || 'all'} type="button" className="pill" aria-pressed={tier === t} onClick={() => setTier(t)}>{t || 'All'}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="result-note" aria-live="polite">{filtering ? shown.length + ' of ' + rows.length + ' courses' : rows.length + ' courses'}</p>
      {list.length ? (
        <div className="cards four">
          {list.map((c) => (
            <Link key={c.slug} href={'/courses/' + c.slug} className="cc">
              <div className="img"><Scene kind={c.scene} /></div>
              <div className="txt">
                <span className="cat">{c.category} &middot; {c.tier}</span>
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
                <div className="meta"><span>{c.weeks} weeks</span><span>${c.fee.toLocaleString('en-US')}</span></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty"><h3>No courses match</h3><p>Try a different word or clear the filters.</p></div>
      )}
    </div>
  );
}
