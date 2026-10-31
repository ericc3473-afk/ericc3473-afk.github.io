# Unreleased Books

A static storefront for *The Rules Behind the Curtain* by Elias Morgan and its companion book, *The Shadow of the Higher Order*.

The site is plain HTML, CSS and JavaScript. There is no build step and no framework. All commerce and email settings live in one file, `js/config.js`.

## Run it locally

From this folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also open `index.html` directly, but a local server is recommended so relative links, the manifest, fonts and the 404 page behave the same way they will in production. Browsers block the self-hosted fonts over `file://`, so the type falls back to system fonts if you skip the server.

## Sharing this site

### Send the ZIP

`unreleased-books-share.zip` (next to this folder) contains the complete site plus two launchers:

- **Windows:** double-click `START-HERE-WINDOWS.bat`. It starts a tiny built-in server (no Python, no admin rights) and opens `http://localhost:8000`.
- **macOS / Linux:** run `sh START-HERE-MAC-LINUX.sh`. This uses Python 3, which ships with most systems.

`READ-ME-FIRST.txt` explains both to whoever receives it. The checkout stays in its honest "not connected" state, so a friend can browse everything but cannot pay.

### Get a shareable link

For a real link, upload the folder to any static host:

- **Netlify Drop** — drag the unzipped folder onto <https://app.netlify.com/drop>. No account is needed for the temporary URL; claim the site to keep it.
- **Cloudflare Pages**, **GitHub Pages** or **Vercel** — connect the folder or a repository, no build command, publish directory `/`.

#### GitHub Pages checklist

GitHub Pages is case-sensitive and serves exactly what is in the configured folder. The most common mistakes are uploading the folder itself (creating `unreleased-books/index.html`) or leaving `css/`, `js/` and `assets/` out of the repository.

1. The repository root must contain `index.html` **next to** `css/`, `js/`, `assets/` and `pages/` — not inside a subfolder.
2. Upload the **contents** of `unreleased-books/`, not the folder itself.
3. Keep `.nojekyll` at the root (it is included) so GitHub Pages serves the files as-is.
4. Settings → Pages → Build and deployment → Source: **Deploy from a branch** → branch `main`, folder **/ (root)**. If it is set to `/docs`, either move the files into `docs/` or change it to the root.
5. If Pages is configured to publish from a `gh-pages` branch, push the same files there or switch the source to `main`.
6. Wait for the Pages deployment to finish, then hard-refresh (`Ctrl+Shift+R`).

Quick test: open `https://<user>.github.io/<repo>/css/styles.css`. If that 404s, the CSS was not deployed and the page will render unstyled.

Before sharing publicly, complete the launch checklist below (checkout links, email endpoint, real domain, legal review).

## Structure

```
.
├── index.html              # Landing page, free-chapter capture, JSON-LD @graph
├── 404.html                # Not-found page
├── robots.txt              # Crawl rules + sitemap pointer
├── sitemap.xml             # Indexable pages
├── manifest.webmanifest    # Installable web app metadata
├── START-HERE-WINDOWS.bat  # Double-click local preview (no installs)
├── START-HERE-MAC-LINUX.sh # Local preview for macOS/Linux (needs Python 3)
├── serve.ps1               # Tiny local server used by the Windows launcher
├── READ-ME-FIRST.txt       # Friend-facing instructions
├── css/
│   ├── fonts.css           # Self-hosted @font-face rules (latin subset)
│   ├── styles.css          # Design system, layout, components, responsive rules
│   ├── book.css            # Book detail page layout
│   ├── legal.css           # Legal pages + post-checkout page
│   ├── motion.css          # Motion layer: entrance, reveals, transitions
│   └── motion-reduce.css   # Reduced-motion rules (media-scoped)
├── js/
│   ├── config.js           # Checkout, email and support settings — edit this first
│   ├── app.js              # Cart, checkout routing, email capture, menu, modals
│   ├── book.js             # Book-page checkout routing + scroll reveals
│   └── motion.js           # Parallax, stagger, card tilt, page transitions
├── pages/
│   ├── curtain.html        # Book I detail page
│   ├── shadow.html         # Book II detail page
│   ├── thanks.html         # Post-checkout instructions (noindex)
│   ├── refund.html
│   ├── privacy.html
│   └── terms.html
├── preview/
│   └── motion-preview.mp4  # 20s screen recording of the motion layer
├── tools/
│   ├── og-home.html        # Source template for assets/og.jpg
│   ├── og-curtain.html     # Source template for assets/og-curtain.jpg
│   ├── og-shadow.html      # Source template for assets/og-shadow.jpg
│   └── icon.html           # Source template for the app icons
├── assets/
│   ├── cover.webp          # Book I cover, 600 × 900 (16 KB)
│   ├── cover.png           # Book I fallback, 600 × 900
│   ├── shadow.webp         # Book II cover, 600 × 900 (18 KB)
│   ├── shadow.png          # Book II fallback, 600 × 900
│   ├── og.jpg              # Home social card, 1200 × 630
│   ├── og-curtain.jpg      # Book I social card, 1200 × 630
│   ├── og-shadow.jpg       # Book II social card, 1200 × 630
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── favicon-32.png
│   ├── favicon.svg
│   └── fonts/              # Bodoni Moda, Manrope, IBM Plex Mono (woff2, latin)
└── README.md
```

