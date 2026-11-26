'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

type Mode = 'light' | 'dark';
const KEY = 'icon-theme';

/** Light is the default. The choice is stored in this browser and applied before first paint (see layout.tsx). */
export default function ThemeToggle({ className = 'iconbtn' }: { className?: string }) {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => {
    setMode(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  function flip() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    document.cookie = KEY + '=' + next + '; path=/; max-age=31536000; samesite=lax';
  }
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button type="button" className={className} onClick={flip} aria-label={label} title={label}>
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
