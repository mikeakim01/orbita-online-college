import { site } from '@/lib/site';

/** Helpers that turn the data in lib/site.ts into pages. Nothing here is invented: every value comes from site.ts. */

export type Course = NonNullable<typeof site.courses>[number];
export type Faculty = (typeof site.programs)[number];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const levelSlug = (l: string) => slugify(l);
export const courseSlug = (c: Course) => slugify(c.name);
export const courses = (): Course[] => site.courses ?? [];
export const courseBySlug = (s: string) => courses().find((c) => courseSlug(c) === s);
export const facultyBySlug = (s: string) => site.programs.find((p) => p.slug === s);
export const levelBySlug = (s: string) => site.levels.find((l) => levelSlug(l.name) === s);
export const facultyName = (slug: string) => site.programs.find((p) => p.slug === slug)?.name ?? '';

/** Short-course category, worked out from the course name. */
export function categoryOf(c: { name: string; faculty: string }): string {
  const n = c.name.toLowerCase();
  if (/blockchain|crypto|smart contract|digital-asset/.test(n)) return 'Blockchain';
  if (/cloud|devops|container/.test(n)) return 'Cloud';
  if (/network|routing|switching/.test(n)) return 'Networking';
  if (/web|python|code|software|data/.test(n)) return 'Software and data';
  if (c.faculty === 'satellite') return 'Satellite';
  if (c.faculty === 'cyber') return 'Cyber security';
  return 'IT foundations';
}
export const CATEGORIES = () => Array.from(new Set(courses().map(categoryOf))).sort();

/** Yearly fee for a degree level, read from the fee text in site.ts. */
export function yearlyFee(feeText: string, program: string) {
  const special = feeText.match(/\(([^$]+)\$([\d,]+)\)/);
  if (special && special[1].trim() === program) return '$' + special[2];
  const base = feeText.match(/\$([\d,]+)/);
  return base ? '$' + base[1] : feeText;
}
export const feeLabel = (levelName: string, program: string) => {
  const l = site.levels.find((x) => x.name === levelName);
  if (!l) return '';
  return l.fee.includes('per course') ? l.fee : yearlyFee(l.fee, program) + ' per year';
};

/** A degree programme is a faculty at a level, for example "Master in Cyber Security". */
export type Programme = { faculty: Faculty; level: (typeof site.levels)[number]; title: string; href: string };
export const programmes = (): Programme[] =>
  site.programs.flatMap((faculty) =>
    site.levels.map((level) => ({ faculty, level, title: level.name + ' in ' + faculty.name, href: '/programs/' + faculty.slug + '/' + levelSlug(level.name) })),
  );

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orbita-online-college.vercel.app').replace(/\/$/, '');