`tools/` is not part of the public site. It holds the HTML used to render the social cards and icons with headless Chrome, so they can be regenerated if the copy changes.

## Configure checkout and email

Open `js/config.js`. It is the only file that needs real-world values:

```js
window.UB_CONFIG = {
  siteUrl: 'https://unreleasedbooks.com',
  supportEmail: 'hello@unreleasedbooks.com',

  checkout: {
    curtain: '', // The Rules Behind the Curtain — $16.95
    shadow: '',  // The Shadow of the Higher Order — $7.95
    bundle: ''   // Both books — $24.90
  },

  email: {
    endpoint: '',
    field: 'email',
    format: 'json', // "json" or "form"
    list: ''
  }
};
```

### Checkout

Paste hosted checkout URLs from Stripe Payment Links, Lemon Squeezy, Gumroad or a similar provider — one product per book, plus a bundle product priced at **$24.90** (the cart total of both books).

The cart resolves like this:

- One book → that book's checkout URL.
- Both books → the bundle URL.
- Empty or non-`https:` value → the honest **"Checkout is not connected yet"** dialog. No payment is taken and no fake success is shown.

Every checkout URL is validated as `https:` before navigation. Do not put secret API keys in `js/config.js`; hosted payment links are public by design.

### Email capture

The free-chapter form posts to `email.endpoint`:

- `field` is the name your provider expects for the address (for example `email`).
- `format: 'json'` sends JSON; `format: 'form'` sends `application/x-www-form-urlencoded`.
- `list` is optional and is included in the payload when set.

Leave `endpoint` empty and the form shows **"The reading list is not open yet, so nothing was sent."** — it never pretends to subscribe someone. The form also includes a honeypot field and client-side email validation.

### After editing

Bump the `?v=` token on local CSS/JS links (currently `?v=2026-10-30e`) so returning visitors do not keep a stale cached copy.

## Book pages and deep links

`pages/curtain.html` and `pages/shadow.html` are full detail pages with their own hero, chapter list, details, cross-sell, CTA band, breadcrumbs, Open Graph images and `Book` + `BreadcrumbList` JSON-LD.

Each page's buy button uses `js/book.js`:

- With a hosted URL configured, it becomes a direct "Get instant access" link.
- Without one, it falls back to the cart flow.

The landing page accepts deep links:

```
/?add=curtain   → adds Book I and opens the cart
/?add=shadow    → adds Book II and opens the cart
/?add=both      → adds both and opens the cart
```

The `add` parameter is removed from the URL after it is handled.

## SEO and launch plumbing

- `index.html` carries a JSON-LD `@graph` with `Organization`, `WebSite`, both `Book` entries and `FAQPage`.
- Book pages carry `Book` + `BreadcrumbList`; legal pages carry `BreadcrumbList`.
- `sitemap.xml`, `robots.txt`, `404.html`, `manifest.webmanifest` and the icon set are in place.
- `pages/thanks.html` is `noindex,follow` and explains post-purchase next steps without pretending to take payment.

## The design

The storefront uses a dark gold and crimson palette with a warm paper editorial section:

- **Bodoni Moda** for display type
- **Manrope** for body copy
- **IBM Plex Mono** for labels and small UI text

All three are self-hosted in `assets/fonts/` (latin subset, ~150 KB total) and loaded through `css/fonts.css`. There are no Google Fonts requests at runtime.

The page is built around the "Unreleased Archive" idea: a dark, cinematic hero, a paper-toned "Inside the book" section, a crimson manifesto block, a dark collection grid, a free-chapter capture band and a full footer.

