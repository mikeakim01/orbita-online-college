import { cookies } from 'next/headers';
import { makeD, type Lang } from './ru';

export type { Lang };
export const LANG_COOKIE = 'icon-lang';

/** The visitor's language: Russian only when they chose it, English otherwise. */
export function getLang(): Lang {
  try {
    return cookies().get(LANG_COOKIE)?.value === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

/** t(english, russian) picks the text for the current language; d() translates data from lib/site.ts. */
export function i18n() {
  const lang = getLang();
  return { lang, t: (en: string, ru: string) => (lang === 'ru' ? ru : en), d: makeD(lang) };
}
