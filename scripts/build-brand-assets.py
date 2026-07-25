#!/usr/bin/env python3
"""
Regenerate Industry Insider's raster brand assets from the SVG mark.

Run this after replacing /public/brand/industry-insider-mark.svg with final
artwork. It re-renders, from that one file:

    public/og/industry-insider-og.png    1200x630  social share card
    public/brand/apple-touch-icon.png     180x180  iOS home-screen icon
    public/favicon.ico                   16 + 32   browser tab icon

Everything else on the site reads the SVGs directly and needs no build step.

    python3 scripts/build-brand-assets.py

Requirements
------------
* Python 3.9+ (standard library only — no pip install).
* A Chrome or Chromium binary. Set CHROME_PATH, or let the script look in the
  usual places.
* Network access on first run, to fetch the two brand webfonts for the share
  card. Without it the card falls back to system serif/sans, which still looks
  respectable but is not the brand type.

This script is a convenience, not part of `npm run build`. The committed PNGs
are what ship; deployment never runs this.
"""

from __future__ import annotations

import base64
import os
import pathlib
import shutil
import struct
import subprocess
import sys
import tempfile
import urllib.request
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
MARK = PUBLIC / "brand" / "industry-insider-mark.svg"
CACHE = ROOT / ".cache" / "brand-fonts"

# Brand palette — keep in sync with src/app/globals.css.
NAVY = "#061426"
NAVY_LIFT = "rgba(16,38,66,.92)"
CHAMPAGNE = "rgba(200,161,90,"
IVORY = "#F8F5EF"

TAGLINE = "Relationships First. Opportunity Follows."
WORDMARK = "INDUSTRY INSIDER"
FOOTER_LEFT = "By Personal Invitation"
FOOTER_RIGHT = "Dallas&ndash;Fort Worth, Texas"

# Headless Chromium reserves this much of --window-size for browser chrome, so
# the capture carries dead space at the bottom that has to be trimmed.
CHROME_UI_HEIGHT = 87

FONT_SOURCES = {
    "cormorant.woff2": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2",
    "manrope.woff2": "https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSvfedN4.woff2",
}

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
]


# --------------------------------------------------------------------------- #
# PNG cropping (Pillow is not a dependency)
# --------------------------------------------------------------------------- #

def _png_chunks(raw: bytes):
    pos = 8
    while pos < len(raw):
        length = int.from_bytes(raw[pos:pos + 4], "big")
        yield raw[pos + 4:pos + 8], raw[pos + 8:pos + 8 + length]
        pos += 12 + length


def _chunk(ctype: bytes, data: bytes) -> bytes:
    return (struct.pack(">I", len(data)) + ctype + data
            + struct.pack(">I", zlib.crc32(ctype + data) & 0xFFFFFFFF))


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    return a if pa <= pb and pa <= pc else (b if pb <= pc else c)


def crop_top(path: pathlib.Path, keep_height: int) -> tuple[int, int]:
    """Rewrite `path` in place, keeping only its top `keep_height` rows."""
    raw = path.read_bytes()
    idat = b""
    width = height = bit_depth = color_type = 0

    for ctype, data in _png_chunks(raw):
        if ctype == b"IHDR":
            width, height, bit_depth, color_type = struct.unpack(">IIBB", data[:10])
            if data[10:13] != b"\x00\x00\x00":
                raise ValueError("interlaced PNG is not supported")
        elif ctype == b"IDAT":
            idat += data

    if height <= keep_height:
        return width, height
    if bit_depth != 8:
        raise ValueError(f"unsupported bit depth: {bit_depth}")

    bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    stride = width * bpp
    data = zlib.decompress(idat)
    out = bytearray()
    prev = bytearray(stride)

    for row in range(keep_height):
        start = row * (stride + 1)
        ftype = data[start]
        line = bytearray(data[start + 1:start + 1 + stride])
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b = prev[i]
            c = prev[i - bpp] if i >= bpp else 0
            if ftype == 1:
                line[i] = (line[i] + a) & 0xFF
            elif ftype == 2:
                line[i] = (line[i] + b) & 0xFF
            elif ftype == 3:
                line[i] = (line[i] + (a + b) // 2) & 0xFF
            elif ftype == 4:
                line[i] = (line[i] + _paeth(a, b, c)) & 0xFF
        out += b"\x00" + line
        prev = line

    ihdr = struct.pack(">IIBBBBB", width, keep_height, bit_depth, color_type, 0, 0, 0)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", ihdr)
                     + _chunk(b"IDAT", zlib.compress(bytes(out), 9))
                     + _chunk(b"IEND", b""))
    return width, keep_height


