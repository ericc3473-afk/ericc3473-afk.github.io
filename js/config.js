/* ============================================================
   The Gilded Code — site configuration
   ------------------------------------------------------------
   Everything that needs a real-world account lives here, so the
   rest of the site never has to be edited for launch.

   CHECKOUT
   Paste a hosted checkout URL from Stripe Payment Links,
   Lemon Squeezy, Gumroad or similar. While it is empty the buy
   button opens an honest "not connected" note instead of
   pretending to take a payment.

   SUPPORT
   The address shown in the footer, the checkout note and the
   legal pages.

   SITE URL
   Used for canonical links and social cards. Change this to
   your own domain once you have one.

   After editing, bump the ?v= token on local CSS/JS links.
   ============================================================ */
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
