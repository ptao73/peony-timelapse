const CACHE_NAME = 'peony-v2';

const MATCH_OPTIONS = { ignoreSearch: true };
const NETWORK_TIMEOUT_MS = 4000;

const APP_SHELL = [
  '/',
  '/index.html',
  '/web/index.html',
  '/manifest.webmanifest',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/vendor/three/three.min.js',
  '/vendor/three/OrbitControls.js',
  '/vendor/mediapipe-hands/hands.js',
  '/vendor/mediapipe-hands/camera_utils.js',
  '/vendor/mediapipe-hands/hands_solution_packed_assets_loader.js',
  '/vendor/mediapipe-hands/hands_solution_simd_wasm_bin.js',
  '/vendor/mediapipe-hands/hands_solution_wasm_bin.js',
  '/frames/frame_01.webp',
  '/frames/frame_02.webp',
  '/frames/frame_03.webp',
  '/frames/frame_04.webp',
  '/frames/frame_05.webp',
  '/frames/frame_06.webp',
  '/frames/frame_07.webp',
  '/frames/frame_08.webp',
  '/frames/frame_09.webp',
  '/frames/frame_10.webp',
  '/frames/frame_11.webp',
  '/frames/frame_12.webp',
  '/petals/petal_1.webp',
  '/petals/petal_2.webp',
  '/petals/petal_3.webp',
  '/petals/petal_4.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch(() =>
        Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => null)))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function fetchWithTimeout(request, timeoutMs = NETWORK_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Network timeout'));
    }, timeoutMs);

    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function isNetworkFirstRequest(request, url) {
  if (request.mode === 'navigate' || request.destination === 'document') {
    return true;
  }
  const { pathname } = url;
  if (
    pathname.endsWith('/') ||
    pathname.endsWith('.html') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  ) {
    return true;
  }
  return false;
}

async function matchFallback(request, url) {
  const direct = await caches.match(request, MATCH_OPTIONS);
  if (direct) return direct;

  const byPath = await caches.match(url.pathname, MATCH_OPTIONS);
  if (byPath) return byPath;

  const fallbackUrls = ['/web/index.html', '/index.html', '/'];
  for (const fallbackUrl of fallbackUrls) {
    const cached = await caches.match(fallbackUrl, MATCH_OPTIONS);
    if (cached) return cached;
  }

  return Response.error();
}

async function networkFirst(request, url) {
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
      return networkResponse;
    }
    throw new Error(`Unexpected status: ${networkResponse ? networkResponse.status : 'none'}`);
  } catch (_) {
    return matchFallback(request, url);
  }
}

async function cacheFirst(request, url) {
  const cachedResponse = await caches.match(request, MATCH_OPTIONS);
  if (cachedResponse) {
    return cachedResponse;
  }

  const pathCached = await caches.match(url.pathname, MATCH_OPTIONS);
  if (pathCached) {
    return pathCached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (_) {
    if (request.mode === 'navigate' || request.destination === 'document') {
      return matchFallback(request, url);
    }
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirstRequest(request, url)) {
    event.respondWith(networkFirst(request, url));
  } else {
    event.respondWith(cacheFirst(request, url));
  }
});
