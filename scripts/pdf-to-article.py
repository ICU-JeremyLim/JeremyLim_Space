#!/usr/bin/env python3
"""
pdf-to-article.py — render the PDF papers as readable web articles.

Extracts text and figures from each PDF in content/papers/ and writes a
Markdown article to content/articles/, so papers read in-page like the rest
of the site instead of being download-only.

Handles: two-column academic layouts, hyphenated line breaks, CJK vs Latin
line joining, section-heading detection, and figure extraction.

Re-runnable. Usage:  python3 scripts/pdf-to-article.py
"""

import os
import re
import sys

import pymupdf

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPERS   = os.path.join(ROOT, "content", "papers")
ARTICLES = os.path.join(ROOT, "content", "articles")
IMAGES   = os.path.join(ROOT, "content", "images")

# Names to strip wherever they appear (author bylines and running heads).
# Regex, not literals: the papers separate the characters with ASCII spaces,
# ideographic spaces (U+3000) and nothing at all, and pair the name with
# several title prefixes.
REDACT_RE = re.compile(
    r"(?:ジェレミー[・\s]*)?林[\s\u3000]*宇[\s\u3000]*豪"
    r"|\(?\s*Yuhao\s+Lin\s*\)?"
    r"|（\s*Yuhao\s+Lin\s*）"
)

CJK = re.compile(r"[぀-ヿ㐀-鿿＀-￯]")


def is_cjk(s):
    return bool(CJK.search(s))


def page_columns(blocks, width):
    """Detect a two-column layout and return blocks in reading order."""
    text_blocks = [b for b in blocks if b[6] == 0 and b[4].strip()]
    if not text_blocks:
        return []

    mid = width / 2
    left  = [b for b in text_blocks if b[2] <= mid + 20]   # ends before midline
    right = [b for b in text_blocks if b[0] >= mid - 20]   # starts after midline
    spans = [b for b in text_blocks if b not in left and b not in right]

    # Two-column only if both sides are substantial and few blocks straddle.
    two_col = len(left) >= 3 and len(right) >= 3 and len(spans) <= len(text_blocks) * 0.35
    if not two_col:
        return sorted(text_blocks, key=lambda b: (round(b[1], 1), b[0]))

    # Full-width blocks above the columns (title, abstract) come first.
    top = [b for b in spans]
    top.sort(key=lambda b: b[1])
    left.sort(key=lambda b: b[1])
    right.sort(key=lambda b: b[1])
    return top + left + right


