/* ============================================================
   Book detail pages — checkout routing + scroll reveals
   ============================================================ */
(function () {
  'use strict';

  var SITE = window.UB_CONFIG || {};
  var CHECKOUT = SITE.checkout || {};
  var page = document.body.getAttribute('data-book');

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      var url = new URL(value.trim(), location.href);
      return url.protocol === 'https:' ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  if (page) {
    var direct = safeUrl(CHECKOUT[page]);
    document.querySelectorAll('[data-buy-book]').forEach(function (button) {
      if (!direct) return;
      button.href = direct;
      button.textContent = button.getAttribute('data-checkout-label') || 'Get instant access';
      button.removeAttribute('data-buy-book');
    });

    var bundle = safeUrl(CHECKOUT.bundle);
    document.querySelectorAll('[data-buy-both]').forEach(function (link) {
      if (bundle) link.href = bundle;
    });
  }

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (item) { observer.observe(item); });
  } else {
    items.forEach(function (item) { item.classList.add('is-visible'); });
  }
})();