def png_size(path: pathlib.Path) -> tuple[int, int]:
    raw = path.read_bytes()
    return int.from_bytes(raw[16:20], "big"), int.from_bytes(raw[20:24], "big")


# --------------------------------------------------------------------------- #
# Rendering
# --------------------------------------------------------------------------- #

def find_chrome() -> str:
    for candidate in CHROME_CANDIDATES:
        if candidate and pathlib.Path(candidate).exists():
            return candidate
    found = shutil.which("chromium") or shutil.which("google-chrome")
    if found:
        return found
    sys.exit("No Chrome/Chromium found. Set CHROME_PATH to the binary.")


def font_face_css() -> str:
    """@font-face rules with the brand webfonts inlined, or '' if unavailable."""
    CACHE.mkdir(parents=True, exist_ok=True)
    faces = []

    for filename, url in FONT_SOURCES.items():
        target = CACHE / filename
        if not target.exists():
            try:
                with urllib.request.urlopen(url, timeout=15) as response:
                    target.write_bytes(response.read())
            except Exception as error:  # noqa: BLE001 - any failure is non-fatal
                print(f"  ! could not fetch {filename} ({error}); using system fonts")
                return ""
        faces.append((filename, base64.b64encode(target.read_bytes()).decode()))

    names = {"cormorant.woff2": "Cormorant Garamond", "manrope.woff2": "Manrope"}
    return "\n".join(
        f"@font-face {{ font-family:'{names[name]}'; font-weight:200 700;"
        f" src:url(data:font/woff2;base64,{data}) format('woff2'); }}"
        for name, data in faces
    )


def shoot(chrome: str, html: str, out: pathlib.Path, width: int, height: int) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / "page.html"
        page.write_text(html, encoding="utf-8")
        subprocess.run(
            [chrome, "--headless", "--no-sandbox", "--disable-gpu",
             "--hide-scrollbars", "--force-device-scale-factor=1",
             f"--user-data-dir={tmp}/profile", f"--screenshot={out}",
             f"--window-size={width},{height + CHROME_UI_HEIGHT}",
             f"file://{page}"],
            check=True, capture_output=True,
        )
    crop_top(out, height)
    got = png_size(out)
    flag = "" if got == (width, height) else f"  !! expected {width}x{height}"
    print(f"  {rel(out)}  {got[0]}x{got[1]}  ({out.stat().st_size:,} bytes){flag}")


def rel(path: pathlib.Path) -> str:
    """Repo-relative path where possible; intermediates live in a temp dir."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return path.name


def main() -> None:
    if not MARK.exists():
        sys.exit(f"Missing {MARK.relative_to(ROOT)} — add the mark first.")

    chrome = find_chrome()
    mark_data = base64.b64encode(MARK.read_bytes()).decode()
    mark_src = f"data:image/svg+xml;base64,{mark_data}"
    fonts = font_face_css()
    gold = CHAMPAGNE

    print("Rendering brand assets from", MARK.relative_to(ROOT))

    og_html = f"""<style>
{fonts}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:1200px; height:630px; background:{NAVY}; overflow:hidden;
  font-family:'Manrope',system-ui,sans-serif; position:relative; }}
.lift {{ position:absolute; inset:0;
  background:radial-gradient(115% 85% at 50% 30%, {NAVY_LIFT} 0%, rgba(6,20,38,0) 62%); }}
