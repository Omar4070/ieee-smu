import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { backend } from './lib/backend';
import { useRoute } from './lib/router';
import type { Data, Member } from './lib/types';
import { StoreProvider, type ToastItem } from './store';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { Events } from './pages/Events';
import { Meetings } from './pages/Meetings';
import { MeetingDetail } from './pages/MeetingDetail';
import { Team } from './pages/Team';
import { BrandMark } from './components/ui';

type Phase =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'no-member' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: Data; me: Member; uid: string };

export function App() {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const uidRef = useRef<string | null>(null);

  const start = useCallback(async () => {
    try {
      const uid = await backend.session();
      if (uid && uid === uidRef.current) return; // same person, data already on screen
      uidRef.current = uid;
      if (!uid) return setPhase({ kind: 'signed-out' });
      setPhase({ kind: 'loading' });
      const data = await backend.load();
      const me = data.members.find((m) => m.auth_user_id === uid && m.active);
      if (!me) return setPhase({ kind: 'no-member' });
      setPhase({ kind: 'ready', data, me, uid });
    } catch (e) {
      setPhase({ kind: 'error', message: e instanceof Error ? e.message : 'The board could not be loaded.' });
    }
  }, []);

  useEffect(() => {
    start();
    // Supabase asks not to call it from inside its own callback: run the check right after.
    return backend.onAuthChange(() => setTimeout(start, 0));
  }, [start]);

  const pushToast = useCallback((t: ToastItem) => {
    setToasts((list) => [...list.slice(-2), t]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), t.tone === 'error' ? 7000 : 3500);
  }, []);

  const signOut = useCallback(async () => {
    await backend.signOut();
    uidRef.current = null;
    setPhase({ kind: 'signed-out' });
  }, []);

  let screen;
  if (phase.kind === 'loading') {
    screen = (
      <div className="center-screen" aria-busy="true">
        <BrandMark />
        <span>Loading…</span>
      </div>
    );
  } else if (phase.kind === 'signed-out') {
    screen = <Login />;
  } else if (phase.kind === 'no-member' || phase.kind === 'error') {
    const lost = phase.kind === 'no-member';
    screen = (
      <main className="center-screen">
        <div className="panel notice-card">
          <h1>{lost ? 'You are not on the board list' : 'The board could not be loaded'}</h1>
          <p>{lost ? 'This login is no longer linked to a board member. Ask an admin to check your entry on the Team screen.' : (phase as { message: string }).message}</p>
          <button type="button" className="btn" onClick={lost ? signOut : () => { uidRef.current = null; start(); }}>
            {lost ? 'Sign out' : 'Try again'}
          </button>
        </div>
      </main>
    );
  } else {
    screen = (
      <StoreProvider key={phase.uid} initial={phase.data} me={phase.me} onToast={pushToast} onSignOut={signOut}>
        <Screens />
      </StoreProvider>
    );
  }

  return (
    <>
      {screen}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.tone === 'error' ? <CircleAlert /> : <CircleCheck />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Screens() {
  const [first, second] = useRoute();
  switch (first) {
    case 'tasks': return <Tasks />;
    case 'events': return <Events />;
    case 'meetings': return second ? <MeetingDetail id={second} /> : <Meetings />;
    case 'team': return <Team />;
    default: return <Home />;
  }
}
