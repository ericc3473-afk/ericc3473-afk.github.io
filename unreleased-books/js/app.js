(() => {
  'use strict';

  const SITE = window.UB_CONFIG || {};
  const CHECKOUT = SITE.checkout || {};
  const EMAIL = SITE.email || {};

  const CONFIG = {
    locale: 'en-US',
    currency: 'USD',
    cartKey: 'ub-cart-v2',
    contactEmail: SITE.supportEmail || 'hello@unreleasedbooks.com'
  };

  const BOOKS = {
    curtain: {
      id: 'curtain',
      title: 'The Rules Behind the Curtain',
      author: 'Elias Morgan',
      price: 16.95,
      format: 'PDF eBook',
      cover: 'assets/cover.png'
    },
    shadow: {
      id: 'shadow',
      title: 'The Shadow of the Higher Order',
      author: 'Elias Morgan',
      price: 7.95,
      format: 'PDF eBook',
      cover: 'assets/shadow.png'
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const currency = new Intl.NumberFormat(CONFIG.locale, {
    style: 'currency',
    currency: CONFIG.currency
  });
  const money = value => currency.format(value);

  let cart = loadCart();
  let activeLayer = null;
  let lastFocus = null;
  let toastTimer;

  /* ---------- checkout routing ---------- */
  function safeCheckoutUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim(), location.href);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function checkoutUrl() {
    const ids = [...cart].sort();
    if (ids.length === 2) return safeCheckoutUrl(CHECKOUT.bundle);
    if (ids.length === 1) return safeCheckoutUrl(CHECKOUT[ids[0]]);
    return '';
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.cartKey) || '[]');
      if (!Array.isArray(saved)) return [];
      return [...new Set(saved)].filter(id => Object.prototype.hasOwnProperty.call(BOOKS, id));
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CONFIG.cartKey, JSON.stringify(cart));
    } catch {
      /* storage can be unavailable in private mode */
    }
  }

  /* ---------- announcement ---------- */
  const phrases = [
    'Instant PDF delivery',
    'Secure checkout',
    '7-day satisfaction guarantee',
    'Read on any device'
  ];
  const phraseMarkup = phrases.map(text => `<span>${text}</span><i aria-hidden="true">✦</i>`).join('');
  $('#announce').innerHTML =
    `<div class="announce-group">${phraseMarkup}</div>` +
    `<div class="announce-group" aria-hidden="true">${phraseMarkup}</div>`;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  /* ---------- cart ---------- */
  function itemFor(id) {
    const book = BOOKS[id];
    const li = document.createElement('li');
    li.className = 'cart-item';

    const img = document.createElement('img');
    img.src = book.cover;
    img.alt = '';
    img.width = 56;
    img.height = 84;

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.srcset = book.cover.replace(/\.png$/, '.webp');
    source.type = 'image/webp';
    picture.append(source, img);

    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = book.title;
    const format = document.createElement('small');
    format.textContent = book.format;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-remove';
    remove.dataset.remove = id;
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${book.title} from cart`);
    info.append(title, format, remove);

    const price = document.createElement('span');
    price.className = 'cart-price';
    price.textContent = money(book.price);

    li.append(picture, info, price);
    return li;
  }

  function emptyCart() {
    const li = document.createElement('li');
    li.className = 'cart-empty';
    li.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/></svg>
      <p>Your cart is empty.</p>
      <button class="btn btn-line btn-sm" type="button" data-browse>Browse the collection</button>
    `;
    return li;
  }

  function renderCart() {
    const count = cart.length;
    const total = cart.reduce((sum, id) => sum + BOOKS[id].price, 0);

    $('#count').textContent = count;
    $('#count').hidden = count === 0;
    $('#cartCount').textContent = count;
    $('#subtotal').textContent = money(total);
    $('#checkout').disabled = count === 0;
    $('#addon').checked = cart.includes('shadow');
    $('#cartBtn').setAttribute(
      'aria-label',
      count ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'
    );

    const note = $('#cartNote');
    if (note) {
      note.textContent = checkoutUrl()
        ? 'Secure checkout · Instant PDF delivery'
        : 'Instant PDF delivery · Checkout opens soon';
    }

    const list = $('#cartList');
    list.replaceChildren();
    if (!count) {
      list.append(emptyCart());
      return;
    }
    cart.forEach(id => list.append(itemFor(id)));
  }

  function addToCart(id, { silent = false } = {}) {
    if (!BOOKS[id] || cart.includes(id)) return false;
    cart.push(id);
    saveCart();
    renderCart();
    if (!silent) toast(`${BOOKS[id].title} added to your cart.`);
    return true;
  }

  function buyMainBook() {
    const addedBook = addToCart('curtain', { silent: true });
    const addedCompanion = $('#addon').checked && addToCart('shadow', { silent: true });
    toast(
      addedBook || addedCompanion
        ? 'Added to your cart.'
        : 'These books are already in your cart.'
    );
    openLayer('cart');
  }

  /* ---------- layers ---------- */
  const layers = {
    menu: { el: $('#menu'), focus: '#closeMenu' },
    cart: { el: $('#cart'), focus: '#closeCart' },
    look: { el: $('#lookModal'), focus: '[data-close]' },
    checkout: { el: $('#checkoutModal'), focus: '[data-close]' }
  };

  function setInert(on) {
    ['#header', '#main', '.footer', '#buybar'].forEach(selector => {
      const el = $(selector);
      if (el) el.inert = on;
    });
  }

  function updateBuybar() {
    const hero = $('.hero');
    const buybar = $('#buybar');
    if (!hero || !buybar) return;
    const show = window.scrollY > hero.offsetHeight - 120 && !activeLayer;
    buybar.classList.toggle('show', show);
    buybar.setAttribute('aria-hidden', String(!show));
  }

  function openLayer(name) {
    if (activeLayer === name) return;

    const restoreTarget = activeLayer ? lastFocus : document.activeElement;
    if (activeLayer) closeLayer(false);
    lastFocus = restoreTarget;

    activeLayer = name;
    const layer = layers[name];

    if (name === 'cart') {
      const scrim = $('#scrim');
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add('show'));
      $('#cartBtn').setAttribute('aria-expanded', 'true');
    }
    if (name === 'menu') $('#menuBtn').setAttribute('aria-expanded', 'true');

    layer.el.hidden = false;
    layer.el.classList.add('open');
    layer.el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    setInert(true);
    updateBuybar();

    requestAnimationFrame(() => {
      const target = layer.el.querySelector(layer.focus);
      if (target) target.focus({ preventScroll: true });
    });
  }

  function closeLayer(restoreFocus = true) {
    if (!activeLayer) return;

    const name = activeLayer;
    const layer = layers[name];
    activeLayer = null;

    layer.el.classList.remove('open');
    layer.el.setAttribute('aria-hidden', 'true');

    if (name === 'menu') $('#menuBtn').setAttribute('aria-expanded', 'false');
    if (name === 'cart') {
      $('#cartBtn').setAttribute('aria-expanded', 'false');
      const scrim = $('#scrim');
      scrim.classList.remove('show');
      setTimeout(() => {
        if (!scrim.classList.contains('show')) scrim.hidden = true;
      }, 320);
    }
    if (name === 'look' || name === 'checkout') layer.el.hidden = true;

    document.body.classList.remove('locked');
    setInert(false);
    updateBuybar();

    if (restoreFocus && lastFocus && document.contains(lastFocus)) {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  /* ---------- listeners ---------- */
  $('#buy').addEventListener('click', buyMainBook);
  $('#buybarBuy').addEventListener('click', buyMainBook);

  $('#cartBtn').addEventListener('click', () => openLayer('cart'));
  $('#closeCart').addEventListener('click', () => closeLayer());
  $('#scrim').addEventListener('click', () => closeLayer());

  $('#menuBtn').addEventListener('click', () => openLayer('menu'));
  $('#closeMenu').addEventListener('click', () => closeLayer());
  $$('.menu-nav a').forEach(link => link.addEventListener('click', () => closeLayer()));

  $('#menuBuy').addEventListener('click', () => {
    addToCart('curtain', { silent: true });
    openLayer('cart');
  });

  /* ---------- look inside ---------- */
  const chapterData = $$('.chapter').map(li => ({
    num: ($('.chapter-num', li) || {}).textContent || '',
    title: ($('h3', li) || {}).textContent || '',
    desc: ($('p', li) || {}).textContent || ''
  }));
  const lookToc = $('#lookToc');
  const lookPageNum = $('#lookPageNum');
  const lookPageGhost = $('#lookPageGhost');
  const lookChapterTitle = $('#lookChapterTitle');
  const lookChapterDesc = $('#lookChapterDesc');

  function setLookChapter(index) {
    const data = chapterData[index];
    if (!data) return;
    if (lookPageNum) lookPageNum.textContent = `Chapter ${data.num}`;
    if (lookPageGhost) lookPageGhost.textContent = data.num;
    if (lookChapterTitle) lookChapterTitle.textContent = data.title;
    if (lookChapterDesc) lookChapterDesc.textContent = data.desc;
    if (!lookToc) return;
    $$('button', lookToc).forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function openLook(index = 0) {
    setLookChapter(index);
    openLayer('look');
  }

  $('#lookBtn').addEventListener('click', () => openLook(0));
  $$('[data-look]').forEach(button => button.addEventListener('click', () => openLook(0)));
  if (lookToc) {
    $$('button', lookToc).forEach(button => {
      button.addEventListener('click', () => setLookChapter(Number(button.dataset.lookChapter)));
    });
  }

  /* the chapter index is the preview: each row opens it at that chapter */
  $$('.chapter').forEach((li, index) => {
    if (!chapterData[index]) return;
    const hit = document.createElement('button');
    hit.type = 'button';
    hit.className = 'chapter-hit';
    hit.setAttribute('aria-haspopup', 'dialog');
    hit.setAttribute('aria-label', `Look inside chapter ${chapterData[index].num}: ${chapterData[index].title}`);
    hit.addEventListener('click', () => openLook(index));
    li.append(hit);
  });

  $('#lookBuy').addEventListener('click', () => {
    addToCart('curtain', { silent: true });
    openLayer('cart');
  });

  $('#checkout').addEventListener('click', () => {
    if (!cart.length) return;
    const url = checkoutUrl();
    if (url) {
      window.location.assign(url);
      return;
    }
    openLayer('checkout');
  });

  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeLayer()));
  $$('.modal-layer').forEach(layer => {
    layer.addEventListener('click', event => {
      if (event.target === layer) closeLayer();
    });
  });

  $$('[data-add]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.add;
      const added = addToCart(id, { silent: true });
      toast(added ? `${BOOKS[id].title} added to your cart.` : 'Already in your cart.');
      openLayer('cart');
    });
  });

  $('#addBoth').addEventListener('click', () => {
    const addedBook = addToCart('curtain', { silent: true });
    const addedCompanion = addToCart('shadow', { silent: true });
    toast(
      addedBook || addedCompanion
        ? 'Both books added to your cart.'
        : 'Both books are already in your cart.'
    );
    openLayer('cart');
  });

  $('#addon').addEventListener('change', event => {
    if (event.target.checked) {
      const added = addToCart('shadow', { silent: true });
      toast(added ? 'Companion book added to your cart.' : 'Companion book is already in your cart.');
      return;
    }
    if (cart.includes('shadow')) {
      cart = cart.filter(id => id !== 'shadow');
      saveCart();
      renderCart();
      toast('Companion book removed from your cart.');
    }
  });

  $('#cartList').addEventListener('click', event => {
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      cart = cart.filter(id => id !== remove.dataset.remove);
      saveCart();
      renderCart();
      toast('Removed from your cart.');
      const next = $('#cartList [data-remove]') || $('#cartList [data-browse]');
      if (next) next.focus({ preventScroll: true });
      return;
    }

    const browse = event.target.closest('[data-browse]');
    if (browse) {
      closeLayer();
      $('#collection').scrollIntoView({ behavior: 'smooth' });
    }
  });

  $('#continueBtn').addEventListener('click', () => {
    closeLayer();
    $('#collection').scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('keydown', event => {
    if (!activeLayer) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeLayer();
      return;
    }
    if (event.key !== 'Tab') return;

    const layer = layers[activeLayer].el;
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      layer
    ).filter(el => el.getClientRects().length > 0);

    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('storage', event => {
    if (event.key !== CONFIG.cartKey) return;
    cart = loadCart();
    renderCart();
  });

  /* ---------- free chapter capture ---------- */
  const leadForm = $('#leadForm');
  if (leadForm) {
    const leadEmail = $('#leadEmail');
    const leadStatus = $('#leadStatus');
    const leadSubmit = leadForm.querySelector('button[type="submit"]');
    const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    const leadState = (state, message) => {
      leadForm.dataset.state = state;
      leadStatus.textContent = message;
      leadStatus.hidden = !message;
    };

    leadEmail.addEventListener('input', () => {
      if (leadForm.dataset.state !== 'error') return;
      leadEmail.removeAttribute('aria-invalid');
      leadState('idle', '');
    });

    leadForm.addEventListener('submit', async event => {
      event.preventDefault();

      const value = leadEmail.value.trim();
      const trap = $('#leadTrap');
      if (trap && trap.value) return;

      if (!emailOk(value)) {
        leadEmail.setAttribute('aria-invalid', 'true');
        leadState('error', 'That email address does not look right. Check it and try again.');
        leadEmail.focus();
        return;
      }

      if (!EMAIL.endpoint) {
        leadState('preview', 'The reading list is not open yet, so nothing was sent. Check back soon.');
        if (window.console) console.info('[Unreleased Books] Add an email endpoint in js/config.js to go live.');
        return;
      }

      leadSubmit.disabled = true;
      leadState('pending', 'Sending…');

      try {
        const field = EMAIL.field || 'email';
        const formMode = EMAIL.format === 'form';
        const body = formMode
          ? new URLSearchParams({ [field]: value, ...(EMAIL.list ? { list: EMAIL.list } : {}) })
          : JSON.stringify({ [field]: value, ...(EMAIL.list ? { list: EMAIL.list } : {}) });

        const response = await fetch(EMAIL.endpoint, {
          method: 'POST',
          mode: 'cors',
          headers: formMode
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/json', Accept: 'application/json' },
          body
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        leadForm.reset();
        leadState('success', 'Check your inbox — chapter one is on its way. If it is not there in a few minutes, look in spam.');
      } catch {
        leadState('error', `That did not go through. Try again, or email ${CONFIG.contactEmail} and we will add you by hand.`);
      } finally {
        leadSubmit.disabled = false;
      }
    });
  }

  /* ---------- header / buy bar ---------- */
  const header = $('#header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateBuybar();
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateBuybar);

  /* ---------- reveal on scroll ---------- */
  /* reduced motion keeps the reveal, but motion.css turns it into a
     plain opacity fade with no movement */
  const revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- deep link from book pages (?add=curtain|shadow|both) ---------- */
  const addParam = new URLSearchParams(location.search).get('add');
  if (addParam) {
    const ids = addParam === 'both' ? ['curtain', 'shadow'] : [addParam];
    const valid = ids.filter(id => BOOKS[id]);
    if (valid.length) {
      valid.forEach(id => addToCart(id, { silent: true }));
      toast(valid.length === 2 ? 'Both books added to your cart.' : `${BOOKS[valid[0]].title} added to your cart.`);
      openLayer('cart');
      const clean = new URL(location.href);
      clean.searchParams.delete('add');
      history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
    }
  }

  renderCart();
})();
