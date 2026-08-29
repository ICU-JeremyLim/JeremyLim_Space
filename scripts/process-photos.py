#!/usr/bin/env python3
"""
process-photos.py — turn anything you drop in photos-inbox/ into web-ready images.

Handles the two problems with publishing straight from a camera:

  * RAW files (.cr2, .cr3, .nef, .arw, .dng, .raf) that browsers cannot display
  * JPEGs far too large to serve (a 6 MB, 4160x6240 file is not a web image)

For each photo it writes a display version and a thumbnail, strips EXIF —
including GPS coordinates and camera serial numbers — and registers the photo
in data/content.json without disturbing captions you have already written.

Usage
-----
    python3 scripts/process-photos.py            # process photos-inbox/
    python3 scripts/process-photos.py --keep     # leave originals in place

RAW support needs `rawpy`; HEIC needs `pillow-heif`. Both are optional —
without them those formats are skipped with a clear message rather than
failing the run.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime

from PIL import Image, ImageOps

try:
    from PIL import ExifTags
except ImportError:                                    # pragma: no cover
    ExifTags = None

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX   = os.path.join(ROOT, "photos-inbox")
GALLERY = os.path.join(ROOT, "images", "gallery")
THUMBS  = os.path.join(GALLERY, "thumbs")
CONTENT = os.path.join(ROOT, "data", "content.json")

# Display copy: big enough for a full-screen lightbox, small enough to load.
MAX_LONG_EDGE   = 2200
DISPLAY_QUALITY = 88
# Grid thumbnail.
THUMB_LONG_EDGE = 700
THUMB_QUALITY   = 80

RAW_EXT   = {".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2"}
PLAIN_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}
HEIC_EXT  = {".heic", ".heif"}


def slugify(name):
    s = os.path.splitext(os.path.basename(name))[0].lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "photo"


def shot_date(path, img=None):
    """EXIF capture date if present, else the file's modification time.

    Read before the EXIF is discarded, so the gallery keeps its chronology
    without keeping the location data that sits alongside it.
    """
    try:
        if img is not None and ExifTags is not None:
            exif = img.getexif()
            if exif:
                # 0x8769 is the Exif sub-IFD, where DateTimeOriginal actually is.
                merged = dict(exif)
                try:
                    merged.update(dict(exif.get_ifd(0x8769)))
                except Exception:
                    pass
                tags = {ExifTags.TAGS.get(k, k): v for k, v in merged.items()}
                for key in ("DateTimeOriginal", "DateTimeDigitized", "DateTime"):
                    raw = tags.get(key)
                    if raw:
                        return datetime.strptime(
                            str(raw).strip(), "%Y:%m:%d %H:%M:%S").strftime("%Y-%m-%d")
    except Exception:
        pass
    return datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d")


def load_raw(path):
    try:
        import rawpy
    except ImportError:
        print(f"    skipped (RAW support needs `pip install rawpy`): {os.path.basename(path)}")
        return None
    try:
        import numpy as np
        with rawpy.imread(path) as raw:
            rgb = raw.postprocess(use_camera_wb=True, no_auto_bright=False, output_bps=8)
        return Image.fromarray(np.asarray(rgb))
    except Exception as exc:
        print(f"    FAILED to decode RAW {os.path.basename(path)}: {exc}")
        return None


def load_image(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in RAW_EXT:
        return load_raw(path), None            # RAW carries no PIL EXIF here
    if ext in HEIC_EXT:
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
        except ImportError:
            print(f"    skipped (HEIC needs `pip install pillow-heif`): {os.path.basename(path)}")
            return None, None
    try:
        img = Image.open(path)
        img.load()
        return img, img
    except Exception as exc:
        print(f"    FAILED to open {os.path.basename(path)}: {exc}")
        return None, None


def save_web(img, dest, long_edge, quality):
    im = img.convert("RGB")
    w, h = im.size
    if max(w, h) > long_edge:
        scale = long_edge / float(max(w, h))
        im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    # Rebuilding from raw pixels drops every metadata block, GPS included.
    clean = Image.frombytes("RGB", im.size, im.tobytes())
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    clean.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    return clean.size


def process(path, keep):
    name = os.path.basename(path)
    print(f"  {name}")
    img, exif_src = load_image(path)
    if img is None:
        return None

    img = ImageOps.exif_transpose(img)          # honour rotation before stripping
    date = shot_date(path, exif_src)

    slug = slugify(name)
    disp_rel  = f"images/gallery/{slug}.jpg"
    thumb_rel = f"images/gallery/thumbs/{slug}.jpg"

    size = save_web(img, os.path.join(ROOT, disp_rel),  MAX_LONG_EDGE,   DISPLAY_QUALITY)
    save_web(img,        os.path.join(ROOT, thumb_rel), THUMB_LONG_EDGE, THUMB_QUALITY)

    before = os.path.getsize(path) / 1048576
    after  = os.path.getsize(os.path.join(ROOT, disp_rel)) / 1048576
    print(f"    -> {size[0]}x{size[1]}  {before:.1f}MB -> {after:.2f}MB  (EXIF stripped)")

    if not keep:
        os.remove(path)

    return {"file": disp_rel, "thumb": thumb_rel, "caption": "", "date": date}


def update_content(entries):
    with open(CONTENT, encoding="utf-8") as fh:
        data = json.load(fh)

    photos = data.get("photos", [])
    existing = {p.get("file"): p for p in photos}

    added = 0
    for e in entries:
        if e["file"] in existing:
            # Keep whatever caption/date the author has already set.
            existing[e["file"]].setdefault("thumb", e["thumb"])
        else:
            photos.append(e)
            added += 1

    photos.sort(key=lambda p: p.get("date", ""), reverse=True)
    data["photos"] = photos
    with open(CONTENT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    return added, len(photos)


def backfill_thumbs():
    """Give already-published photos a thumbnail if they lack one.

    Without this, a photo added before this script existed loads at full size
    in the grid. Idempotent, so it is safe to run on every pass.
    """
    with open(CONTENT, encoding="utf-8") as fh:
        data = json.load(fh)

    fixed = 0
    for p in data.get("photos", []):
        src = p.get("file")
        if not src:
            continue
        thumb_rel = p.get("thumb") or "images/gallery/thumbs/%s.jpg" % (
            os.path.splitext(os.path.basename(src))[0])
        thumb_abs = os.path.join(ROOT, thumb_rel)
        src_abs = os.path.join(ROOT, src)
        if os.path.exists(thumb_abs) or not os.path.exists(src_abs):
            p.setdefault("thumb", thumb_rel) if os.path.exists(thumb_abs) else None
            continue
        try:
            img = ImageOps.exif_transpose(Image.open(src_abs))
            save_web(img, thumb_abs, THUMB_LONG_EDGE, THUMB_QUALITY)
            p["thumb"] = thumb_rel
            fixed += 1
            print(f"  thumbnail generated for {os.path.basename(src)}")
        except Exception as exc:
            print(f"  could not thumbnail {src}: {exc}")

    if fixed:
        with open(CONTENT, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
    return fixed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keep", action="store_true",
                    help="keep the originals in photos-inbox/ instead of removing them")
    args = ap.parse_args()

    os.makedirs(INBOX, exist_ok=True)
    os.makedirs(THUMBS, exist_ok=True)

    known = RAW_EXT | PLAIN_EXT | HEIC_EXT
    files = [os.path.join(INBOX, f) for f in sorted(os.listdir(INBOX))
             if os.path.splitext(f)[1].lower() in known]

    entries = []
    if files:
        print(f"processing {len(files)} photo(s) from photos-inbox/")
        entries = [e for e in (process(p, args.keep) for p in files) if e]
        if not entries:
            print("nothing could be processed.")
            return 1
        added, total = update_content(entries)
        print(f"\n{len(entries)} processed, {added} new in the gallery ({total} total)")
    else:
        print("photos-inbox/ is empty.")

    fixed = backfill_thumbs()
    if fixed:
        print(f"backfilled {fixed} missing thumbnail(s)")
    if not entries and not fixed:
        print("nothing to do.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
