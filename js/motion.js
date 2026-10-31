/* ============================================================
   Motion layer — parallax, stagger, tilt, page transitions
   Progressive enhancement only: nothing here is required for
   the page to render or work.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(pointer: fine)');
  /* ?motion=full adds .motion-full and disables the reduced-motion
     stylesheet, so previews can see the full choreography */
  var calm = function () {
    return reduce.matches && !root.classList.contains('motion-full');
  };

  /* ---------- stagger delays for grouped reveals ---------- */
  var groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    if (i > 0) el.style.setProperty('--d', Math.min(i * 70, 280) + 'ms');
    groups.set(parent, i + 1);
  });

  if (!calm()) {
    /* ---------- hero parallax (scroll + pointer) ---------- */
    var hero = document.querySelector('.hero');
    var art = hero && hero.querySelector('.hero-art');
    var px = 0, py = 0, queued = false;

    var apply = function () {
      queued = false;
      if (!hero || !art) return;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      var offset = Math.min(Math.max(-rect.top, 0), 700) * 0.055;
      art.style.transform =
        'translate3d(' + (px * 9).toFixed(2) + 'px,' + (offset + py * 7).toFixed(2) + 'px,0)';
    };
    var queue = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    if (hero && art) {
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);

      if (fine.matches) {
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
          py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
          hero.style.setProperty('--mx', px.toFixed(3));
          hero.style.setProperty('--my', py.toFixed(3));
          queue();
        }, { passive: true });

        hero.addEventListener('pointerleave', function () {
          px = 0; py = 0;
          hero.style.setProperty('--mx', '0');
          hero.style.setProperty('--my', '0');
          queue();
        });
      }

      apply();
    }

    /* ---------- 3D tilt on book cards ---------- */
    if (fine.matches) {
      document.querySelectorAll('.book-card').forEach(function (card) {
        var artEl = card.querySelector('.book-card-art');
        if (!artEl) return;
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          artEl.style.transform =
            'rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg)';
        });
        card.addEventListener('pointerleave', function () {
          artEl.style.transform = '';
        });
      });
    }
  }

  /* ---------- cross-document fade fallback ---------- */
  var supportsVT =
    typeof document.startViewTransition === 'function' &&
    window.CSS && CSS.supports && CSS.supports('view-transition-name: none');

  if (!supportsVT) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;

      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = a.href; }, 230);
    });
  }

  window.addEventListener('pageshow', function () {
    root.classList.remove('is-leaving');
  });
})();
