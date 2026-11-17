import { useEffect, useState } from 'react';

// Hash routes (#/events/42): one index.html serves every screen, on any host, with no
// server rules. The address bar still works for links and the Back button.

function parse(): string[] {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
}

export function useRoute(): string[] {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const href = (path: string) => `#${path.startsWith('/') ? path : `/${path}`}`;

export function go(path: string) {
  window.location.hash = href(path).slice(1);
}
