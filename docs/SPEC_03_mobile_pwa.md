# Spec 03: works on iPhone + installable PWA (Mac unchanged)

Goal: the same site works as now on a Mac browser AND, on iPhone, can be "Added to Home Screen" and runs full-screen,
offline after the first visit, with touch and front-camera gesture control. Hosted on HTTPS (Vercel) at the site root.

## Files you may create/change
- `web/index.html` (main page), new `manifest.webmanifest` and `sw.js` **at the repository root** (so the service-worker scope covers `/web/`, `/frames/`, `/petals/`, `/vendor/`),
  root `index.html` (currently a meta-refresh redirect to `web/index.html`; it may stay a redirect, but it must also link the manifest and register the service worker, or you may make the PWA start_url `/web/index.html` directly — choose one and keep it consistent).
- Icons will be provided by the orchestrator at `icons/icon-180.png`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`. Reference them; do not create images.

## 1. Self-hosted libraries (already downloaded, use these instead of CDNs)
- `vendor/three/three.min.js`, `vendor/three/OrbitControls.js`
- `vendor/mediapipe-hands/hands.js`, `vendor/mediapipe-hands/camera_utils.js`, and the runtime files in the same folder
  (wasm/simd wasm, `.data`, `.binarypb`, `hand_landmark_lite.tflite`, `hand_landmark_full.tflite`).
  `locateFile` must point to `../vendor/mediapipe-hands/` (relative to web/index.html). No CDN URLs may remain.

## 2. PWA
- `manifest.webmanifest`: name "庭前花开花落", short_name "花开花落", display "standalone", orientation "any",
  background_color and theme_color = the night-sky colour (#050a1a), icons above (maskable one with purpose "maskable").
- In `<head>`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
  `apple-mobile-web-app-capable` = yes, `apple-mobile-web-app-status-bar-style` = black-translucent,
  `apple-mobile-web-app-title` = 花开花落, `<link rel="apple-touch-icon" href="…/icons/icon-180.png">`, `<link rel="manifest">`, theme-color.
- `sw.js`: versioned cache name (e.g. `peony-v1`).
  - install: precache the app shell = pages, manifest, icons, vendor/three/*, vendor/mediapipe-hands/hands.js + camera_utils.js + loader js, all `frames/*.webp`, all `petals/*.webp`.
  - fetch: cache-first for everything same-origin; on a cache miss fetch from network and store it (this caches whichever MediaPipe wasm/model variant the device actually uses — do not precache all of them, they are ~25 MB).
  - activate: delete old cache versions. Navigation requests fall back to the cached page when offline.
- Register the service worker only on `https:` or `localhost`.

## 3. Mobile layout & touch
- Respect safe areas: top nav, HUD and bottom panel use `env(safe-area-inset-*)` padding (notch + home indicator).
- Portrait phone: the plant layer is anchored bottom-centre with width ≈ 100vw (not 85vh height, which overflows a narrow screen); the sky fills above.
  Use the rule: plant size = min(85vh, 100vw) on all devices, so the Mac look is unchanged.
- Landscape phone: also must work (plant smaller, panel compact).
- Touch targets ≥ 44 px. Make the PIP camera preview smaller on phones (e.g. 110×80) and keep it out of the notch.
- **Swipe to scrub time**: a vertical drag anywhere on the scene (not on UI controls) changes T (drag up = forward, full screen height ≈ full timeline). Use pointer events, `touch-action: none` on the scene, and prevent iOS bounce/scroll (`overscroll-behavior: none`, no page scrolling at all). Swipe stops play mode like the slider does.
- Disable double-tap zoom and text selection on the UI.

## 4. Performance on phones
- Detect mobile (coarse pointer or small screen). On mobile: renderer pixel ratio ≤ 1.5 (Mac keeps ≤ 2), fewer fbm octaves in the cloud shader
  (e.g. via a `#define` or uniform), MediaPipe `modelComplexity: 0`, camera 320×240.
- Adaptive quality: measure average frame time over ~2 s; if fps < 40, step the pixel ratio down (min 0.75) — once, not oscillating.
- Pause rendering when the page is hidden (`visibilitychange`) and stop the camera stream then; resume when visible.

## 5. Camera on iPhone
- Use the front camera (`facingMode: 'user'`). Starting the camera must happen from the button tap (user gesture).
- `<video>` must have `playsinline` and `muted` (already there). Show a clear HUD message if permission is denied or the camera is unavailable.

## 6. Unchanged
Sky/clouds/light/plant/petals behaviour, the T timeline, gesture mapping (FIX_01), play/rewind, slider, lightsaber mode, and the Mac look.

You cannot run shell commands in this session; only read/write files. When done, reply with: files created/changed, how each section above was implemented, and anything uncertain.
