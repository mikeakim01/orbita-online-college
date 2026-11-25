import { site } from '@/lib/site';
import { feeLabel, programmes } from '@/lib/catalog';
import PageHeader from '@/components/PageHeader';
import ProgramExplorer from '@/components/ProgramExplorer';

export const metadata = {
  title: 'Academic Programs',
  description: 'Certificate, Diploma, Bachelor, Master and PhD programs in ' + site.programs.map((p) => p.name).join(', ') + '. Compare duration, entry requirements and tuition.',
  alternates: { canonical: '/programs' },
  openGraph: { title: 'Academic programs at ' + site.name, url: '/programs', type: 'website' as const },
};

export default function Programs({ searchParams }: { searchParams: { faculty?: string; level?: string } }) {
  const rows = programmes().map((p) => ({ title: p.title, href: p.href, faculty: p.faculty.name, facultySlug: p.faculty.slug, level: p.level.name, duration: p.level.duration, entry: p.level.entry, fee: feeLabel(p.level.name, p.faculty.name) }));
  const faculty = site.programs.some((p) => p.slug === searchParams.faculty) ? (searchParams.faculty as string) : '';
  const level = site.applyLevels.find((l) => l.toLowerCase() === (searchParams.level ?? '').toLowerCase()) ?? '';
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Academic Programs' }]} kicker="Academic programs" title="Academic programs" lead={site.programsIntro} />
      <section className="band">
        <div className="container">
          <ProgramExplorer key={faculty + level} rows={rows} faculties={site.programs.map((p) => ({ slug: p.slug, name: p.name }))} levels={site.applyLevels} initialFaculty={faculty} initialLevel={level} />
          <p className="muted" style={{ marginTop: 28 }}>{site.feeNote}</p>
        </div>
      </section>
    </>
  );
}
