/** The exam stages that can be recorded on a certificate and shown when its QR code is scanned. */
export const STAGES = [
  { key: 'entry', label: 'Entry exam' },
  { key: 'exam1', label: 'Exam 1' },
  { key: 'exam2', label: 'Exam 2' },
  { key: 'exam3', label: 'Exam 3' },
  { key: 'final', label: 'Final exam' },
] as const;

export type StageResult = { label: string; score: number };

/** Reads the stored results (a JSON array) into a safe list. */
export function readResults(v: unknown): StageResult[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ label: String((x as StageResult)?.label ?? ''), score: Number((x as StageResult)?.score) }))
    .filter((x) => x.label && Number.isFinite(x.score));
}
