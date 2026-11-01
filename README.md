# The Gilded Code

A single-page storefront for *The Gilded Code: Abundance by Design* by Kael Varnow.

The site is plain HTML, CSS and JavaScript. There is no build step and no framework. All commerce settings live in one file, `js/config.js`.

## Run it locally

From this folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

You can also open `index.html` directly, but a local server is recommended so relative links, the manifest and the fonts behave the same way they will in production. Browsers block self-hosted fonts over `file://`, so the type falls back to system fonts if you skip the server.

### Sharing this site

`START-HERE-WINDOWS.bat` (double-click) and `START-HERE-MAC-LINUX.sh` (run with `sh`) start a tiny local server and open the page. `READ-ME-FIRST.txt` explains both to whoever receives the folder.

The checkout stays in its honest "not connected" state, so a friend can read everything but cannot pay.

## Structure

```
.
├── index.html              # The whole storefront: title page, book, author, contents, buy
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
│   ├── motion.css          # Title-page entrance, cover unveil, scroll reveals
│   └── motion-reduce.css   # Reduced-motion overrides (media-scoped)
├── js/
│   ├── config.js           # Checkout, support email, price — edit this first
│   ├── app.js              # Header state, reveals, checkout hand-off, dialog
│   └── motion.js           # Cover tilt + reveal stagger (pointer devices only)
├── pages/
│   ├── thanks.html         # Post-checkout instructions (noindex)
│   ├── refund.html
│   ├── privacy.html
│   └── terms.html
├── tools/
│   ├── cover.html          # Source artwork for assets/cover.jpg
│   ├── og.html             # Source template for assets/og.jpg
│   └── icon.html           # Source template for the app icons
├── assets/
│   ├── cover.jpg           # The cover, 1200 × 1800 (~170 KB)
│   ├── og.jpg              # Social card, 1200 × 630
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── favicon-32.png
│   ├── favicon.svg
│   └── fonts/              # Bodoni Moda + Manrope (woff2, latin)
└── README.md
```

`tools/` is not part of the public site. It holds the HTML used to render the cover, social card and icons with headless Chrome, so they can be regenerated if the copy changes.

## Configure checkout

Open `js/config.js`. It is the only file that needs real-world values:

```js
window.GC_CONFIG = {
  siteUrl: 'https://ericc3473-afk.github.io',
  supportEmail: 'hello@thegildedcode.com',
  title: 'The Gilded Code',
  author: 'Kael Varnow',
  price: '16.95',

  checkout: {
    book: '' // one hosted checkout URL for the book
  }
};
```

Paste a hosted checkout URL from Stripe Payment Links, Lemon Squeezy, Gumroad or a similar provider. While `checkout.book` is empty, the buy button opens the honest **"Checkout is not connected yet"** dialog: no payment is taken and no fake success is shown. The footer, the dialog and every legal page read their address from `supportEmail`.

Only `https:` URLs are accepted; anything else falls back to the dialog. Do not put secret API keys in `js/config.js` — hosted payment links are public by design.

### After editing

Bump the `?v=` token on local CSS/JS links (currently `?v=2026-11-01a`) so returning visitors do not keep a stale cached copy.

## SEO and launch plumbing

- `index.html` carries JSON-LD `@graph` with `WebSite` and `Book` (author, format, price, availability).
- `sitemap.xml`, `robots.txt`, `404.html`, `manifest.webmanifest` and the icon set are in place.
- `pages/thanks.html` is `noindex` and explains post-purchase next steps without pretending to take payment.

## The design

A gilded engraved bookplate: charcoal ground, antique gold rules and a Didone display face.

- **Bodoni Moda** for display type
- **Manrope** for body copy

Both are self-hosted in `assets/fonts/` (latin subset) and loaded through `css/fonts.css`. There are no Google Fonts requests at runtime.

The page is built as a sequence of printed leaves:

1. **Title page** — full-height, the title above, a scroll cue.
2. **The book** — the cover on the right, title, author and the opening description on the left; the cover stays in view as the copy scrolls.
3. **The author** — a short bio under a gold monogram.
4. **Inside, you'll discover** — the five promises as a ruled list, with the pull quote and closing line beside it.
5. **Buy** — price, one button, and an honest note about the state of checkout.

The cover is authored as SVG in `tools/cover.html`: an engraved rosette, gilt frame, corner flourishes and Didone lettering, rasterised to `assets/cover.jpg`.

## Motion

Motion lives in a separate, optional layer (`css/motion.css` + `js/motion.js`) so the page still works if either file fails to load:

- A single authored entrance on the title page: the ornament rule draws, the title, subtitle, byline and scroll cue rise in sequence
- The cover unveils once with a clip-path wipe and a gold sweep as it enters the viewport
- Quiet staggered reveals for the copy, list and pull quote
- A gentle 3D tilt on the cover under a fine pointer

Everything is disabled under `prefers-reduced-motion: reduce`; `css/motion-reduce.css` is loaded with `media="(prefers-reduced-motion: reduce)"`, so visitors who ask for less motion never download the choreography. Reduced motion keeps every element visible — nothing is left clipped or faded.

### Previewing the motion on a machine with animations off

Add `?motion=full` to the page:

```
http://localhost:8000/?motion=full
```

It adds `motion-full` to `<html>` and disables the reduced-motion stylesheet. `?motion=off` forces everything visible and still. Nothing is stored for visitors who never use the switch.

## What works

- Responsive layout verified at 320, 360, 390, 768 and 1440 px with no horizontal overflow
- Sticky header with a "Get the book" link, and the cover staying in view beside the copy
- Hosted-checkout routing with an honest fallback dialog
- Keyboard support: Escape closes the dialog, focus is trapped inside it, the close button takes focus on open
- Skip link, landmarks, alt text and AA contrast throughout
- Reduced-motion support, plus `?motion=full` / `?motion=off`
- Self-hosted fonts, social card, icons and manifest
- SEO metadata, Open Graph/Twitter tags, JSON-LD, sitemap, robots and a 404 page
- Legal pages for refunds, privacy and terms

## Before launch

1. **Add a checkout URL** in `js/config.js` (`checkout.book`).
2. **Upload the PDF** and connect delivery to your checkout provider. There are no manuscript files in this project; delivery content must come from you.
3. **Replace the placeholder email** — `hello@thegildedcode.com` appears in the footer, the dialog and every legal page.
4. **Replace the placeholder domain** — `https://ericc3473-afk.github.io` appears in the canonical tag, Open Graph tags, JSON-LD, sitemap and robots. Change `siteUrl` first, then update the hard-coded URLs in `index.html`, `pages/*.html`, `sitemap.xml` and `robots.txt`.
5. **Review the legal copy.** The pages are practical templates, not legal advice; have them checked for your jurisdiction and business details.
6. **Confirm the price, refund window and licence terms** match how you actually sell the book.
7. **Regenerate the cover and social card** from `tools/` if the title or copy changes.
8. **Bump the `?v=` token** and submit `sitemap.xml` to Google Search Console after deploying.

## Notes

- The cover in `assets/` is custom artwork created for this build. Replace it with the final cover at the same 2:3 ratio if needed, then regenerate `assets/og.jpg`.
- The price shown is `$16.95` for the PDF eBook, set in both `js/config.js` and the visible markup.
- The checkout fallback is deliberate until a real provider link exists; everything else is front-end complete.
- Local CSS and JS are linked with `?v=2026-11-01a`. Bump that token whenever you deploy a change.
