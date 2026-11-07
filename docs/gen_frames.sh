#!/bin/bash
# Codex 逐帧往回编辑:frame_12(全开) → frame_01(花骨朵),再做花瓣贴图
P=/home/peng/peony-timelapse
LOG=$P/tools/codex_log.txt
cp -n $P/frames/master_full.png $P/frames/frame_12.png
declare -A S
S[11]="almost full bloom: very slightly less open than image 2; outer petals a little less spread."
S[10]="large, lush and open, but outer petals somewhat less spread than image 2, slightly more cupped; golden stamens clearly visible."
S[9]="clearly open, rounded bowl shape, outer petals spreading less, golden stamens still visible."
S[8]="open bowl shape, a little smaller than image 2, inner petals more crowded toward the centre, stamens partly hidden."
S[7]="between half open and open: deep bowl, inner petals forming a cup, only a small glimpse of golden stamens."
S[6]="slightly more than half open: bowl-shaped, outer petal layers open, centre is a dense cup of inner petals, a hint of stamens deep inside."
S[5]="HALF OPEN: bowl-shaped, the outer layers of ruffled crimson petals opened outward, the centre a tight cup of inner petals, no stamens visible. Noticeably smaller flowers than image 2."
S[4]="just starting to open: a tight ball of overlapping crimson petals with only the outermost 4-6 petals peeling outward and curling."
S[3]="round crimson buds the size of a small apple, petals smooth and tightly overlapping like a sphere, green sepals pulled back at the base, a small gap at the top."
S[2]="swelling buds, slightly smaller than image 2, green sepals loosening around them and showing a lot of crimson."
S[1]="tight closed buds wrapped in green sepals with a sliver of crimson at the top; still clearly LARGER than the small bud at the lower right."
for N in 11 10 9 8 7 6 5 4 3 2 1; do
  NN=$(printf %02d $N); PREV=$P/frames/frame_$(printf %02d $((N+1))).png
  [ -f $P/frames/frame_$NN.png ] && { echo "frame $NN: exists, skip"; continue; }
  PROMPT="You are producing frame $N of 12 of a time-lapse of red tree peonies opening (frame 12 = full bloom, frame 1 = tight buds). We go backwards in time.
Image 1 = MASTER (frame 12). Image 2 = frame $((N+1)), one step more open than the frame you must make.
Use your image generation/editing tool to EDIT image 2 into frame $N:
- TRANSPARENT background (PNG with alpha), exactly like the inputs; nothing but the plant is visible.
- Keep EVERYTHING except the two main flower heads identical to image 1: every leaf, stem and the small bud at the lower right stay in exactly the same position, size, shape and colour. Leaves must not get lighter or darker.
- The two main flower heads stay on the same stem tips, centred at the same points as in image 1.
- Same realistic classical oil-painting style, same neutral soft lighting, same crimson colours.
- Change ONLY the two main flower heads so that they are: ${S[$N]}
Then reply with the absolute path of the generated image."
  OUT=$(echo "$PROMPT" | codex exec --skip-git-repo-check -C $P -s workspace-write --image=$P/frames/master_full.png --image=$PREV - 2>&1)
  IMG=$(echo "$OUT" | grep -oE '/home/peng/\.codex/generated_images/[^ `]+\.png' | tail -1)
  TOK=$(echo "$OUT" | grep -A1 "tokens used" | tail -1)
  if [ -n "$IMG" ] && [ -f "$IMG" ]; then cp "$IMG" $P/frames/frame_$NN.png; echo "frame $NN: ok (tokens $TOK)" | tee -a $LOG
  else echo "frame $NN: FAILED" | tee -a $LOG; echo "$OUT" | tail -15; exit 1; fi
done
# 花瓣贴图:2x2 网格,方便裁切
[ -f $P/petals/sheet.png ] || {
OUT=$(echo "Using image 1 only as a style reference for petal colour and texture, use your image generation tool to create a NEW square image with a TRANSPARENT background (PNG with alpha) showing exactly 4 single, detached, fallen crimson tree-peony petals, arranged in a 2x2 grid: one petal centred in each quadrant, petals not touching each other or the edges, each in a different gentle curl/angle, ruffled serrated edges, fine veins, same realistic classical oil-painting style, soft neutral light. Nothing else in the image. Then reply with the absolute path of the generated image." | codex exec --skip-git-repo-check -C $P -s workspace-write --image=$P/frames/master_full.png - 2>&1)
IMG=$(echo "$OUT" | grep -oE '/home/peng/\.codex/generated_images/[^ `]+\.png' | tail -1)
TOK=$(echo "$OUT" | grep -A1 "tokens used" | tail -1)
if [ -n "$IMG" ] && [ -f "$IMG" ]; then cp "$IMG" $P/petals/sheet.png; echo "petals: ok (tokens $TOK)" | tee -a $LOG; else echo "petals: FAILED" | tee -a $LOG; echo "$OUT" | tail -15; exit 1; fi
}
echo "CODEX ALL DONE"
