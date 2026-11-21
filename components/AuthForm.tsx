'use client';
import { useFormState, useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/types';

export type Field = {
  name: string;
  label: string;
  type?: string; // text | email | password | textarea | select | checkbox
  autoComplete?: string;
  options?: string[];
  hint?: string;
  required?: boolean;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? 'Please wait...' : label}
    </button>
  );
}

export default function AuthForm({
  action,
  fields,
  submit,
  hidden,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  fields: Field[];
  submit: string;
  hidden?: Record<string, string>;
}) {
  const [state, formAction] = useFormState(action, {} as FormState);
  return (
    <form action={formAction} noValidate>
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => {
        const id = 'f-' + f.name;
        if (f.type === 'checkbox') {
          return (
            <div className="field check" key={f.name}>
              <input id={id} name={f.name} type="checkbox" />
              <label htmlFor={id}>{f.label}</label>
            </div>
          );
        }
        return (
          <div className="field" key={f.name}>
            <label htmlFor={id}>{f.label}</label>
            {f.type === 'select' ? (
              <select id={id} name={f.name} defaultValue={f.options?.[0]}>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea id={id} name={f.name} rows={5} maxLength={1000} />
            ) : (
              <input
                id={id}
                name={f.name}
                type={f.type ?? 'text'}
                autoComplete={f.autoComplete}
                aria-describedby={f.hint ? id + '-hint' : undefined}
              />
            )}
            {f.hint && (
              <small id={id + '-hint'} className="muted">
                {f.hint}
              </small>
            )}
          </div>
        );
      })}
      {state.error && (
        <p role="alert" className="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="okmsg">
          {state.message}
        </p>
      )}
      <Submit label={submit} />
    </form>
  );
}
