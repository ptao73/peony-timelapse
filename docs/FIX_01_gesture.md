# Fix 01: fully open hand must reach T = 1 (and a fist must reach T = 0)

User test result: with the hand **fully open**, the scene never reaches the final state (full bloom, morning, petals falling).

## Root cause (found by orchestrator)
`web/index.html` ≈ line 1211: `targetT = clamp((avgExtNorm - 0.95) / 1.05, 0, 1)` needs avgExtNorm = 2.0 for T = 1.
For a real fully open hand, the average tip-to-wrist distance / palm size is only about 1.7–1.8 (thumb and pinky are short),
and it gets smaller when the hand is tilted (2D projection). So an open hand stops at roughly T ≈ 0.75.

## Required changes (only in web/index.html, keep everything else unchanged)
1. **Per-finger openness, 3D:** for each finger use 3D distances (x, y, z of the landmarks) and compute
   openness = dist(wrist, tip) / (dist(wrist, mcp) + dist(mcp, pip) + dist(pip, dip) + dist(dip, tip)) (≈1 when straight, smaller when curled),
   then average the 4 fingers (index–pinky); include the thumb with lower weight or leave it out. This is independent of hand size, distance and tilt.
2. **Self-calibration:** keep a running min and max of the raw openness seen during the session
   (start from sensible defaults, e.g. min 0.55, max 0.9; widen immediately when exceeded; never let max − min drop below 0.15).
   Normalise: n = (raw − min) / (max − min).
3. **Dead zones:** n ≥ 0.85 → targetT = 1; n ≤ 0.15 → targetT = 0; in between, a smooth remap (smoothstep) of 0.15–0.85 onto 0–1.
4. **Reaching the end:** smoothing `T += (target − T) * 0.06` approaches 1 only asymptotically: snap T to the target when |target − T| < 0.002,
   so the final state (frame 12, petals at their end positions, morning light) is actually reached; same for T = 0.
5. If two hands are detected, use the more open one (do not let the second hand overwrite the first in the loop).
6. Show in the HUD badge: `张开 xx%` (normalised n) so the user can see the gesture reading.
7. Do not change sky, clouds, light, plant, petals, play/rewind, slider or lightsaber behaviour.

You cannot run shell commands in this session; only read/write files. Reply with exactly what you changed (functions/line ranges) and anything uncertain.
