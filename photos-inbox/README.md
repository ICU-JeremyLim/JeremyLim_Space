# Drop photos here

Put any photo in this folder and push. A GitHub Action picks it up and does
the rest, then removes the original from here.

Accepted: RAW (`.cr2` `.cr3` `.nef` `.arw` `.dng` `.raf` `.orf` `.rw2`),
`.jpg` `.png` `.heic` `.webp` `.tif` — at any size.

For each photo it produces:

| Output | Purpose |
|---|---|
| `images/gallery/<name>.jpg` | display copy, long edge 2200px |
| `images/gallery/thumbs/<name>.jpg` | grid thumbnail, long edge 700px |
| an entry in `data/content.json` | so it appears in the gallery |

**EXIF is stripped**, including GPS coordinates and camera serial numbers.
The capture date is read out first, so the gallery stays in chronological
order without publishing where the photo was taken.

To add a caption, edit the photo's entry in `data/content.json` — the
workflow never overwrites a caption you have written.

To run it on your own machine instead:

    pip install Pillow rawpy numpy pillow-heif
    python3 scripts/process-photos.py
