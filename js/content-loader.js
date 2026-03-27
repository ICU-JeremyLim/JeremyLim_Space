/* ============================================
   Content Loader
   Renders public pages from data/content.json
   ============================================ */

(function () {
  'use strict';

  var DATA_URL = 'data/content.json';

  function loadContent() {
    fetch(DATA_URL + '?v=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var page = detectPage();
        if (page === 'index') renderHome(data);
        else if (page === 'gallery') renderGallery(data);
        else if (page === 'writing') renderWriting(data);
        else if (page === 'audio') renderAudio(data);
        else if (page === 'links') renderLinks(data);
        else if (page === 'archive') renderArchive(data);

        // Trigger scroll reveal for any dynamically added content
        if (window.checkReveal) window.checkReveal();
      })
      .catch(function (err) {
        console.warn('Content loader: could not load content.json', err);
      });
  }

  function detectPage() {
    var path = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    return path;
  }

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function shortDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate();
  }

  function monthYear(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ===== ICON MAP =====
  var iconSVGs = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
    twitter: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    globe: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>'
  };

  // ===== HOME PAGE =====
  function renderHome(data) {
    var p = data.profile || {};

    // Profile card fields
    var ncName = document.getElementById('nc-name');
    if (ncName) ncName.textContent = p.name || 'Jeremy Lim';

    var ncTitle = document.getElementById('nc-title');
    if (ncTitle && p.title) ncTitle.innerHTML = p.title.replace(/\//g, ' &middot; ');

    var ncBio = document.getElementById('nc-bio');
    if (ncBio) ncBio.textContent = p.bio || '';

    var ncLocation = document.getElementById('nc-location');
    if (ncLocation) ncLocation.textContent = p.location || '';

    var ncEmail = document.getElementById('nc-email');
    if (ncEmail) { ncEmail.textContent = p.email || ''; ncEmail.href = 'mailto:' + (p.email || ''); }

    var ncEmailChip = document.getElementById('nc-email-chip');
    if (ncEmailChip && p.email) ncEmailChip.href = 'mailto:' + p.email;

    var ncPhoto = document.getElementById('nc-photo');
    if (ncPhoto && p.photo) {
      ncPhoto.innerHTML = '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">';
    }

    // Featured gallery (first 6)
    var featuredGrid = document.getElementById('featured-gallery');
    if (featuredGrid && data.gallery) {
      var photos = data.gallery.slice(0, 6);
      featuredGrid.innerHTML = photos.map(function (item) {
        return '<div class="gallery-grid__item">' +
          '<img src="' + esc(item.thumbnail) + '" alt="' + esc(item.title) + '" loading="lazy">' +
          '<div class="gallery-grid__overlay"><div class="gallery-grid__caption">' + esc(item.title) + '</div>' +
          '<div class="gallery-grid__meta">' + esc(item.category) + ' &middot; ' + (item.date || '').substring(0, 4) + '</div></div></div>';
      }).join('');
    }

    // Recent articles (first 3)
    var recentArticles = document.getElementById('home-articles');
    if (recentArticles && data.articles) {
      var arts = data.articles.slice(0, 3);
      recentArticles.innerHTML = arts.map(function (item) {
        return '<article class="article-card">' +
          '<div><div class="article-card__date">' + formatDate(item.date) + '</div>' +
          '<h3 class="article-card__title">' + esc(item.title) + '</h3>' +
          '<p class="article-card__excerpt">' + esc(item.excerpt) + '</p>' +
          '<div class="article-card__tags">' + (item.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<a href="writing.html" class="article-card__readmore">Read essay &rarr;</a></div></article>';
      }).join('');
    }

    // Recent audio (first 3)
    var homeAudio = document.getElementById('home-audio');
    var homeAudioMore = document.getElementById('home-audio-more');
    if (homeAudio && data.audio && data.audio.length > 0) {
      var tracks = data.audio.slice(0, 3);
      homeAudio.innerHTML = tracks.map(function (item) { return renderAudioCard(item); }).join('');
      if (homeAudioMore) homeAudioMore.style.display = '';
    } else if (homeAudio) {
      homeAudio.parentElement.style.display = 'none';
    }

    // Recommendations
    var recContainer = document.getElementById('home-recommendations');
    if (recContainer && data.recommendations) {
      recContainer.innerHTML = data.recommendations.map(function (item) {
        return '<div class="recommendation-card">' +
          '<div class="recommendation-card__quote">' + esc(item.quote) + '</div>' +
          '<div class="recommendation-card__author">' +
          '<div class="recommendation-card__avatar" style="background:' + (item.avatar ? 'url(' + esc(item.avatar) + ') center/cover' : 'var(--bg-tertiary)') + ';"></div>' +
          '<div><div class="recommendation-card__name">' + esc(item.name) + '</div>' +
          '<div class="recommendation-card__role">' + esc(item.role) + '</div></div></div></div>';
      }).join('');
    }
  }

  // ===== AUDIO CARD HELPER =====
  function renderAudioCard(item) {
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    var durationHtml = item.duration
      ? '<span class="audio-card__duration"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + esc(item.duration) + '</span>'
      : '';
    var playerHtml = item.file
      ? '<audio class="audio-card__player" controls preload="none"><source src="' + esc(item.file) + '">Your browser does not support audio playback.</audio>'
      : '';
    return '<div class="audio-card" data-category="' + esc(item.category || 'other') + '">' +
      '<div class="audio-card__icon">' + iconSvg + '</div>' +
      '<div class="audio-card__body">' +
        '<h3 class="audio-card__title">' + esc(item.title) + '</h3>' +
        '<p class="audio-card__desc">' + esc(item.description || '') + '</p>' +
        '<div class="audio-card__meta">' +
          '<span class="audio-card__date">' + formatDate(item.date) + '</span>' +
          durationHtml +
        '</div>' +
        playerHtml +
      '</div>' +
      '<span class="audio-card__category">' + esc(item.category || 'other') + '</span>' +
      '</div>';
  }

  // ===== GALLERY PAGE =====
  function renderGallery(data) {
    var grid = document.getElementById('gallery-grid');
    if (!grid || !data.gallery) return;

    grid.innerHTML = data.gallery.map(function (item) {
      return '<div class="gallery-grid__item" data-category="' + esc(item.category) + '" data-caption="' + esc(item.caption || item.title) + '" data-full="' + esc(item.full || item.thumbnail) + '">' +
        '<img src="' + esc(item.thumbnail) + '" alt="' + esc(item.title) + '" loading="lazy">' +
        '<div class="gallery-grid__overlay"><div class="gallery-grid__caption">' + esc(item.title) + '</div>' +
        '<div class="gallery-grid__meta">' + esc(item.category) + ' &middot; ' + (item.date || '').substring(0, 4) + '</div></div></div>';
    }).join('');

    // Re-initialize lightbox and filters for new items
    if (window.reinitGallery) window.reinitGallery();
  }

  // ===== WRITING PAGE =====
  function renderWriting(data) {
    var list = document.getElementById('articles-list');
    if (!list || !data.articles) return;

    list.innerHTML = data.articles.map(function (item, i) {
      var isFeatured = item.featured && i === 0;
      var cls = 'article-card reveal' + (isFeatured ? ' article-card--featured' : '');
      var imgHtml = '';
      if (isFeatured && item.image) {
        imgHtml = '<div class="article-card__image"><img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy"></div>';
      }
      var contentHtml = '';
      if (item.content) {
        // If content looks like HTML (has tags), use as-is; otherwise wrap paragraphs
        var raw = item.content;
        if (raw.indexOf('<p>') === -1) {
          contentHtml = raw.split(/\n\n+/).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
        } else {
          contentHtml = raw;
        }
      }
      return '<article class="' + cls + '" data-article-id="' + esc(item.id) + '">' + imgHtml + '<div>' +
        '<div class="article-card__date">' + formatDate(item.date) + '</div>' +
        '<h2 class="article-card__title">' + esc(item.title) + '</h2>' +
        '<p class="article-card__excerpt">' + esc(item.excerpt) + '</p>' +
        '<div class="article-card__content" style="display:none;">' + contentHtml + '</div>' +
        '<div class="article-card__tags">' + (item.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<span class="article-card__readmore" style="cursor:pointer;">Read full essay &rarr;</span></div></article>';
    }).join('');

    // Bind click to expand/collapse
    list.querySelectorAll('.article-card__readmore').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.article-card');
        var content = card.querySelector('.article-card__content');
        if (!content) return;
        var isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        btn.textContent = isOpen ? 'Read full essay \u2192' : 'Collapse \u2191';
      });
    });
  }

  // ===== LINKS PAGE =====
  function renderLinks(data) {
    // Social links
    var linksGrid = document.getElementById('links-grid');
    if (linksGrid && data.links) {
      linksGrid.innerHTML = data.links.map(function (item) {
        var icon = iconSVGs[item.icon] || iconSVGs.link;
        return '<a href="' + esc(item.url) + '" class="link-card" target="_blank" rel="noopener noreferrer">' +
          '<div class="link-card__icon">' + icon + '</div>' +
          '<div><div class="link-card__title">' + esc(item.title) + '</div>' +
          '<div class="link-card__desc">' + esc(item.description) + '</div>' +
          '<div class="link-card__url">' + esc(item.handle) + '</div></div></a>';
      }).join('');
    }

    // Videos
    var videoGrid = document.getElementById('video-grid');
    if (videoGrid && data.videos) {
      videoGrid.innerHTML = data.videos.map(function (item) {
        return '<div class="video-card">' +
          '<div class="video-card__embed"><iframe src="about:blank" data-src="' + esc(item.embedUrl) + '" title="' + esc(item.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' +
          '<div class="video-card__info"><div class="video-card__title">' + esc(item.title) + '</div>' +
          '<div class="video-card__desc">' + esc(item.description) + '</div></div></div>';
      }).join('');

      // Lazy load new iframes
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var iframe = entry.target;
            var src = iframe.getAttribute('data-src');
            if (src) { iframe.src = src; iframe.removeAttribute('data-src'); }
            observer.unobserve(iframe);
          }
        });
      }, { rootMargin: '200px' });
      videoGrid.querySelectorAll('iframe[data-src]').forEach(function (iframe) { observer.observe(iframe); });
    }
  }

  // ===== AUDIO PAGE =====
  function renderAudio(data) {
    var list = document.getElementById('audio-list');
    var emptyState = document.getElementById('audio-empty');
    if (!list) return;

    if (!data.audio || data.audio.length === 0) {
      list.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
      return;
    }

    list.innerHTML = data.audio.map(function (item) { return renderAudioCard(item); }).join('');
    if (emptyState) emptyState.style.display = 'none';
  }

  // ===== ARCHIVE PAGE =====
  function renderArchive(data) {
    var container = document.getElementById('archive-container');
    if (!container) return;

    // Gather all items
    var all = [];
    (data.gallery || []).forEach(function (i) { all.push({ type: 'photo', title: i.title, date: i.date, link: 'gallery.html' }); });
    (data.articles || []).forEach(function (i) { all.push({ type: 'essay', title: i.title, date: i.date, link: 'writing.html' }); });
    (data.audio || []).forEach(function (i) { all.push({ type: 'audio', title: i.title, date: i.date, link: 'audio.html' }); });
    (data.videos || []).forEach(function (i) { all.push({ type: 'video', title: i.title, date: i.date, link: 'links.html' }); });

    // Sort by date descending
    all.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

    // Group by year
    var years = {};
    all.forEach(function (item) {
      var year = (item.date || '').substring(0, 4) || 'Unknown';
      if (!years[year]) years[year] = [];
      years[year].push(item);
    });

    var html = '';
    Object.keys(years).sort().reverse().forEach(function (year) {
      html += '<div class="archive-list reveal"><div class="archive-year">' + year + '</div>';
      years[year].forEach(function (item) {
        html += '<div class="archive-item" data-archive-type="' + esc(item.type) + '">' +
          '<span class="archive-item__date">' + shortDate(item.date) + '</span>' +
          '<span class="archive-item__title"><a href="' + esc(item.link) + '">' + esc(item.title) + '</a></span>' +
          '<span class="archive-item__type">' + esc(item.type) + '</span></div>';
      });
      html += '</div>';
    });

    container.innerHTML = html;

    // Re-bind archive filters
    if (window.reinitArchiveFilters) window.reinitArchiveFilters();
  }

  // Load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }

})();
