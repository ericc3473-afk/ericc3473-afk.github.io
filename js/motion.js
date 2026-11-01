/* ============================================================
   The Gilded Code — motion layer
   Progressive enhancement only. The cover tilts under a fine
   pointer; everything else is CSS. Reduced motion always wins.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(pointer: fine)');

  function calm() {
    if (root.classList.contains('motion-off')) return true;
    return reduce.matches && !root.classList.contains('motion-full');
  }

  var art = document.querySelector('.book-art');
  var img = art && art.querySelector('img');

  /* ---------- stagger grouped reveals ---------- */
  var seen = new Map();
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var parent = el.parentElement;
    var i = seen.get(parent) || 0;
    if (i > 0) el.style.setProperty('--d', Math.min(i * 65, 260) + 'ms');
    seen.set(parent, i + 1);
  });

  if (!art || !img || calm() || !fine.matches) return;

  var frame = null;

  function apply(x, y) {
    frame = null;
    var rx = (-y * 3.2).toFixed(2);
    var ry = (-6 + x * 5).toFixed(2);
    img.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
  }

  art.addEventListener('pointermove', function (event) {
    var rect = art.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width - 0.5;
    var y = (event.clientY - rect.top) / rect.height - 0.5;
    if (frame) return;
    frame = requestAnimationFrame(function () { apply(x, y); });
  }, { passive: true });

  art.addEventListener('pointerleave', function () {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    img.style.transform = '';
  });
})();
