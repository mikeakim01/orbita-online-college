'use client';
import { useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';

type Confirm = { title: string; body: string; label: string };

/**
 * Runs a server action from a form with a loading state, a toast on success or failure and,
 * when asked, a confirmation dialog first. Redirects thrown by the action still work.
 */
export default function ActionForm({
  action,
  success,
  confirm,
  children,
  className,
  resetOnSuccess,
}: {
  action: (f: FormData) => Promise<unknown> | unknown;
  success: string;
  confirm?: Confirm;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function run() {
    const fd = new FormData(ref.current!);
    start(async () => {
      try {
        const r = await action(fd);
        if (r && typeof r === 'object' && 'error' in r && (r as { error?: string }).error) {
          toast(String((r as { error: string }).error), 'error');
          return;
        }
        toast(success, 'success');
        if (resetOnSuccess) ref.current?.reset();
        router.refresh();
      } catch (e) {
        if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT')) throw e;
        toast('That did not work. Please try again.', 'error');
      }
    });
  }

  return (
    <>
      <form
        ref={ref}
        className={className ?? 'inline-form'}
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm) {
            setOpen(true);
            dlg.current?.showModal();
          } else run();
        }}
      >
        <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {children}
        </fieldset>
      </form>
      {confirm && (
        <dialog ref={dlg} aria-labelledby={open ? 'dlg-t' : undefined} onClose={() => setOpen(false)}>
          <h3 id="dlg-t">{confirm.title}</h3>
          <p className="muted">{confirm.body}</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost sm" onClick={() => dlg.current?.close()}>
              Cancel
            </button>
            <button
              type="button"
              className="btn danger sm"
              onClick={() => {
                dlg.current?.close();
                run();
              }}
            >
              {confirm.label}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
