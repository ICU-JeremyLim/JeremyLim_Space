#!/usr/bin/env python3
"""
build-manifest.py
-----------------
Scans the media folders and writes data/media-manifest.json.

The manifest lists every image and audio file found in the repo so that
the website can display newly uploaded files automatically.

Usage:
  python3 scripts/build-manifest.py          # run locally or via GitHub Actions
"""

import os
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'}
AUDIO_EXTS = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'}

GALLERY_DIR  = ROOT / 'images' / 'gallery'
ARTICLES_DIR = ROOT / 'images' / 'articles'
AUDIO_DIR    = ROOT / 'audio'
OUTPUT_FILE  = ROOT / 'data' / 'media-manifest.json'


def scan_dir(directory, extensions, web_prefix):
    """Return a sorted list of web-accessible paths for files in directory."""
    if not directory.exists():
        return []
    files = []
    for f in sorted(directory.iterdir()):
        if f.suffix.lower() in extensions and not f.name.startswith('.'):
            files.append(web_prefix + f.name)
    return files


def main():
    manifest = {
        'gallery_images': scan_dir(GALLERY_DIR,  IMAGE_EXTS, 'images/gallery/'),
        'article_images': scan_dir(ARTICLES_DIR, IMAGE_EXTS, 'images/articles/'),
        'audio_files':    scan_dir(AUDIO_DIR,    AUDIO_EXTS, 'audio/'),
    }

    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=2)
        fh.write('\n')

    total = sum(len(v) for v in manifest.values())
    print(f'Manifest written to {OUTPUT_FILE}')
    print(f'  gallery images : {len(manifest["gallery_images"])}')
    print(f'  article images : {len(manifest["article_images"])}')
    print(f'  audio files    : {len(manifest["audio_files"])}')
    print(f'  total          : {total}')


if __name__ == '__main__':
    main()
