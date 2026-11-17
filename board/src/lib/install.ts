// Putting the app on a phone's home screen. Android and computers (Chrome, Edge) offer a real
// install prompt, which we keep for our own button; iPhones only have Safari's Share → Add to Home
// Screen, so for them the app shows the steps instead. Imported first in main.tsx so the prompt
// is never missed.

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as InstallPrompt;
  notify();
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  notify();
});

/** True when the app is already running from the home screen. */
export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

export const isIphone = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const canPrompt = () => deferred !== null;

/** Shows the browser's own install prompt; false when there is none (iPhone) or it was declined. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const d = deferred;
  deferred = null;
  await d.prompt();
  const { outcome } = await d.userChoice;
  notify();
  return outcome === 'accepted';
}

export function onInstallChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
