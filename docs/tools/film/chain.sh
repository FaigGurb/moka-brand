#!/usr/bin/env bash
# Joins transition clips (Kling start→end frame, each ending on the still the next one starts from)
# into one film and cuts it into the WebP frame sets the cinema stage scrubs (via extract.sh).
# Every clip after the first drops its first frame (the shared still), and each is retimed to the
# same length, so shot i sits exactly at frame i/(clips) of the film.
# usage: docs/tools/film/chain.sh <id> <fps> "<widths>" <quality> clip1.mp4 clip2.mp4 …
set -euo pipefail
id=$1; fps=$2; widths=$3; q=$4; shift 4
here="$(cd "$(dirname "$0")" && pwd)"
tmp=$(mktemp -d)
n=0; inputs=(); chain=""
for clip in "$@"; do
  inputs+=(-i "$clip")
  if [ $n -eq 0 ]; then trim=""; else trim="trim=start_frame=1,setpts=PTS-STARTPTS,"; fi
  chain+="[$n:v]${trim}fps=24,scale=1280:720:flags=lanczos,setsar=1[v$n];"
  n=$((n + 1))
done
for ((i = 0; i < n; i++)); do chain+="[v$i]"; done
chain+="concat=n=$n:v=1:a=0[out]"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$chain" -map "[out]" -an -c:v libx264 -crf 14 -preset slow "$tmp/film.mp4"
"$here/extract.sh" "$tmp/film.mp4" "$id" "$fps" "$widths" "$q"
rm -rf "$tmp"
