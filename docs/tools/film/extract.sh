#!/usr/bin/env bash
# Cuts a clip into the WebP frame sets ScrollFilm plays (web/public/film/<id>/<width>/0001.webp …).
# usage: docs/tools/film/extract.sh <clip.mp4> <id> [fps=24] [widths="720 1280 1600"] [quality=74] [filter=hqdn3d…]
# Prints the Clip entry (frames, widths, aspect) for web/src/lib/clips.ts.
set -euo pipefail
src=$1; id=$2; fps=${3:-24}; widths=${4:-"720 1280 1600"}; q=${5:-74}; flt=${6:-"hqdn3d=1.5:1.5:3:3"}
root="$(cd "$(dirname "$0")/../../.." && pwd)/web/public/film/$id"
for w in $widths; do
  out="$root/$w"; rm -rf "$out"; mkdir -p "$out"
  # lanczos scale; a light denoise keeps WebP small without visible blocking on dark gradients
  ffmpeg -v error -y -i "$src" -vf "fps=$fps,scale=$w:-2:flags=lanczos,$flt" \
    -c:v libwebp -quality "$q" -compression_level 6 -preset photo "$out/%04d.webp"
done
first=$(ls "$root/${widths%% *}" | head -1)
n=$(ls "$root/${widths%% *}" | wc -l)
dim=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")
aspect=$(awk -F, '{printf "%.4f", $1/$2}' <<<"$dim")
size=$(du -sh "$root" | cut -f1)
echo "{ id: \"$id\", frames: $n, widths: [$(echo $widths | tr ' ' ',')], aspect: $aspect }  // $size total, first $first"
