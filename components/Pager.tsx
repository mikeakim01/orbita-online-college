import Link from 'next/link';

export const PAGE_SIZE = 15;

/** Builds a link that keeps the other filters and changes the page. */
export default function Pager({ base, page, total, params }: { base: string; page: number; total: number; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return base + (s ? '?' + s : '');
  };
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  return (
    <nav className="pager" aria-label="Pagination">
      <span>
        {from}-{to} of {total}
      </span>
      <span className="row">
        {page > 1 ? (
          <Link className="btn ghost sm" href={href(page - 1)}>
            Previous
          </Link>
        ) : (
          <span className="btn ghost sm" aria-disabled="true">
            Previous
          </span>
        )}
        <span>
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link className="btn ghost sm" href={href(page + 1)}>
            Next
          </Link>
        ) : (
          <span className="btn ghost sm" aria-disabled="true">
            Next
          </span>
        )}
      </span>
    </nav>
  );
}
