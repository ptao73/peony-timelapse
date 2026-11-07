# Fix 02: load WebP images instead of PNG

The frames and petals now exist as WebP (frames/frame_01.webp … frame_12.webp at 1024×1024, petals/petal_1.webp … petal_4.webp).
The PNG files will be removed from the published site.

## Required change (web/index.html only)
1. Load `../frames/frame_XX.webp` and `../petals/petal_N.webp` instead of the `.png` files.
2. Anything that assumes the frame size is 1254 px must still work at 1024 px: use the loaded image's natural size or normalised (0–1) coordinates.
3. Keep the "missing file → show its name in the HUD" behaviour, using the new file names.
4. Change nothing else.

You cannot run shell commands in this session; only read/write files. Reply with exactly what you changed.
