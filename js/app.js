/* ============================================================
   The Gilded Code — page behaviour
   Header state, quiet reveals, the checkout hand-off and its
   honest fallback. Nothing here is required to read the page.
   ============================================================ */
(function () {
  'use strict';

  var config = window.GC_CONFIG || {};
  var root = document.documentElement;
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  /* ---------- header settles on scroll ---------- */
  var head = $('.site-head');
  if (head) {
    var stuck = function () {
      head.classList.toggle('is-stuck', window.scrollY > 8);
    };
    stuck();
    window.addEventListener('scroll', stuck, { passive: true });
  }

  /* ---------- quiet reveals ---------- */
  /* The cover is clipped while it waits to unveil, and a clipped element
     reports zero intersection — so the cover is triggered by the section
     that holds it, never by the clipped element itself. */
  var art = $('.book-art');
  var pairs = $$('[data-reveal]').map(function (el) {
    return { watch: el, mark: el };
  });
  if (art) pairs.push({ watch: $('.book') || art.parentElement, mark: art });

  if (pairs.length) {
    var reveal = function (el) {
      el.classList.add('is-in');
      /* drop the clip once it has played, so the cover's shadow is not cut */
      if (el === art) {
        el.addEventListener('transitionend', function done(event) {
          if (event.propertyName !== 'clip-path') return;
          el.style.clipPath = 'none';
          el.removeEventListener('transitionend', done);
        });
      }
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          pairs.forEach(function (pair) {
            if (pair.watch === entry.target) reveal(pair.mark);
          });
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
      pairs.forEach(function (pair) { io.observe(pair.watch); });
    } else {
      pairs.forEach(function (pair) { reveal(pair.mark); });
    }
  }

  /* ---------- checkout ---------- */
  var dialog = $('#checkoutDialog');
  var note = $('#buyNote');
  var buyButton = $('#buyBtn');
  var checkoutUrl = (config.checkout && config.checkout.book) || '';

  function showNote() {
    if (!note) return;
    if (checkoutUrl) {
      note.textContent = 'Secure checkout. Instant download after payment.';
    } else {
      note.innerHTML = 'Preview build — checkout is not connected yet, so nothing will be charged.';
    }
  }
  showNote();

  function openSheet() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    var close = $('[data-close]', dialog);
    if (close) close.focus();
  }

  if (buyButton) {
    buyButton.addEventListener('click', function () {
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      openSheet();
    });
  }

  if (dialog) {
    $$('[data-close]', dialog).forEach(function (button) {
      button.addEventListener('click', function () {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      });
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  /* ---------- contact address comes from config ---------- */
  var email = config.supportEmail || '';
  if (email) {
    $$('[data-mailto]').forEach(function (link) { link.href = 'mailto:' + email; });
    $$('[data-mailtext]').forEach(function (node) { node.textContent = email; });
  }

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
