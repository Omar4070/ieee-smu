import { useEffect, useState, type ReactNode } from 'react';
import { canPrompt, isInstalled, isIphone, onInstallChange, promptInstall } from '../lib/install';
import { Dialog } from './ui';

/** Re-renders when the install prompt arrives or the app gets installed. */
function useInstallState() {
  const [, tick] = useState(0);
  useEffect(() => onInstallChange(() => tick((n) => n + 1)), []);
  return { installed: isInstalled(), prompt: canPrompt() };
}

/**
 * "Add to home screen": the browser's own prompt where there is one, otherwise the steps for
 * this phone. `children(start, installed)` renders the control that starts it; the steps dialog
 * lives here, so it stays open when that control disappears (a menu closing).
 */
export function Install({ children }: { children: (start: () => void, installed: boolean) => ReactNode }) {
  const { installed } = useInstallState();
  const [help, setHelp] = useState(false);

  async function start() {
    if (canPrompt()) await promptInstall();
    else setHelp(true);
  }

  const iphone = isIphone();
  const steps = {
    iphone: (
      <div key="iphone">
        <h3>On an iPhone</h3>
        <ol className="steps">
          <li>Open the board in <b>Safari</b>.</li>
          <li>Tap the <b>Share</b> button (the square with an arrow).</li>
          <li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
        </ol>
      </div>
    ),
    android: (
      <div key="android">
        <h3>On an Android phone</h3>
        <ol className="steps">
          <li>Open the board in <b>Chrome</b>.</li>
          <li>Tap <b>⋮</b> at the top right.</li>
          <li>Choose <b>Add to home screen</b> (or <b>Install app</b>), then <b>Install</b>.</li>
        </ol>
      </div>
    ),
  };

  return (
    <>
      {children(start, installed)}
      <Dialog open={help} title="Put the board on your home screen" onClose={() => setHelp(false)}>
        <div className="install-help">
          <p className="muted">It then opens like an app, full screen, with its own icon.</p>
          {iphone ? [steps.iphone, steps.android] : [steps.android, steps.iphone]}
        </div>
      </Dialog>
    </>
  );
}

const HINT_KEY = 'board-install-hint';

/** A one-time line on phones, on This week, until the app is installed or the hint dismissed. */
export function InstallHint() {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(HINT_KEY) === 'no'; } catch { return false; }
  });
  const [phone] = useState(() => matchMedia('(max-width: 760px)').matches);
  if (hidden || !phone) return null;
  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(HINT_KEY, 'no'); } catch { /* shows again next visit */ }
  };
  return (
    <Install>
      {(start, installed) => !installed && (
        <div className="install-hint">
          <img src="icons/icon-192.png" alt="" width="40" height="40" />
          <p>Put the board on your home screen: it opens like an app.</p>
          <div className="actions">
            <button type="button" className="btn small primary" onClick={start}>Add it</button>
            <button type="button" className="btn small ghost" onClick={dismiss}>Not now</button>
          </div>
        </div>
      )}
    </Install>
  );
}
