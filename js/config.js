/* ============================================================
   Unreleased Books — site configuration
   ------------------------------------------------------------
   Everything that needs a real-world account lives here, so the
   rest of the site never has to be edited for launch.

   CHECKOUT
   Paste hosted checkout URLs from Stripe Payment Links, Lemon
   Squeezy, Gumroad or similar. One product per book, plus a
   bundle product priced at $24.90.
   Leave a value empty and that cart state falls back to the
   honest "checkout opens soon" dialog — no fake success.

   EMAIL
   Paste the form endpoint from Buttondown, ConvertKit,
   Mailchimp or your own handler. `field` is the name that
   provider expects for the address. `format` is either
   "json" or "form".
   Leave it empty and the form says plainly that nothing was
   sent, instead of pretending to subscribe someone.

   After editing, bump the ?v= token on local CSS/JS links.
   ============================================================ */
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