def join_lines(text):
    """Turn a PDF text block into one paragraph."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    out = lines[0]
    for ln in lines[1:]:
        if out.endswith("-") and re.search(r"[A-Za-z]-$", out):
            out = out[:-1] + ln              # de-hyphenate across a line break
        elif is_cjk(out[-1:]) or is_cjk(ln[:1]):
            out += ln                        # CJK: no space
        else:
            out += " " + ln
    return out


HEADING = re.compile(r"^(\d+(?:\.\d+)*)[\s.、）)]*\s*(.{0,60})$", re.S)
JP_HEAD = re.compile(r"^[一二三四五六七八九十]+[、．.]\s*(.{0,40})$")


def as_heading(par):
    """Return (level, text) if this paragraph looks like a section heading."""
    p = " ".join(par.split())
    if len(p) > 70:
        return None
    if re.search(r"[。．.!?！？]\s*$", p) and not re.match(r"^\d+(\.\d+)*\.?\s*$", p):
        return None
    m = HEADING.match(p)
    if m and m.group(2).strip():
        depth = m.group(1).count(".") + 1
        return (min(depth + 1, 4), p)
    if JP_HEAD.match(p):
        return (2, p)
    # Bare short title-case lines that are common section names
    if re.match(r"^(Abstract|Introduction|Background|Method(s|ology)?|Results?|"
                r"Discussion|Conclusion|References|Acknowledge?ments?|Appendix)\b",
                p, re.I) and len(p) < 40:
        return (2, p)
    return None


def redact(text):
    text = REDACT_RE.sub("", text)
    text = text.replace("†", " ").replace("‡", " ")
    text = re.sub(r"\(\s*\)|（\s*）", "", text)     # empty brackets left behind
    return re.sub(r"[ \t]{2,}", " ", text).strip()


def extract_images(doc, slug, min_px=140):
    """Save embedded figures; returns a list of web paths in page order."""
    saved, seen = [], set()
    n = 0
    for page in doc:
        for info in page.get_images(full=True):
            xref = info[0]
            if xref in seen:
                continue
            seen.add(xref)
            try:
                pix = pymupdf.Pixmap(doc, xref)
                if pix.width < min_px or pix.height < min_px:
                    continue                      # skip rules, logos, artefacts
                if pix.n - pix.alpha >= 4:        # CMYK -> RGB
                    pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                n += 1
                name = f"{slug}-fig{n}.png"
                pix.save(os.path.join(IMAGES, name))
                saved.append(f"content/images/{name}")
            except Exception:
                continue
    return saved


def convert(path):
    slug = os.path.splitext(os.path.basename(path))[0]
    doc = pymupdf.open(path)

    figures = extract_images(doc, slug)

    paragraphs = []
    for page in doc:
        for b in page_columns(page.get_text("blocks"), page.rect.width):
            par = join_lines(b[4])
            if par:
                paragraphs.append(par)

    # Many PDFs emit one block per physical line, so join anything that the
    # previous fragment clearly did not finish. A fragment is "finished" when
    # it ends in sentence punctuation; headings always start fresh.
    ENDS = re.compile(r"[.。．！？!?：:；;]\s*$")

    merged = []
    for par in paragraphs:
        prev = merged[-1] if merged else None
        if (prev is not None
                and not as_heading(par)
                and not as_heading(prev)
                and not ENDS.search(prev)
                and not re.fullmatch(r"[\W_†*]+", prev)):
            if is_cjk(prev[-1:]) or is_cjk(par[:1]):
                merged[-1] += par
            else:
                merged[-1] += " " + par
        else:
            merged.append(par)

    lines, page_no = [], 0
    for par in merged:
        par = redact(par).strip()
        if not par:
            continue
        # drop page numbers and bare running heads
        if re.fullmatch(r"[-–—\s]*\d{1,3}[-–—\s]*", par):
            continue
        # drop fragments left as bare symbols (e.g. a footnote dagger whose
        # author name was redacted)
        if re.fullmatch(r"[\W_†*·・]+", par):
            continue
        h = as_heading(par)
        if h:
            # "1序論" -> "1. 序論"
            txt = re.sub(r"^(\d+(?:\.\d+)*)\s*(?=\S)", r"\1. ", h[1])
            lines.append("#" * h[0] + " " + txt)
        else:
            lines.append(par)

    body = "\n\n".join(lines)

    # Place figures at the end under a heading — inline positions in the
    # original are not reliably recoverable from the text stream.
    if figures:
        body += "\n\n## Figures\n\n" + "\n\n".join(
            f"![Figure {i+1}]({p})" for i, p in enumerate(figures))

    body = re.sub(r"\n{3,}", "\n\n", body).strip() + "\n"
    out = os.path.join(ARTICLES, slug + ".md")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(body)
    return slug, len(body), len(figures), len(lines)


def main():
    os.makedirs(ARTICLES, exist_ok=True)
    os.makedirs(IMAGES, exist_ok=True)
    targets = sys.argv[1:] or sorted(
        os.path.join(PAPERS, f) for f in os.listdir(PAPERS) if f.endswith(".pdf"))
    for p in targets:
        slug, n, figs, paras = convert(p)
        print(f"  {slug[:48]:50} {n:6} chars  {paras:3} blocks  {figs:2} figures")


if __name__ == "__main__":
    main()
