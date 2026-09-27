/** Validate the browser's public origin, not the reverse proxy's internal URL. */
export function isTrustedUploadOrigin(origin: string | null, requestUrl: string) {
  if (!origin || origin === 'null') return false;
  const allowed = new Set(['https://mainatural.com', 'https://www.mainatural.com']);
  for (const configured of [process.env.NEXT_PUBLIC_APP_URL, process.env.AUTH_URL, process.env.NEXTAUTH_URL]) {
    if (!configured) continue;
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' && !url.username && !url.password) allowed.add(url.origin);
    } catch { /* Ignore invalid configuration; never trust forwarded host headers. */ }
  }
  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(requestUrl);
      if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) allowed.add(url.origin);
    } catch { return false; }
  }
  return allowed.has(origin);
}
