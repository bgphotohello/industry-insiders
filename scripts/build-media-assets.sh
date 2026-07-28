#!/usr/bin/env bash
#
# Turn the master media in assets/source/ into the web-ready files the site
# actually serves, in public/brand/.
#
# The masters are large on purpose — they are the only copies we have, and they
# are kept out of public/ so they never ship to a browser. Everything the site
# loads is generated here, so re-running this script is the only way these files
# should ever change.
#
#   assets/source/doors-open-intro.mp4                  6.1 MB, 1920x1080, 24fps
#     -> public/brand/doors-open-intro.mp4              H.264, silent, 1280x720
#     -> public/brand/doors-open-intro.webm             VP9, smaller, tried first
#     -> public/brand/doors-open-poster.jpg             first frame
#
#   assets/source/doors-open-bg.png                     1.3 MB, 1680x720
#     -> public/brand/doors-open-bg.{webp,jpg}
#
#   assets/source/exclusive-dinner-party-networking.png 1.6 MB, 1456x816
#     -> public/brand/gathering.{webp,jpg}
#
# Every one of these sits behind a heavy navy scrim at low opacity, so the
# quality settings are tuned for weight rather than for pixel fidelity.
#
# Requires ffmpeg with libx264, libvpx-vp9 and libwebp. Point $FFMPEG at a
# specific binary if the one on PATH is a cut-down build (Playwright ships one
# that can only read WebM, which will fail on the MP4 master).
#
# Usage: npm run media:assets

set -euo pipefail

FFMPEG="${FFMPEG:-ffmpeg}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/assets/source"
OUT="$ROOT/public/brand"

if ! "$FFMPEG" -hide_banner -encoders >/dev/null 2>&1; then
  echo "error: no usable ffmpeg. Set FFMPEG=/path/to/ffmpeg." >&2
  exit 1
fi

run() { "$FFMPEG" -hide_banner -loglevel error -y "$@"; }

# --- The intro clip -------------------------------------------------------
# -an strips the audio track outright. The video is muted in markup too, but a
# silent file is smaller and removes any chance of a browser surfacing sound.
echo "doors-open-intro.mp4 (H.264)"
run -i "$SRC/doors-open-intro.mp4" \
  -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p \
  -crf 26 -preset slow -g 48 -movflags +faststart \
  "$OUT/doors-open-intro.mp4"

echo "doors-open-intro.webm (VP9)"
run -i "$SRC/doors-open-intro.mp4" \
  -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -cpu-used 2 \
  "$OUT/doors-open-intro.webm"

echo "doors-open-poster.jpg"
run -ss 0 -i "$OUT/doors-open-intro.mp4" -frames:v 1 -q:v 6 \
  "$OUT/doors-open-poster.jpg"

# --- The stills -----------------------------------------------------------
still() {
  local src="$1" stem="$2" width="$3"
  echo "$stem.webp / $stem.jpg"
  run -i "$src" -vf "scale=$width:-2:flags=lanczos" \
    -c:v libwebp -quality 72 -compression_level 6 "$OUT/$stem.webp"
  run -i "$src" -vf "scale=$width:-2:flags=lanczos" -q:v 6 "$OUT/$stem.jpg"
}

still "$SRC/doors-open-bg.png" "doors-open-bg" 1600
still "$SRC/exclusive-dinner-party-networking.png" "gathering" 1456

echo
echo "done:"
ls -1sh "$OUT"/doors-open-intro.mp4 "$OUT"/doors-open-intro.webm \
        "$OUT"/doors-open-poster.jpg "$OUT"/doors-open-bg.webp \
        "$OUT"/doors-open-bg.jpg "$OUT"/gathering.webp "$OUT"/gathering.jpg
