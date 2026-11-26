'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { makeD, type Lang } from '@/lib/ru';
import LangToggle from './LangToggle';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';

type Item = { label: string; href: string; note?: string };
type Menu = { label: string; href: string; items: Item[] };

function buildLinks(lang: Lang): (Menu | Item)[] {
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const d = makeD(lang);
  return [
    { label: t('Home', 'Главная'), href: '/' },
    { label: t('About Us', 'Об институте'), href: '/about' },
    {
      label: t('Faculties', 'Факультеты'),
      href: '/faculties',
      items: [...site.programs.map((p) => ({ label: d(p.name), href: '/faculties/' + p.slug, note: d(p.blurb) })), { label: t('All faculties', 'Все факультеты'), href: '/faculties' }],
    },
    {
      label: t('Academic Programs', 'Программы'),
      href: '/programs',
      items: [...site.applyLevels.map((l) => ({ label: d(l), href: '/programs?level=' + l.toLowerCase(), note: d(site.levels.find((x) => x.name === l)?.duration ?? '') })), { label: t('All programs', 'Все программы'), href: '/programs' }],
    },
    {
      label: t('Admissions', 'Поступление'),
      href: '/admissions',
      items: [
        { label: t('Requirements and process', 'Требования и порядок'), href: '/admissions#process' },
        { label: t('Tuition and fees', 'Стоимость обучения'), href: '/admissions#fees' },
        { label: t('Frequently asked questions', 'Частые вопросы'), href: '/admissions#faq' },
        { label: t('Start your application', 'Подать заявление'), href: '/apply' },
      ],
    },
    { label: t('Contact', 'Контакты'), href: '/contact' },
  ];
}
const isMenu = (x: Menu | Item): x is Menu => 'items' in x;

export default function SiteNav({ signedIn, lang }: { signedIn: boolean; lang: Lang }) {
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const LINKS = buildLinks(lang);
  const path = usePathname() ?? '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const overHero = path === '/' && !scrolled;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [path]);
  useEffect(() => {
    const away = (e: MouseEvent) => bar.current && !bar.current.contains(e.target as Node) && setOpen(null);
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setDrawer(false);
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const active = (href: string) => (href === '/' ? path === '/' : path === href.split(/[?#]/)[0] || path.startsWith(href.split(/[?#]/)[0] + '/'));

  return (
    <header ref={bar} className={'sn' + (overHero ? ' over' : '') + (drawer ? ' drawer-open' : '')}>
      <div className="sn-in">
        <Link href="/" className="sn-brand" aria-label={site.name + t(' home', ': главная')}>
          <Logo />
          <span>
            <strong>{site.short}</strong>
            <small>{t('Engineering Institute', 'Инженерный институт')}</small>
          </span>
        </Link>

        <nav className="sn-links" aria-label={t('Main', 'Основное меню')}>
          {LINKS.map((l) =>
            isMenu(l) ? (
              <div key={l.label} className={'sn-dd' + (open === l.label ? ' open' : '')} onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setOpen(l.label)} onMouseLeave={() => setOpen(null)}>
                <button type="button" className={active(l.href) ? 'on' : ''} aria-expanded={open === l.label} aria-haspopup="true" onClick={() => setOpen(open === l.label ? null : l.label)}>
                  {l.label}
                  <Icon name="chevron" size={14} />
                </button>
                <div className="sn-panel" role="menu">
                  {l.items.map((i) => (
                    <Link key={i.href} href={i.href} role="menuitem" onClick={() => setOpen(null)}>
                      <span>{i.label}</span>
                      {i.note && <small>{i.note}</small>}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className={active(l.href) ? 'on' : ''} aria-current={active(l.href) ? 'page' : undefined}>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="sn-actions">
          <ThemeToggle className="iconbtn sn-theme" />
          <LangToggle lang={lang} className="iconbtn sn-theme langbtn" />
          <Link className="sn-portal" href={signedIn ? '/dashboard' : '/login'}>
            {t('Student Portal', 'Личный кабинет')}
          </Link>
          <Link className="btn gold-solid sm" href="/apply">
            {t('Apply Now', 'Подать заявление')}
          </Link>
          <button type="button" className="sn-burger" aria-label={drawer ? t('Close menu', 'Закрыть меню') : t('Open menu', 'Открыть меню')} aria-expanded={drawer} aria-controls="sn-drawer" onClick={() => setDrawer(!drawer)}>
            <Icon name={drawer ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="sn-drawer" className="sn-drawer" hidden={!drawer}>
        <nav aria-label={t('Mobile', 'Мобильное меню')}>
          {LINKS.map((l) =>
            isMenu(l) ? (
              <details key={l.label}>
                <summary>{l.label}</summary>
                {l.items.map((i) => (
                  <Link key={i.href} href={i.href}>
                    {i.label}
                  </Link>
                ))}
              </details>
            ) : (
              <Link key={l.href} href={l.href} className={active(l.href) ? 'on' : ''}>
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="sn-drawer-cta">
          <Link className="btn ghost" href={signedIn ? '/dashboard' : '/login'}>
            {t('Student Portal', 'Личный кабинет')}
          </Link>
          <Link className="btn gold-solid" href="/apply">
            {t('Apply Now', 'Подать заявление')}
          </Link>
        </div>
      </div>
    </header>
  );
}
