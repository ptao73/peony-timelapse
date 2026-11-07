# Fix 04: service worker update strategy + offline fallback bug (sw.js only)

Review findings by the orchestrator:
1. **Stale app after updates.** Everything, including the HTML pages, is cache-first and the cache name never changes,
   so an installed iPhone app would keep showing the first version forever.
2. **Broken offline fallback.** `caches.match(a) || caches.match(b) || caches.match(c)` always returns the first Promise
   (a Promise is truthy), even when it resolves to undefined → respondWith(undefined) → network error offline.

Required changes (sw.js only; keep everything else):
- Bump `CACHE_NAME` to `peony-v2`.
- **Network-first for navigations and HTML** (`request.mode === 'navigate'` or path ends with `.html` or `/`, plus `/manifest.webmanifest` and `/sw.js`-adjacent pages):
  try the network (with a ~4 s timeout); on success update the cache and return it; on failure return the cached copy
  (match the request, then `/web/index.html`, then `/index.html`, then `/`, resolved sequentially with await, not with `||` on Promises).
- **Cache-first for everything else** (images, js, wasm, data, tflite, icons), storing network responses on a miss, as now.
- `ignoreSearch: true` when matching, so `?v=` query strings don't defeat the cache.
- Keep `skipWaiting()` + `clients.claim()` and old-cache cleanup.

You cannot run shell commands in this session; only read/write files. Reply with exactly what you changed.
