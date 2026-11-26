'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/** Switches between English and Russian. The choice is a cookie, so the server renders the right language. */
export default function LangToggle({ lang, className = 'iconbtn langbtn' }: { lang: 'en' | 'ru'; className?: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  const next = lang === 'ru' ? 'en' : 'ru';
  const label = lang === 'ru' ? 'Switch to English' : 'Переключить на русский';
  function flip() {
    document.cookie = 'icon-lang=' + next + '; path=/; max-age=31536000; samesite=lax';
    document.documentElement.lang = next;
    start(() => router.refresh());
  }
  return (
    <button type="button" className={className} onClick={flip} aria-label={label} title={label} lang={next}>
      {next === 'ru' ? 'RU' : 'EN'}
    </button>
  );
}
