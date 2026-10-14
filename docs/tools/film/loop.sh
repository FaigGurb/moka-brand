#!/usr/bin/env bash
# Turns a generated clip (Higgsfield/Kling, ~5 s) into a seamless looping background video:
# the clip from 1 s on, with its last second cross-faded into its first second, so the end meets
# the start without a jump. Writes web/public/cinema/video/<id>-<width>.mp4 (H.264, silent, faststart)
# and a VP9 .webm twin (browsers without H.264, e.g. Chromium builds and some Linux Firefox).
# usage: docs/tools/film/loop.sh <clip.mp4> <id> [widths="1280 720"] [crf=26] [fade=1]
set -euo pipefail
src=$1; id=$2; widths=${3:-"1280 720"}; crf=${4:-26}; fade=${5:-1}
out="$(cd "$(dirname "$0")/../../.." && pwd)/web/public/cinema/video"
mkdir -p "$out"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
body=$(awk -v d="$dur" -v f="$fade" 'BEGIN{printf "%.3f", d-f}')
for w in $widths; do
  # [a] = clip from <fade> to the end; [b] = its first <fade> seconds, faded over the tail of [a]
  ffmpeg -v error -y -i "$src" -filter_complex \
    "[0:v]split[x][y];[x]trim=start=$fade,setpts=PTS-STARTPTS[a];[y]trim=end=$fade,setpts=PTS-STARTPTS[b];\
[a][b]xfade=transition=fade:duration=$fade:offset=$(awk -v b="$body" -v f="$fade" 'BEGIN{printf "%.3f", b-f}'),\
scale=$w:-2:flags=lanczos,format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -preset slow -crf "$crf" -profile:v high -movflags +faststart "$out/$id-$w.mp4"
  ffmpeg -v error -y -i "$out/$id-$w.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf $((crf + 10)) -row-mt 1 -deadline good -cpu-used 2 "$out/$id-$w.webm"
  echo "$out/$id-$w.{mp4,webm} $(du -h "$out/$id-$w.mp4" "$out/$id-$w.webm" | cut -f1 | tr '\n' ' ')"
done