.frame {{ position:absolute; inset:44px; border:1px solid {gold}.30); }}
.corner {{ position:absolute; width:26px; height:26px; border:1px solid {gold}.75); }}
.tl {{ top:44px; left:44px; border-right:0; border-bottom:0; }}
.tr {{ top:44px; right:44px; border-left:0; border-bottom:0; }}
.bl {{ bottom:44px; left:44px; border-right:0; border-top:0; }}
.br {{ bottom:44px; right:44px; border-left:0; border-top:0; }}
.stack {{ position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; }}
.mark {{ width:212px; }}
.word {{ margin-top:44px; font-family:'Cormorant Garamond',Georgia,serif;
  font-weight:300; font-size:56px; letter-spacing:.30em; text-indent:.30em;
  color:{IVORY}; line-height:1; }}
.rule {{ margin-top:34px; width:300px; height:1px;
  background:linear-gradient(to right, {gold}0) 0%, {gold}.85) 50%, {gold}0) 100%); }}
.tag {{ margin-top:32px; font-size:17px; font-weight:300; letter-spacing:.34em;
  text-indent:.34em; text-transform:uppercase; color:rgba(238,234,224,.66); }}
.foot {{ position:absolute; bottom:82px; left:0; right:0; display:flex;
  justify-content:center; gap:22px; align-items:center; font-size:12px;
  font-weight:500; letter-spacing:.30em; text-transform:uppercase;
  color:{gold}.80); }}
.dot {{ width:3px; height:3px; background:{gold}.6); transform:rotate(45deg); }}
</style>
<div class="lift"></div><div class="frame"></div>
<div class="corner tl"></div><div class="corner tr"></div>
<div class="corner bl"></div><div class="corner br"></div>
<div class="stack">
  <img class="mark" src="{mark_src}">
  <div class="word">{WORDMARK}</div>
  <div class="rule"></div>
  <div class="tag">{TAGLINE}</div>
</div>
<div class="foot">
  <span>{FOOTER_LEFT}</span><span class="dot"></span><span>{FOOTER_RIGHT}</span>
</div>"""

    shoot(chrome, og_html, PUBLIC / "og" / "industry-insider-og.png", 1200, 630)

    icon_html = """<style>
* {{ margin:0; padding:0; }}
body {{ width:{size}px; height:{size}px; background:{navy}; display:flex;
  align-items:center; justify-content:center; overflow:hidden; }}
img {{ width:{inner}px; }}
</style>
<img src="{src}">"""

    with tempfile.TemporaryDirectory() as tmp:
        icons: dict[int, pathlib.Path] = {}
        for size in (180, 32, 16):
            out = pathlib.Path(tmp) / f"icon-{size}.png"
            shoot(chrome, icon_html.format(size=size, inner=int(size * 0.78),
                                           navy=NAVY, src=mark_src), out, size, size)
            icons[size] = out

        apple = PUBLIC / "brand" / "apple-touch-icon.png"
        apple.write_bytes(icons[180].read_bytes())
        print(f"  {rel(apple)}")

        # ICO container with PNG payloads for 16 and 32.
        entries = [(size, icons[size].read_bytes()) for size in (16, 32)]
        offset = 6 + 16 * len(entries)
        blob = struct.pack("<HHH", 0, 1, len(entries))
        directory, payload = b"", b""
        for size, data in entries:
            directory += struct.pack("<BBBBHHII", size, size, 0, 0, 1, 32,
                                     len(data), offset)
            payload += data
            offset += len(data)
        ico = PUBLIC / "favicon.ico"
        ico.write_bytes(blob + directory + payload)
        print(f"  {rel(ico)}  ({ico.stat().st_size:,} bytes)")

    print("\nDone. Remember to also update public/favicon.svg by hand — it is a "
          "hand-tuned, tighter crop of the mark for 16px legibility.")


if __name__ == "__main__":
    main()
