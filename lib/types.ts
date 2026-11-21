export type FormState = { error?: string; message?: string };
export type ExamResult = {
  error?: string;
  score?: number;
  correct?: number;
  total?: number;
  passed?: boolean;
  serial?: string;
};