## Motion

Motion lives in a separate, optional layer (`css/motion.css` + `js/motion.js`) so the page still works if either file fails to load:

- Hero entrance choreography: eyebrow rule draws in, headline clips up line by line, cover lifts, then price, buttons, add-on and trust row follow
- Slow ambient drift on the hero glow, a breathing glow behind the cover, and scroll + pointer parallax on the hero art
- Gold shine sweep across primary buttons on hover or keyboard focus
- Staggered scroll reveals for chapter rows, principles and section heads
- 3D tilt on book covers (pointer devices only)
- Staggered menu links and cart rows
- Native `details` height animation for FAQ answers where the browser supports `interpolate-size`
- Cross-document View Transitions between pages, with a fade fallback where unsupported

Everything is disabled under `prefers-reduced-motion: reduce`, which keeps only a calm 0.4s opacity fade as content scrolls in. Those rules live in `css/motion-reduce.css`, loaded with `media="(prefers-reduced-motion: reduce)"`, so visitors who ask for less motion never pay for the full choreography.

### Previewing the motion on a machine with animations off

Add `?motion=full` to any page:

```
http://localhost:8000/?motion=full
```

It adds `motion-full` to `<html>`, disables the reduced-motion stylesheet and keeps working as you navigate between pages for the rest of the session. `?motion=off` clears it again. Nothing is stored for visitors who never use the switch.

`preview/motion-preview.mp4` is a 20-second recording of the full choreography.

## What works

- Responsive desktop, tablet and mobile layouts (verified at 390 × 844 with no horizontal overflow)
- Announcement marquee, sticky header and mobile menu
- Cart drawer with add, remove, quantity handling and subtotal
- Cart persistence in `localStorage` under the key `ub-cart-v2`
- Hosted-checkout routing for single book or bundle, with an honest fallback
- `?add=` deep links from book pages
- Free-chapter email capture with validation, pending/success/error/preview states, honeypot and privacy microcopy
- Per-book detail pages with their own metadata and schema
- "Look inside" table-of-contents modal
- Sticky mobile buy bar after the hero
- Keyboard support: Escape closes layers, focus is trapped inside open dialogs, background content is made inert
- Reduced-motion support
- Self-hosted fonts, WebP covers with PNG fallback, social cards, icons and manifest
- SEO metadata, Open Graph/Twitter tags, JSON-LD, sitemap, robots and a 404 page
- Legal pages for refunds, privacy and terms

## Performance

Cache-disabled headless audit across index, book pages, legal pages, thanks and 404:

- **LCP** 80–528 ms
- **CLS** 0–0.005
- **Transfer** ~210–241 KB per page
- **Console errors** none

Lighthouse scores **100** for accessibility, best practices and SEO on the landing page, `pages/curtain.html` and `pages/thanks.html`, with zero failing audits.

The largest remaining payload is the self-hosted font set (~137 KB). That is intentional: it removes third-party requests and layout shift. If you need to trim further, subset the Bodoni files to the characters actually used.

## Before launch

1. **Add checkout URLs** in `js/config.js` for `curtain`, `shadow` and `bundle`.
2. **Add an email endpoint** in `js/config.js` and set `field`/`format` to match your provider.
3. **Upload the PDFs** and connect delivery to your checkout provider. There are no manuscript files in this project; delivery content must come from you.
4. **Replace the placeholder domain and email** — `https://unreleasedbooks.com/` and `hello@unreleasedbooks.com` appear in metadata, schema, sitemap, robots, manifest and legal pages.
5. **Review the legal copy.** The pages are practical templates, not legal advice; have them checked for your jurisdiction and business details.
6. **Confirm the refund window, licence terms and governing-law wording** match how you actually sell the books.
7. **Check chapter titles and FAQ answers** against the final manuscript.
8. **Regenerate social cards** from `tools/` if titles, prices or copy change.
9. **Bump the `?v=` token** and submit `sitemap.xml` to Google Search Console after deploying.
10. **Add analytics only if you need it**, and update the privacy policy if you do.

## Notes

- The covers in `assets/` are custom artwork created for this build. Replace them with final covers at the same 2:3 ratio if needed, then re-export the WebP versions.
- The cart is browser-local only. It is not synced between devices.
- The checkout fallback is deliberate until real provider links exist; everything else is front-end complete.
- Local CSS and JS are linked with `?v=2026-10-30e`. Bump that token whenever you deploy a change.
