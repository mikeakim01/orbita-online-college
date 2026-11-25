'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

type T = { id: number; kind: 'success' | 'error' | 'info'; text: string };
const Ctx = createContext<(text: string, kind?: T['kind']) => void>(() => {});
export const useToast = () => useContext(Ctx);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const toast = useCallback((text: string, kind: T['kind'] = 'success') => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l.slice(-3), { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            <span className={'nt ' + (t.kind === 'success' ? 'ok' : t.kind === 'error' ? 'bad' : '')} style={{ width: 28, height: 28 }}>
              <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={16} />
            </span>
            <span style={{ flex: 1 }}>{t.text}</span>
            <button className="linkbtn" style={{ minHeight: 28 }} onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} aria-label="Dismiss">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/** Shows a one-off message carried in the address, for example ?toast=applied, then clears it. */
export function UrlToast({ messages }: { messages: Record<string, string> }) {
  const toast = useToast();
  const path = usePathname();
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('toast');
    if (key && messages[key]) {
      toast(messages[key], 'success');
      window.history.replaceState(null, '', path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return null;
}
