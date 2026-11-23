import { site } from '@/lib/site';

export const BUCKET = 'application-docs';
export const MAX_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export type DocSlot = { key: string; label: string; hint: string; required: boolean };
export type DocRow = { id: string; doc_type: string; file_name: string; size_bytes: number; created_at: string; verified?: boolean };

export const slotsFor = (level: string): DocSlot[] => site.docRules?.[level] ?? [];

/** Which required documents are still missing for a level. */
export function missingFor(level: string, uploaded: string[]) {
  return slotsFor(level).filter((s) => s.required && !uploaded.includes(s.key));
}

export const prettySize = (n: number) => (n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
