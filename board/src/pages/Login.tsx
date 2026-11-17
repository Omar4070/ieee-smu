import { useEffect, useState, type FormEvent } from 'react';
import { backend } from '../lib/backend';
import { byBoardOrder, initials } from '../lib/rules';
import type { Member } from '../lib/types';
import { hueAt } from '../store';
import { BrandMark, Segmented } from '../components/ui';

export function Login() {
  useEffect(() => { document.title = 'Sign in · Chapter board'; }, []);
  return (
    <main className="login">
      <div className="login-card">
        <div className="brand">
          <BrandMark />
          <span className="brand-name">Chapter board</span>
        </div>
        {backend.mode === 'demo' ? <DemoPicker /> : <LiveSignIn />}
      </div>
    </main>
  );
}

function DemoPicker() {
  const [people, setPeople] = useState<Member[]>([]);
  useEffect(() => { backend.load().then((d) => setPeople(d.members.filter((m) => m.active).sort(byBoardOrder))); }, []);
  return (
    <div className="panel">
      <h1>Who are you?</h1>
      <p className="lead">This is a demo: what you add is saved only in this browser. Pick who you are.</p>
      <div className="picker">
        {people.map((m, i) => (
          <button key={m.id} type="button" onClick={() => backend.signIn(m.id, '')}>
            <span className="avatar" style={{ ['--h' as string]: hueAt(i) }} aria-hidden="true">{initials(m.full_name)}</span>
            <span className="who">
              <b>{m.full_name}</b>
              <span>{m.role}{m.admin ? ' · admin' : ''}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LiveSignIn() {
  const [mode, setMode] = useState<'in' | 'first'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'in') {
        await backend.signIn(email, password);
      } else {
        if (password.length < 8) throw new Error('Choose a password of at least 8 characters.');
        const check = await backend.checkInvite(email, code);
        if (check === 'not_member') throw new Error('This email is not on the board list. Ask an admin to add you with this exact email.');
        if (check === 'already_linked') throw new Error('You already have an account: use “Sign in”, or ask an admin to reset your login.');
        if (check === 'bad_code') throw new Error('The invite code does not match. Check it with the admin who sent it.');
        await backend.signUp(email, password, code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h1>{mode === 'in' ? 'Sign in' : 'Choose your password'}</h1>
      <p className="lead">{mode === 'in' ? 'For the chapter’s board members.' : 'Use your email and the invite code an admin sent you.'}</p>
      <div className="login-switch">
        <Segmented
          label="Sign in or first time"
          value={mode}
          onChange={(v) => { setMode(v); setError(null); }}
          options={[{ value: 'in', label: 'Sign in' }, { value: 'first', label: 'First time here?' }]}
        />
      </div>
      <div className="fields">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode === 'first' && (
          <div className="field">
            <label htmlFor="code">Invite code</label>
            <input id="code" className="input code-input" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </div>
        )}
        <div className="field">
          <label htmlFor="password">{mode === 'in' ? 'Password' : 'New password'}</label>
          <input
            id="password" className="input" type="password" required minLength={mode === 'first' ? 8 : undefined}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            aria-describedby={mode === 'first' ? 'pw-hint' : undefined}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'first' && <span id="pw-hint" className="hint">At least 8 characters.</span>}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn primary wide" disabled={busy}>
          {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create my account'}
        </button>
        {mode === 'in' && <p className="small muted">Forgot your password? Ask an admin to reset your login.</p>}
      </div>
    </form>
  );
}
