import Link from 'next/link';
import { CERT_DESIGNS } from '@/lib/certStyles';
import { getDefaultDesign } from '@/lib/certSettings';
import { chooseDesign } from '@/app/admin-actions';

export const metadata = { title: 'Certificate designs (admin)' };
export const dynamic = 'force-dynamic';

export default async function AdminDesigns({ searchParams }: { searchParams: { saved?: string; error?: string } }) {
  const current = await getDefaultDesign();
  return (
    <>
      <div className="pagehead">
        <div>
          <p className="crumbs"><Link href="/admin">Admin</Link> / <span>Certificate designs</span></p>
          <h1>Certificate designs</h1>
          <p className="muted" style={{ margin: 0 }}>The selected design is used for every certificate PDF, including ones already issued. Previews use sample data.</p>
        </div>
      </div>
      {searchParams.saved && <p className="okmsg" role="status">Design saved. New downloads use it straight away.</p>}
      {searchParams.error && <p role="alert" className="alert">{searchParams.error}</p>}
      <div className="designs">
        {CERT_DESIGNS.map((d) => {
          const on = d.id === current;
          const land = d.orientation === 'Landscape';
          return (
            <article key={d.id} className={'card design' + (on ? ' on' : '')}>
              <div className={'design-frame ' + (land ? 'land' : 'port')}>
                <iframe title={d.name + ' preview'} src={'/admin/designs/preview?design=' + d.id + '#toolbar=0&navpanes=0&scrollbar=0&view=Fit'} loading="lazy" />
              </div>
              <h2 className="sub1">{d.name} {on && <span className="inuse">In use</span>}</h2>
              <p className="muted">{d.orientation} · {d.note}</p>
              <div className="design-actions">
                <form action={chooseDesign}>
                  <input type="hidden" name="design" value={d.id} />
                  <button className="btn" type="submit" disabled={on}>{on ? 'Selected' : 'Use this design'}</button>
                </form>
                <a className="btn ghost" href={'/admin/designs/preview?design=' + d.id} target="_blank" rel="noreferrer">Open full size</a>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
