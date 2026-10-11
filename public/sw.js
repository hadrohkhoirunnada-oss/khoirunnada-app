const SHELL_CACHE = 'khoirunnada-shell-v2';
const STATIC_CACHE = 'khoirunnada-static-v2';
const SHELL_PAGES = ['/auth/login', '/login', '/app/qosidah'];

async function cacheStaticAsset(url) {
  const cache = await caches.open(STATIC_CACHE);
  if (await cache.match(url)) return;
  const response = await fetch(url);
  if (!response.ok) return;
  await cache.put(url, response.clone());

  if (response.headers.get('content-type')?.includes('text/css')) {
    const css = await response.text();
    const referenced = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
      .map((match) => new URL(match[1], url).href)
      .filter((asset) => new URL(asset).pathname.startsWith('/_next/static/'));
    await Promise.allSettled(referenced.map(cacheStaticAsset));
  }
}

async function cacheShellPage(path) {
  const response = await fetch(path, { credentials: 'omit' });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return;

  const cache = await caches.open(SHELL_CACHE);
  await cache.put(path, response.clone());
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^" ]+)"/g)]
    .map((match) => new URL(match[1], self.location.origin).href);
  await Promise.allSettled([...new Set(assets)].map(cacheStaticAsset));
}

async function cacheQosidahDetails(ids) {
  const cache = await caches.open(SHELL_CACHE);
  const safeIds = ids.filter((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)).slice(0, 150);
  for (let index = 0; index < safeIds.length; index += 6) {
    await Promise.allSettled(safeIds.slice(index, index + 6).map(async (id) => {
      const path = `/app/qosidah/${id}`;
      if (!(await cache.match(path))) await cacheShellPage(path);
    }));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(['/offline.html', '/offline-gated.html', '/logo-khoirunnada-192.png']);
    await Promise.allSettled(SHELL_PAGES.map(cacheShellPage));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('khoirunnada-') && ![SHELL_CACHE, STATIC_CACHE].includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_QOSIDAH_DETAILS' && Array.isArray(event.data.ids)) {
    event.waitUntil(cacheQosidahDetails(event.data.ids));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === '/connectivity.txt') return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response.ok ? response : (await cache.match(request)) || response;
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (request.mode !== 'navigate') return;

  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && SHELL_PAGES.includes(url.pathname)) {
        await cache.put(url.pathname, response.clone());
      }
      return response;
    } catch {
      if (url.pathname === '/app') {
        return Response.redirect(new URL('/auth/login', self.location.origin), 302);
      }
      const isQosidah = url.pathname === '/app/qosidah' || url.pathname.startsWith('/app/qosidah/');
      if (url.pathname.startsWith('/app/') && !isQosidah) {
        return (await cache.match('/offline-gated.html')) || Response.error();
      }
      return (await cache.match(url.pathname)) || (await cache.match('/offline.html')) || Response.error();
    }
  })());
});
