/* =========================================
   Jeremy Lim — app.js
   Single JS file: theme, nav, content, lightbox
   ========================================= */
(function () {
  'use strict';

  /* ---- Theme ---- */
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initReveal();
    initBackToTop();
    loadContent();
  });

  /* ---- Theme toggle ---- */
  function initTheme() {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    updateThemeIcon(btn);
    btn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(btn);
    });
  }
  function updateThemeIcon(btn) {
    var sun  = btn.querySelector('.icon-sun');
    var moon = btn.querySelector('.icon-moon');
    if (sun)  sun.style.display  = theme === 'dark'  ? 'block' : 'none';
    if (moon) moon.style.display = theme === 'light' ? 'block' : 'none';
  }

  /* ---- Mobile nav ---- */
  function initNav() {
    var toggle = document.querySelector('.nav__toggle');
    var mobile = document.querySelector('.nav__mobile');
    if (!toggle || !mobile) return;
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
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

  /* ---- Content loader ---- */
  function loadContent() {
    fetch('data/content.json?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var page = location.pathname.split('/').pop().replace('.html', '') || 'index';
        if (page === 'index')    renderHome(data);
        if (page === 'articles') renderArticles(data);
        if (page === 'gallery')  renderGallery(data);
        if (page === 'links')    renderLinks(data);
        // Re-run reveal for dynamically inserted elements
        setTimeout(initReveal, 50);
      })
      .catch(function (e) { console.warn('Could not load content.json', e); });
  }

  /* ---- Helpers ---- */
  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }
  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  /* ==========================
     HOME PAGE
  ========================== */
  function renderHome(data) {
    var p = data.profile || {};

    // Profile
    var photo = document.getElementById('profile-photo');
    if (photo) {
      if (p.photo) {
        photo.innerHTML = '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">';
      } else {
        photo.textContent = 'Your photo';
      }
    }
    setText('profile-name', p.name);
    setText('profile-tagline', p.tagline);
    setText('profile-bio', p.bio);
    setText('profile-location', p.location);

    var emailEl = document.getElementById('profile-email');
    if (emailEl && p.email) {
      emailEl.textContent = p.email;
      emailEl.href = 'mailto:' + p.email;
    }

    // Social buttons
    var socialsEl = document.getElementById('profile-socials');
    if (socialsEl && p.social) {
      socialsEl.innerHTML = p.social.filter(function (s) { return s.url; }).map(function (s) {
        return '<a href="' + esc(s.url) + '" class="social-btn" target="_blank" rel="noopener">' +
          esc(s.label) + '</a>';
      }).join('');
    }

    // Module covers
    var covers = data.covers || {};
    ['articles', 'photos', 'links'].forEach(function (key) {
      var card = document.querySelector('.module-card[data-module="' + key + '"]');
      if (!card) return;
      var bg = card.querySelector('.module-card__bg');
      if (bg && covers[key]) {
        bg.style.backgroundImage = 'url(' + esc(covers[key]) + ')';
      }
      // sub-count
      var sub = card.querySelector('.module-card__sub');
      if (sub) {
        var counts = { articles: (data.articles || []).length, photos: (data.photos || []).length, links: (data.links || []).length };
        sub.textContent = counts[key] + ' ' + key;
      }
    });
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }

  /* ==========================
     ARTICLES PAGE
  ========================== */
  function renderArticles(data) {
    var list = document.getElementById('articles-list');
    if (!list || !data.articles) return;

    list.innerHTML = data.articles.map(function (item) {
      var coverHtml = item.cover
        ? '<img class="article-cover" src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" loading="lazy">'
        : '';
      var tagsHtml = (item.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var contentHtml = (item.content || '').split(/\n\n+/).map(function (p) {
        return '<p>' + esc(p.trim()) + '</p>';
      }).join('');
      return '<article class="article-item reveal">' +
        coverHtml +
        '<div class="article-meta"><span class="article-date">' + fmtDate(item.date) + '</span>' + tagsHtml + '</div>' +
        '<h2 class="article-title">' + esc(item.title) + '</h2>' +
        '<p class="article-excerpt">' + esc(item.excerpt) + '</p>' +
        '<button class="article-toggle" data-id="' + esc(item.id) + '">Read full article <span>→</span></button>' +
        '<div class="article-body" id="body-' + esc(item.id) + '">' + contentHtml + '</div>' +
        '</article>';
    }).join('');

    // Expand / collapse
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.article-toggle');
      if (!btn) return;
      var body = document.getElementById('body-' + btn.getAttribute('data-id'));
      if (!body) return;
      var open = body.classList.toggle('open');
      btn.innerHTML = open ? 'Collapse <span>↑</span>' : 'Read full article <span>→</span>';
    });
  }

  /* ==========================
     GALLERY PAGE
  ========================== */
  function renderGallery(data) {
    var grid = document.getElementById('photo-grid');
    if (!grid || !data.photos) return;

    var photos = data.photos;
    grid.innerHTML = photos.map(function (item, i) {
      return '<div class="photo-item reveal" data-idx="' + i + '">' +
        '<img src="' + esc(item.file) + '" alt="' + esc(item.caption || '') + '" loading="lazy">' +
        '<div class="photo-caption">' + esc(item.caption || '') + '</div>' +
        '</div>';
    }).join('');

    initLightbox(grid, photos);
  }

  function initLightbox(grid, photos) {
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-caption');
    if (!lb || !lbImg) return;
    var cur = 0;

    function show(i) {
      cur = (i + photos.length) % photos.length;
      lbImg.src = photos[cur].file;
      if (lbCap) lbCap.textContent = photos[cur].caption || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    grid.addEventListener('click', function (e) {
      var item = e.target.closest('.photo-item');
      if (item) show(parseInt(item.getAttribute('data-idx'), 10));
    });

    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    document.getElementById('lb-close').addEventListener('click', close);
    document.getElementById('lb-prev').addEventListener('click', function () { show(cur - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(cur + 1); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ==========================
     LINKS PAGE
  ========================== */
  function renderLinks(data) {
    var list = document.getElementById('links-list');
    if (!list || !data.links) return;

    list.innerHTML = data.links.map(function (item) {
      var hasUrl = item.url && item.url !== '';
      var icon = ICONS[item.icon] || ICONS.link;
      return '<a ' + (hasUrl ? 'href="' + esc(item.url) + '" target="_blank" rel="noopener"' : '') +
        ' class="link-item reveal' + (hasUrl ? '' : ' link-item--disabled') + '">' +
        '<div class="link-icon">' + icon + '</div>' +
        '<div><div class="link-title">' + esc(item.title) + '</div>' +
        '<div class="link-note">' + esc(item.note || '') + '</div></div>' +
        '<span class="link-arrow">' + ARROW + '</span>' +
        '</a>';
    }).join('');
  }

})();
