# jeremylim.space

Personal website — profile and CV, writing and research, photography, and links.

Static site, no build step. GitHub Pages serves it directly.

## Editing

Everything is driven by two JSON files, so most changes need no code.

| I want to… | Edit |
|---|---|
| Change the bio, CV, links, or the four tagline targets | `data/content.json` |
| Add a photo to the gallery | drop the file in `images/gallery/`, add an entry to `photos` in `data/content.json` |
| Add an article | drop a `.md` in `content/articles/`, add an entry to `data/articles.json` |
| Add a paper | drop the PDF in `content/papers/`, run `python3 scripts/pdf-to-article.py` |

## Article entries

```json
{
  "id": "my-article",
  "title": "My Article",
  "date": "2026-03-01",
  "category": "Christian Faith",
  "subcategory": "Testimony & Sharing",
  "type": "article",
  "file": "content/articles/my-article.md",
  "excerpt": "One or two sentences."
}
```

Two optional flags control visibility:

- `"unlisted": true` — stays reachable by direct link but is kept off the articles index
- `"noindex": true` — adds a robots meta tag so search engines skip it

`robots.txt` additionally blocks the raw Markdown for anything sensitive, since
those files are fetchable on their own.

## Layout

```
index.html  articles.html  article.html  gallery.html  links.html
css/style.css      design system — deep green and gold, light and dark themes
js/app.js          theme, navigation, rendering, Markdown reader
data/              content.json (profile, CV, links, photos), articles.json (index)
content/           articles, papers, figures, cover images
scripts/           assign-covers.py, pdf-to-article.py
```
