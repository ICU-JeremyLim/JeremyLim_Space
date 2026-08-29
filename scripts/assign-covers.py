#!/usr/bin/env python3
"""
assign-covers.py — give every article its own cover image.

Each category/subcategory has a cover "family" (e.g. faith-testimony,
faith-testimony-2, faith-testimony-3 …). This walks the files that actually
exist in content/covers/ and hands them out so that no two articles in the
same subcategory share an image where that can be avoided.

Safe to re-run after adding or removing cover files.
"""

import json
import os
import re

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COVERS  = os.path.join(ROOT, "content", "covers")
INDEX   = os.path.join(ROOT, "data", "articles.json")

# category/subcategory -> cover family stem
FAMILY = {
    ("Christian Faith", "Testimony & Sharing"):                 "faith-testimony",
    ("Christian Faith", "History Research about Christianity"):  "faith-history",
    ("Linguistics",     "Phonology"):                            "ling-phonology",
    ("Linguistics",     "Phonetics"):                            "ling-phonetics",
    ("Linguistics",     "Syntax"):                               "ling-syntax",
    ("Linguistics",     "Social Linguistics"):                   "ling-social",
    ("Random Topics",   "Science"):                              "topic-science",
    ("Random Topics",   "Education"):                            "topic-education",
    ("Random Topics",   "East Asia"):                            "topic-eastasia",
}


def family_members(stem):
    """All existing files for a stem: stem.jpg, stem-2.jpg, stem-3.jpg …"""
    if not os.path.isdir(COVERS):
        return []
    pat = re.compile(r"^%s(-(\d+))?\.jpe?g$" % re.escape(stem), re.I)
    found = []
    for f in os.listdir(COVERS):
        m = pat.match(f)
        if m:
            found.append((int(m.group(2) or 1), f))
    return ["content/covers/" + f for _, f in sorted(found)]


def main():
    articles = json.load(open(INDEX, encoding="utf-8"))

    # hand out covers per subcategory, in the order articles appear
    used = {}
    assigned = shared = 0

    for a in articles:
        # the poster is its own artwork and keeps its real thumbnail
        if a.get("type") == "poster":
            a.pop("cover", None)
            continue

        stem = FAMILY.get((a.get("category"), a.get("subcategory")))
        pool = family_members(stem) if stem else []
        if not pool:
            a.pop("cover", None)
            continue

        i = used.get(stem, 0)
        a["cover"] = pool[i % len(pool)]
        if i >= len(pool):
            shared += 1
        used[stem] = i + 1
        assigned += 1

    with open(INDEX, "w", encoding="utf-8") as fh:
        json.dump(articles, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print("covers assigned : %d/%d entries" % (assigned, len(articles)))
    if shared:
        print("reused an image : %d (not enough covers in that family)" % shared)
    for (cat, sub), stem in FAMILY.items():
        n_pool = len(family_members(stem))
        n_art = sum(1 for a in articles
                    if a.get("category") == cat and a.get("subcategory") == sub
                    and a.get("type") != "poster")
        flag = "" if n_pool >= n_art else "   <-- needs %d more" % (n_art - n_pool)
        print("  %-34s %d cover(s) for %d article(s)%s" % (sub, n_pool, n_art, flag))


if __name__ == "__main__":
    main()
