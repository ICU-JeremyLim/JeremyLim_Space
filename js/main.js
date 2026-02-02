/* ============================================
   Jeremy Lim — Personal Website
   Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const themeToggle = document.querySelector('.theme-toggle');
  const htmlEl = document.documentElement;
  const iconSun = document.querySelector('.icon-sun');
  const iconMoon = document.querySelector('.icon-moon');

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (iconSun && iconMoon) {
      iconSun.style.display = theme === 'dark' ? 'none' : 'block';
      iconMoon.style.display = theme === 'dark' ? 'block' : 'none';
    }
  }

  // Load saved theme or respect system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = htmlEl.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Mobile Navigation ---
  const navToggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll Reveal ---
  function checkReveal() {
    var windowHeight = window.innerHeight;
    document.querySelectorAll('.reveal').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 80) {
        el.classList.add('is-visible');
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('load', checkReveal);
  checkReveal();

  // --- Back to Top ---
  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Gallery Filter ---
  function initGalleryFilters() {
    var filterButtons = document.querySelectorAll('.gallery-filter-btn[data-filter]');
    var galleryItems = document.querySelectorAll('.gallery-grid__item[data-category]');

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');
        filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
        this.classList.add('is-active');

        galleryItems = document.querySelectorAll('.gallery-grid__item[data-category]');
        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
            item.style.opacity = '0';
            requestAnimationFrame(function () {
              item.style.transition = 'opacity 0.4s ease';
              item.style.opacity = '1';
            });
          } else {
            item.style.opacity = '0';
            setTimeout(function () { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }
  initGalleryFilters();

  // --- Archive Filter ---
  function initArchiveFilters() {
    var archiveFilterButtons = document.querySelectorAll('.gallery-filter-btn[data-archive-filter]');

    archiveFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-archive-filter');
        archiveFilterButtons.forEach(function (b) { b.classList.remove('is-active'); });
        this.classList.add('is-active');

        var archiveItems = document.querySelectorAll('.archive-item[data-archive-type]');
        archiveItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-archive-type') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
  initArchiveFilters();

  // --- Lightbox ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox__nav--prev') : null;
  var lightboxNext = lightbox ? lightbox.querySelector('.lightbox__nav--next') : null;

  var lightboxItems = [];
  var lightboxIndex = 0;

  function updateLightboxItems() {
    lightboxItems = Array.from(document.querySelectorAll('.gallery-grid__item')).filter(function (item) {
      return item.style.display !== 'none';
    });
  }

  function openLightbox(index) {
    updateLightboxItems();
    if (!lightbox || !lightboxItems.length) return;

    lightboxIndex = index;
    var item = lightboxItems[lightboxIndex];
    var fullSrc = item.getAttribute('data-full') || item.querySelector('img').src;
    var caption = item.getAttribute('data-caption') || '';

    lightboxImg.src = fullSrc;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function navigateLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    var item = lightboxItems[lightboxIndex];
    var fullSrc = item.getAttribute('data-full') || item.querySelector('img').src;
    var caption = item.getAttribute('data-caption') || '';
    lightboxImg.src = fullSrc;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
  }

  // Attach click events to gallery items
  function bindGalleryClicks() {
    document.querySelectorAll('.gallery-grid__item').forEach(function (item) {
      item.addEventListener('click', function () {
        updateLightboxItems();
        var visibleIndex = lightboxItems.indexOf(item);
        if (visibleIndex >= 0) openLightbox(visibleIndex);
      });
    });
  }
  bindGalleryClicks();

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); navigateLightbox(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); navigateLightbox(1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // --- Lazy load video iframes ---
  var videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var iframe = entry.target;
        var src = iframe.getAttribute('data-src');
        if (src) {
          iframe.src = src;
          iframe.removeAttribute('data-src');
        }
        videoObserver.unobserve(iframe);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('iframe[data-src]').forEach(function (iframe) {
    videoObserver.observe(iframe);
  });

  // --- Smooth active nav link highlight ---
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('nav__link--active');
    }
  });

  // --- Expose reinit functions for content-loader.js ---
  window.checkReveal = checkReveal;

  window.reinitGallery = function () {
    initGalleryFilters();
    bindGalleryClicks();
    checkReveal();
  };

  window.reinitArchiveFilters = function () {
    initArchiveFilters();
    checkReveal();
  };

})();
