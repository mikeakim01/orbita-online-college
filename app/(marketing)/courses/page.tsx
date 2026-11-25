import { site } from '@/lib/site';
import { CATEGORIES, categoryOf, courseSlug, courses } from '@/lib/catalog';
import { sceneFor } from '@/components/Art';
import PageHeader from '@/components/PageHeader';
import CourseExplorer from '@/components/CourseExplorer';

export const metadata = {
  title: 'Short Courses',
  description: 'Search ' + courses().length + ' short courses in cloud, networking, blockchain, software, cyber security and satellite systems at ' + site.name + '.',
  alternates: { canonical: '/courses' },
  openGraph: { title: 'Short courses at ' + site.name, url: '/courses', type: 'website' as const },
};

export default function Courses({ searchParams }: { searchParams: { q?: string; category?: string; tier?: string } }) {
  const rows = courses().map((c) => ({ slug: courseSlug(c), name: c.name, blurb: c.blurb, category: categoryOf(c), tier: c.tier, weeks: c.weeks, fee: c.fee, faculty: c.faculty, scene: sceneFor(c.name, c.faculty) }));
  const cats = CATEGORIES();
  const cat = cats.includes(searchParams.category ?? '') ? (searchParams.category as string) : '';
  const tier = ['Entry', 'Mid', 'Pro'].includes(searchParams.tier ?? '') ? (searchParams.tier as string) : '';
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Short Courses' }]} kicker="Short courses" title="Short course catalogue" lead="Learn a focused skill in 6 to 16 weeks. Every course has an exam and a certificate you can verify online." />
      <section className="band">
        <div className="container">
          <CourseExplorer key={(searchParams.q ?? '') + cat + tier} rows={rows} categories={cats} initialQuery={searchParams.q ?? ''} initialCategory={cat} initialTier={tier} />
        </div>
      </section>
    </>
  );
}
