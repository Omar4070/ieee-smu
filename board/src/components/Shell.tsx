import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, House, ListChecks, LogOut, Moon, Presentation, RotateCcw, Smartphone, Sun, UsersRound } from 'lucide-react';
import { useStore } from '../store';
import { href } from '../lib/router';
import { firstName, isLate } from '../lib/rules';
import { resetDemo } from '../lib/demo-backend';
import { Avatar, BrandMark } from './ui';
import { Install } from './Install';

export function getTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function setTheme(t: 'light' | 'dark') {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('board-theme', t); } catch { /* the choice lasts this visit */ }
}

const NAV = [
  { id: 'home', label: 'This week', short: 'Week', icon: <House />, to: '/' },
  { id: 'tasks', label: 'Tasks', short: 'Tasks', icon: <ListChecks />, to: '/tasks' },
  { id: 'events', label: 'Events', short: 'Events', icon: <CalendarDays />, to: '/events' },
  { id: 'meetings', label: 'Meetings', short: 'Meetings', icon: <Presentation />, to: '/meetings' },
  { id: 'team', label: 'Team', short: 'Team', icon: <UsersRound />, to: '/team' },
];

export function Shell({ section, children }: { section: string; children: ReactNode }) {
  const { me, data, mode, signOut } = useStore();
  const myLate = data.tasks.filter((t) => t.owner_id === me.id && isLate(t)).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href={href('/')} aria-label="Chapter board, this week">
            <BrandMark />
            <span className="brand-name">Chapter board</span>
          </a>
          <nav className="nav" aria-label="Screens">
            {NAV.map((n) => (
              <a key={n.id} className="nav-item" href={href(n.to)} aria-current={section === n.id ? 'page' : undefined}>
                {n.icon}
                <span className="label-long">{n.label}</span>
                <span className="label-short" aria-hidden="true">{n.short}</span>
                {n.id === 'tasks' && myLate > 0 && (
                  <span className="count" title={`${myLate} of your tasks late`}>
                    <span aria-hidden="true">{myLate}</span>
                    <span className="sr-only">, {myLate} of yours late</span>
                  </span>
                )}
              </a>
            ))}
          </nav>
          <AccountMenu />
        </div>
      </header>
      <main className="canvas" id="main">
        {mode === 'demo' && (
          <p className="demo-note">
            Demo, saved only in this browser. You are {me.full_name}.{' '}
            <button type="button" onClick={signOut}>Switch person</button>
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

function AccountMenu() {
  const { me, mode, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <Install>{(install, installed) => (
    <div className="account" ref={wrap}>
      <button
        ref={button} type="button" className="account-button" aria-expanded={open} aria-controls="account-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar member={me} />
        <span className="account-name">{firstName(me.full_name)}</span>
        <span className="sr-only">: your account</span>
      </button>
      {open && (
        <div className="menu" id="account-menu">
          <div className="menu-who">
            <b>{me.full_name}</b>
            <span>{me.role}{me.admin ? ' · admin' : ''}</span>
          </div>
          <button type="button" onClick={() => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); setThemeState(t); }}>
            {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {!installed && (
            <button type="button" onClick={() => { setOpen(false); install(); }}>
              <Smartphone /> Add to home screen
            </button>
          )}
          {mode === 'demo' && (
            <button type="button" onClick={() => { resetDemo(); window.location.reload(); }}>
              <RotateCcw /> Reset the demo
            </button>
          )}
          <button type="button" onClick={signOut}>
            <LogOut /> {mode === 'demo' ? 'Switch person' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
    )}</Install>
  );
}

/** The title row every screen starts with. The h1 takes focus after a screen change. */
export function TitleRow({ title, sub, actions, back }: { title: string; sub?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (document.activeElement === document.body || document.activeElement?.closest('.topbar')) h1.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <div className="title-row">
      <div className="title-text">
        {back}
        <h1 ref={h1} tabIndex={-1}>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
