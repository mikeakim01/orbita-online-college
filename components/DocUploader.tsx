'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { recordDocument, deleteDocument } from '@/app/actions';
import { BUCKET, MAX_BYTES, ALLOWED_TYPES, prettySize, type DocSlot, type DocRow } from '@/lib/documents';

export default function DocUploader({ applicationId, userId, slots, docs, locked }: { applicationId: string; userId: string; slots: DocSlot[]; docs: DocRow[]; locked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fail = (key: string, msg: string) => setErrors((e) => ({ ...e, [key]: msg }));

  async function upload(slot: DocSlot, file: File | undefined) {
    if (!file) return;
    fail(slot.key, '');
    if (!ALLOWED_TYPES.includes(file.type)) return fail(slot.key, 'Use a PDF, JPG or PNG file.');
    if (file.size > MAX_BYTES) return fail(slot.key, 'The file is larger than 5 MB.');
    setBusy(slot.key);
    const clean = file.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
    const path = userId + '/' + applicationId + '/' + slot.key + '-' + Date.now() + '-' + clean;
    const { error } = await createClient().storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setBusy('');
      return fail(slot.key, 'Upload failed. Check your connection and try again.');
    }
    const res = await recordDocument({ applicationId, docType: slot.key, path, name: file.name, size: file.size });
    setBusy('');
    if (res.error) return fail(slot.key, res.error);
    router.refresh();
  }

  async function remove(id: string, key: string) {
    setBusy(key);
    const res = await deleteDocument(id);
    setBusy('');
    if (res.error) return fail(key, res.error);
    router.refresh();
  }

  return (
    <ul className="doclist">
      {slots.map((s) => {
        const mine = docs.filter((d) => d.doc_type === s.key);
        const have = mine.length > 0;
        return (
          <li key={s.key} className="card doc">
            <div className="doc-head">
              <h3>{s.label}</h3>
              <span className={'badge ' + (have ? 'approved' : s.required ? 'rejected' : 'submitted')}>{have ? 'uploaded' : s.required ? 'required' : 'optional'}</span>
            </div>
            <p className="muted small">{s.hint}</p>
            {mine.map((d) => (
              <p key={d.id} className="docfile">
                <a href={'/documents/file/' + d.id} target="_blank" rel="noopener noreferrer">{d.file_name}</a>
                <span className="muted small"> {prettySize(d.size_bytes)}</span>
                {!locked && (
                  <button type="button" className="btn sm ghost" onClick={() => remove(d.id, s.key)} disabled={busy === s.key}>
                    Remove
                  </button>
                )}
              </p>
            ))}
            {!locked && !have && (
              <div className="field">
                <label htmlFor={'f-' + s.key} className="sr-only">Choose file for {s.label}</label>
                <input id={'f-' + s.key} type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy === s.key} onChange={(e) => { upload(s, e.target.files?.[0]); e.target.value = ''; }} />
                {busy === s.key && <small className="muted">Uploading...</small>}
              </div>
            )}
            {errors[s.key] && <p role="alert" className="alert">{errors[s.key]}</p>}
          </li>
        );
      })}
    </ul>
  );
}
