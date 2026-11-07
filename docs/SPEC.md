# 庭前花开花落，天上云卷云舒: build spec (v1)

Owner/reviewer: Claude (orchestrator). Builder: Antigravity. Images: Codex (in progress).

## Goal
A single web page `web/index.html` in which ONE time variable **T ∈ [0, 1]** drives everything:
midnight (T=0) → dawn (T=0.5) → morning (T=1). Opening the hand moves time forward, closing it
plays time exactly backwards. Every visual must be a **deterministic function of T** (plus at most a
slow, subtle wall-clock drift for life), so reversing T visibly reverses the scene.

## Files (relative to project root `~/peony-timelapse`)
- `frames/frame_01.png` … `frames/frame_12.png`: the plant (2 peonies + small bud + leaves), **transparent PNG, 1254×1254**,
  frame 1 = tight buds, frame 5 = half open, frame 12 = full bloom. **All 12 exist now.** If one fails to load,
  use the nearest loaded frame and show the missing file name in the HUD (do not fail silently, do not crash).
- `petals/petal_1.png` … `petal_4.png`: single fallen petals, transparent PNG, ≤256 px, petal base at the lower end. **All exist now.**
- `web/base_reference.html`: the current page. Reuse its lightsaber mode, MediaPipe hand code, HUD and UI style as-is.
- Output: `web/index.html` (+ optional `web/*.js`). Load frames as `../frames/...`, petals as `../petals/...`.

## Timeline (agreed with the user, follows natural radiation-fog cycle)
| T | clock label | sky & light | clouds/mist | flowers (frame index) |
|---|---|---|---|---|
| 0.00 | 00:00 午夜 | zenith ≈#050a1a, horizon ≈#0d1530; stars; moon upper-right with halo; cool blue moonlight | thin ground mist band low on screen | frame 1 (bud) |
| 0.00–0.50 | → 05:30 | stars fade out by T≈0.4; horizon slowly turns pink-orange | mist thickens and rises into clouds | frames 1→5 |
| 0.50 | 05:30 黎明 | horizon ≈#f08a5d/#ffb07a glow | clouds **thickest**; undersides lit pink-orange from below | frame 5 (half open) |
| 0.50–0.85 | → 07:00 | sun rises upper-left; sunbeams (god rays) break through cloud gaps | clouds break up and dissipate | frames 5→12 |
| 0.85–1.00 | 07:00 → 08:00 清晨 | zenith ≈#6fa8dc, horizon ≈#fbe3b0; warm golden diagonal beam from upper-left | nearly clear | frame 12 + **3–5 petals falling** |

Use smooth easing between anchors; no visible jumps anywhere.

## Layers (back → front)
1. **Sky** (WebGL fragment shader, full screen): gradient by T, stars (fade), moon (fade/sink), sun glow.
2. **Clouds** (same or second shader): fbm noise; coverage/density/height/colour are functions of T per the table;
   lit by moon (night), orange-pink underside (dawn), white (morning). Slow drift with wall clock is fine.
3. **Light**: god rays from the sun (upper-left), visible mainly T 0.55–1, strongest through cloud gaps; moonlight T 0–0.4.
4. **Plant**: bottom-centre, height ≈ 85vh, aspect 1:1.
   - Cross-fade between the two neighbouring frames **in a WebGL shader with premultiplied alpha**:
     `out = mix(texA, texB, f)` per pixel, including alpha. Do NOT draw A opaque + B with alpha on top: with transparent
     backgrounds that causes ghosting and a pop when the silhouette changes.
   - Frame position: T∈[0,0.5] → frame 1→5; T∈[0.5,0.85] → frame 5→12; T≥0.85 → frame 12.
   - Relight the plant from T: night ≈ 0.35 brightness with blue tint; dawn warm orange; morning ≈ 1.05 warm white.
     Add a soft rim/edge highlight on the sun side in the morning if cheap.
5. **Ground mist in front of the stems** at night/dawn (adds depth), gone by morning.
6. **Falling petals** (T 0.85→1): 3–5 petals detach near the flower heads (approx. in frame-image coords, 0–1:
   main flower centre (0.33, 0.47), second flower (0.76, 0.24)) and drift down with sway and rotation.
   Their position must be a pure function of T, so when T goes back they fly back up onto the flower.
7. **UI** (reuse style from base_reference): slider shows T, clock label (e.g. "05:30 黎明"), ▶ play (T 0→1 in ~12 s),
   ◀ rewind (1→0), direction badge "时光流逝 ▶" / "时光倒流 ◀" based on the sign of dT. Remove the 4 colour buttons.

## Hand gesture
Same openness metric as base_reference → target T, smoothed (e.g. `T += (target-T)*0.06`). Closing the hand = rewind.

## Constraints
- Only three.js r128 (cdnjs) + MediaPipe from base_reference. No other libraries, no build step: opening the html file works.
- 60 fps on a MacBook (≤ 2 full-screen shader passes, textures loaded once).
- Code comments in Chinese, beginner-friendly; keep the code organised in clear sections.
- Expose `window.setTime(t)` (jumps T immediately, stops play) for automated testing.

## Your verification (please report honestly)
- If you have a browser tool, open `web/index.html` and save screenshots at T = 0, 0.3, 0.5, 0.7, 0.9, 1.0 to `web/shots/T_xx.png`,
  and report console errors. If you have no browser, say so explicitly; do not claim it was tested.
- Report what you could not finish or are unsure about.
