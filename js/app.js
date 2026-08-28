/* =========================================
   Jeremy Lim — app.js
   Theme · nav · content · gallery · markdown
   ========================================= */
(function () {
  'use strict';

  /* ---- Theme ----
     Deep-green is the signature look, so it is the default; an explicit
     choice is remembered. The inline <head> script applies this before
     first paint — this just keeps the module in sync. ---- */
  var theme = (function () {
    try { return localStorage.getItem('theme') || 'dark'; }
    catch (e) { return 'dark'; }
  })();
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initReveal();
    initBackToTop();
    initReadProgress();
    loadContent();
  });

  /* ---- Theme toggle ---- */
  function initTheme() {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    paintThemeIcon(btn);
    btn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (e) {}
      paintThemeIcon(btn);
    });
  }
  function paintThemeIcon(btn) {
    var sun = btn.querySelector('.icon-sun'), moon = btn.querySelector('.icon-moon');
    if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none';
    if (moon) moon.style.display = theme === 'light' ? 'block' : 'none';
  }

  /* ---- Nav: scroll state + mobile menu ---- */
  function initNav() {
    // Floating pill: lifts on scroll, and hides going down / returns going up.
    var nav = document.querySelector('.nav');
    if (nav) {
      var lastY = window.scrollY;
      var onScroll = function () {
        var y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 12);
        // never hide near the top, or while the mobile menu is open
        var menuOpen = document.querySelector('.nav__mobile.open');
        if (!menuOpen && y > 160) {
          nav.classList.toggle('is-hidden', y > lastY + 4);
        } else {
          nav.classList.remove('is-hidden');
        }
        lastY = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var toggle = document.querySelector('.nav__toggle');
    var mobile = document.querySelector('.nav__mobile');
    if (!toggle || !mobile) return;
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      toggle.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobile.classList.remove('open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal ----
     Only opts into hiding when we know we can un-hide (see .js-reveal in CSS),
     and always has a timeout failsafe so content can never be stranded. */
  function initReveal() {
    var els = document.querySelectorAll('.reveal:not(.visible)');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    document.documentElement.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -50px 0px' });
    els.forEach(function (el) { io.observe(el); });

    // Failsafe: anything still hidden after 1.5s gets shown regardless.
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('visible'); });
    }, 1500);
  }

  /* ---- Back to top ---- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---- Reading progress (article page) ---- */
  function initReadProgress() {
    var bar = document.getElementById('read-bar');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ---- Helpers ---- */
  function esc(s) {
    if (s === undefined || s === null) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }
  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s + 'T00:00:00');
    if (isNaN(d)) return s;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  }
  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  var ICONS = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
    youtube:   '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>',
    linkedin:  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github:    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
    mail:      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    link:      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
  };
  var ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

  /* =========================================================
     Minimal Markdown renderer
     Handles: headings, bold/italic, links, images, lists,
     blockquotes, hr, and paragraphs. Escapes HTML first.
     ========================================================= */
  function markdown(src) {
    var text = esc(src.replace(/\r\n/g, '\n'));
    var blocks = text.split(/\n{2,}/);
    var html = [];

    blocks.forEach(function (block) {
      var b = block.trim();
      if (!b) return;

      // horizontal rule
      if (/^(---+|\*\*\*+|___+)$/.test(b)) { html.push('<hr>'); return; }

      // heading
      var h = b.match(/^(#{1,6})\s+(.*)$/s);
      if (h && h[2].indexOf('\n') === -1) {
        var lvl = Math.min(h[1].length + 1, 6); // demote: page <h1> is the title
        html.push('<h' + lvl + '>' + inline(h[2]) + '</h' + lvl + '>');
        return;
      }

      // blockquote
      if (/^>\s?/.test(b)) {
        var quoted = b.split('\n').map(function (l) { return l.replace(/^>\s?/, ''); }).join('<br>');
        html.push('<blockquote>' + inline(quoted) + '</blockquote>');
        return;
      }

      // unordered / ordered list
      var lines = b.split('\n');
      if (lines.every(function (l) { return /^\s*[-*+]\s+/.test(l) || !l.trim(); })) {
        html.push('<ul>' + lines.filter(function (l) { return l.trim(); })
          .map(function (l) { return '<li>' + inline(l.replace(/^\s*[-*+]\s+/, '')) + '</li>'; })
          .join('') + '</ul>');
        return;
      }
      if (lines.every(function (l) { return /^\s*\d+[.)]\s+/.test(l) || !l.trim(); })) {
        html.push('<ol>' + lines.filter(function (l) { return l.trim(); })
          .map(function (l) { return '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>'; })
          .join('') + '</ol>');
        return;
      }

      // standalone image paragraph
      if (/^!\[[^\]]*\]\([^)]+\)$/.test(b)) { html.push(inline(b)); return; }

      html.push('<p>' + inline(b).replace(/\n/g, '<br>') + '</p>');
    });

    return html.join('\n');
  }

  function inline(s) {
    return s
      // image  ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g,
        '<img src="$2" alt="$1" loading="lazy">')
      // link  [text](href)
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // bold then italic (bold first so *** works)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      // bare URLs
      .replace(/(^|\s)(https?:\/\/[^\s<]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  }

  /* ---- Router ---- */
  function loadContent() {
    var page = location.pathname.split('/').pop().replace('.html', '') || 'index';

    if (page === 'article') { renderReader(); return; }

    fetch('data/content.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (page === 'index')   renderHome(data);
        if (page === 'gallery') renderGallery(data);
        if (page === 'links')   renderLinks(data);
        if (page === 'articles') return renderArticlesIndex();
      })
      .then(function () { setTimeout(initReveal, 40); })
      .catch(function (e) { console.warn('content.json failed', e); });
  }

  /* =========================
     HOME
     ========================= */
  function renderHome(data) {
    var p = data.profile || {};

    var photo = document.getElementById('profile-photo');
    if (photo) {
      photo.innerHTML = p.photo
        ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">'
        : 'Your photo';
    }
    setText('profile-name', p.name);
    setText('profile-bio', p.bio);
    setText('profile-location', p.location);

    // Tagline with per-label hyperlinks
    var tagEl = document.getElementById('profile-tagline');
    if (tagEl && p.taglineLinks && p.taglineLinks.length) {
      tagEl.innerHTML = p.taglineLinks.map(function (t) {
        return '<a class="tagline-link" href="' + esc(t.url) + '">' + esc(t.label) + '</a>';
      }).join('<span class="tagline-sep">·</span>');
    } else if (tagEl) {
      tagEl.textContent = p.tagline || '';
    }

    var emailEl = document.getElementById('profile-email');
    if (emailEl && p.email) { emailEl.textContent = p.email; emailEl.href = 'mailto:' + p.email; }

    var socialsEl = document.getElementById('profile-socials');
    if (socialsEl && p.social) {
      socialsEl.innerHTML = p.social.filter(function (s) { return s.url; }).map(function (s) {
        return '<a href="' + esc(s.url) + '" class="social-btn" target="_blank" rel="noopener">' +
          esc(s.label) + '</a>';
      }).join('');
    }

    // CV timeline
    var cvList = document.getElementById('cv-list');
    if (cvList && data.cv && data.cv.length) {
      cvList.innerHTML = data.cv.map(function (i) {
        return '<div class="cv-item">' +
          '<div class="cv-year">' + esc(i.year) + '</div>' +
          '<div class="cv-body">' +
            '<span class="cv-title">' + esc(i.title) + '</span>' +
            '<span class="cv-badge cv-badge--' + esc(i.type) + '">' + esc(i.type) + '</span>' +
            (i.org ? '<span class="cv-org">' + esc(i.org) + '</span>' : '') +
          '</div></div>';
      }).join('');
    }

    // Module card covers + counts
    var covers = data.covers || {};
    fetch('data/articles.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (arts) {
        paintModules(covers, {
          articles: arts.length,
          photos:   (data.photos || []).length,
          links:    (data.links || []).filter(function (l) { return l.url; }).length
        });
      })
      .catch(function () {
        paintModules(covers, {
          articles: 0,
          photos: (data.photos || []).length,
          links: (data.links || []).filter(function (l) { return l.url; }).length
        });
      });
  }

  function paintModules(covers, counts) {
    ['articles', 'photos', 'links'].forEach(function (key) {
      var card = document.querySelector('.module-card[data-module="' + key + '"]');
      if (!card) return;
      var bg = card.querySelector('.module-card__bg');
      if (bg && covers[key]) bg.style.backgroundImage = 'url(' + covers[key] + ')';
      var sub = card.querySelector('.module-card__sub');
      if (sub) sub.textContent = counts[key] + ' ' + (counts[key] === 1
        ? key.replace(/s$/, '') : key);
    });
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }

  /* =========================
     ARTICLES INDEX (categorized)
     ========================= */
  function renderArticlesIndex() {
    var host = document.getElementById('articles-index');
    if (!host) return;

    return fetch('data/articles.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (items) {
        var ORDER = ['Christian Faith', 'Linguistics', 'Random Topics'];
        var byCat = {};
        items.forEach(function (it) {
          (byCat[it.category] = byCat[it.category] || {});
          (byCat[it.category][it.subcategory] = byCat[it.category][it.subcategory] || []).push(it);
        });

        var cats = ORDER.filter(function (c) { return byCat[c]; })
          .concat(Object.keys(byCat).filter(function (c) { return ORDER.indexOf(c) === -1; }));

        host.innerHTML = cats.map(function (cat) {
          var subs = byCat[cat];
          var total = Object.keys(subs).reduce(function (n, s) { return n + subs[s].length; }, 0);
          return '<section class="cat" id="' + slug(cat) + '">' +
            '<header class="cat__head reveal">' +
              '<h2 class="cat__title">' + esc(cat) + '</h2>' +
              '<span class="cat__count">' + total + '</span>' +
            '</header>' +
            Object.keys(subs).map(function (sub) {
              return '<div class="subcat" id="' + slug(cat) + '-' + slug(sub) + '">' +
                '<h3 class="subcat__title reveal">' + esc(sub) + '</h3>' +
                '<div class="entry-list">' +
                  subs[sub].map(entryCard).join('') +
                '</div></div>';
            }).join('') +
          '</section>';
        }).join('');

        initCatBar();
      });
  }

  function entryCard(it) {
    var href, target = '', badge, thumb = '';

    if (it.type === 'article') {
      href = 'article.html?id=' + encodeURIComponent(it.id);
      badge = '<span class="entry__type entry__type--read">Read</span>';
    } else if (it.type === 'pdf') {
      href = it.file; target = ' target="_blank" rel="noopener"';
      badge = '<span class="entry__type entry__type--pdf">PDF' +
        (it.size ? ' · ' + it.size + 'MB' : '') + '</span>';
    } else { // poster
      href = it.file; target = ' target="_blank" rel="noopener"';
      badge = '<span class="entry__type entry__type--poster">Poster</span>';
    }

    // The poster shows itself; everything else shows its themed cover.
    var img = it.thumb || it.cover;
    if (img) {
      thumb = '<div class="entry__thumb"><img src="' + esc(img) +
        '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>';
    }

    return '<a class="entry reveal" href="' + esc(href) + '"' + target + '>' +
      thumb +
      '<div class="entry__body">' +
        '<div class="entry__top">' + badge +
          '<span class="entry__date">' + fmtDate(it.date) + '</span></div>' +
        '<h4 class="entry__title">' + esc(it.title) + '</h4>' +
        '<p class="entry__excerpt">' + esc(it.excerpt || '') + '</p>' +
      '</div>' +
      '<span class="entry__arrow">' + ARROW + '</span>' +
    '</a>';
  }

  /* Highlight the category chip matching the section in view */
  function initCatBar() {
    var chips = document.querySelectorAll('.cat-chip');
    var sections = document.querySelectorAll('.cat');
    if (!chips.length || !sections.length) return;

    function sync() {
      var best = null, bestTop = Infinity;
      sections.forEach(function (s) {
        var top = Math.abs(s.getBoundingClientRect().top - 120);
        if (top < bestTop) { bestTop = top; best = s.id; }
      });
      chips.forEach(function (c) {
        c.classList.toggle('cat-chip--active', c.getAttribute('href') === '#' + best);
      });
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  /* =========================
     ARTICLE READER
     ========================= */
  function renderReader() {
    var id = qs('id');
    var titleEl = document.getElementById('reader-title');
    var bodyEl  = document.getElementById('reader-body');
    var metaEl  = document.getElementById('reader-meta');
    if (!bodyEl) return;

    if (!id) {
      titleEl.textContent = 'Article not found';
      bodyEl.innerHTML = '<p>No article was specified. <a href="articles.html">Browse all articles</a>.</p>';
      return;
    }

    fetch('data/articles.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (items) {
        var it = items.filter(function (x) { return x.id === id; })[0];
        if (!it) throw new Error('not indexed');

        document.title = it.title + ' — Jeremy Lim';
        titleEl.textContent = it.title;

        var heroEl = document.getElementById('reader-hero');
        if (heroEl && it.cover) {
          heroEl.innerHTML = '<img src="' + esc(it.cover) + '" alt="" ' +
            'onerror="this.parentNode.style.display=\'none\'">';
          heroEl.style.display = '';
        }
        metaEl.innerHTML =
          '<a class="reader__cat" href="articles.html#' + slug(it.category) + '">' +
            esc(it.category) + '</a>' +
          '<span class="reader__dot">·</span>' +
          '<span>' + esc(it.subcategory) + '</span>' +
          '<span class="reader__dot">·</span>' +
          '<span>' + fmtDate(it.date) + '</span>';

        return fetch(it.file + '?v=' + Date.now()).then(function (r) {
          if (!r.ok) throw new Error('md missing');
          return r.text();
        });
      })
      .then(function (md) {
        bodyEl.innerHTML = markdown(md);
        // make relative image paths work from any page depth
        bodyEl.querySelectorAll('img').forEach(function (img) {
          img.addEventListener('error', function () { img.style.display = 'none'; });
        });
      })
      .catch(function () {
        titleEl.textContent = 'Article not found';
        bodyEl.innerHTML = '<p>Sorry, this article could not be loaded. ' +
          '<a href="articles.html">Browse all articles</a>.</p>';
      });
  }

  /* =========================
     GALLERY
     ========================= */
  function renderGallery(data) {
    var grid = document.getElementById('photo-grid');
    var empty = document.getElementById('photo-empty');
    if (!grid) return;

    var photos = data.photos || [];
    if (!photos.length) {
      grid.style.display = 'none';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    grid.innerHTML = photos.map(function (item, i) {
      return '<div class="photo-item reveal" data-idx="' + i + '">' +
        '<img src="' + esc(item.file) + '" alt="' + esc(item.caption || '') + '" loading="lazy">' +
        '<div class="photo-caption">' + esc(item.caption || '') + '</div></div>';
    }).join('');

    initLightbox(grid, photos);
  }

  function initLightbox(grid, photos) {
    var lb = document.getElementById('lightbox'), img = document.getElementById('lb-img'),
        cap = document.getElementById('lb-caption');
    if (!lb || !img) return;
    var cur = 0;

    function show(i) {
      cur = (i + photos.length) % photos.length;
      img.src = photos[cur].file;
      if (cap) cap.textContent = photos[cur].caption || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      img.src = '';
    }

    grid.addEventListener('click', function (e) {
      var item = e.target.closest('.photo-item');
      if (item) show(parseInt(item.getAttribute('data-idx'), 10));
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.getElementById('lb-close').addEventListener('click', close);
    document.getElementById('lb-prev').addEventListener('click', function () { show(cur - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(cur + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* =========================
     LINKS
     ========================= */
  function renderLinks(data) {
    var list = document.getElementById('links-list');
    if (!list || !data.links) return;

    list.innerHTML = data.links.map(function (item) {
      var has = item.url && item.url !== '';
      var icon = ICONS[item.icon] || ICONS.link;
      return '<a ' + (has ? 'href="' + esc(item.url) + '" target="_blank" rel="noopener"' : '') +
        ' class="link-item reveal' + (has ? '' : ' link-item--disabled') + '">' +
        '<div class="link-icon">' + icon + '</div>' +
        '<div><div class="link-title">' + esc(item.title) + '</div>' +
        '<div class="link-note">' + esc(item.note || '') + '</div></div>' +
        '<span class="link-arrow">' + ARROW + '</span></a>';
    }).join('');
  }

})();
