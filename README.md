# Makovelle Technologies Studio — Website

The official website of **Makovelle Technologies Studio**. It is a fast, static, multi-page site built with semantic HTML, CSS and vanilla JavaScript, plus a small build script with no dependencies.

## Quick start

Requires **Node.js 18+** (no `npm install` needed; there are no dependencies).

```bash
npm run dev      # build + preview at http://localhost:4321
npm run build    # build into dist/
npm run check    # build + verify every internal link and #anchor
```

The build lists any placeholders that still need real company details.

## Project structure

```
site.config.json          ← ALL company details (email, phone, WhatsApp, form endpoint, domain)
src/
  pages/                  ← one file per page (URL = file path)
    index.html            → /
    about.html            → /about/
    services.html         → /services/
    work.html             → /work/
    work/school-fees-system.html       → /work/school-fees-system/
    work/school-fees-system/demo.html  → /work/school-fees-system/demo/  (interactive demo)
    work/school-website.html           → /work/school-website/
    work/school-website/demo.html      → /work/school-website/demo/   (Maconte Academy demo website)
    work/parent-portal.html            → /work/parent-portal/
    work/parent-portal/demo.html       → /work/parent-portal/demo/    (parent portal demo)
    contact.html          → /contact/
    404.html              → /404.html
  partials/               ← shared header, footer, CTA, head/SEO tags, mockups
  assets/css/main.css     ← design system (colour & type tokens at the top)
  assets/css/demo.css     ← fees demo styles
  assets/js/main.js       ← header, mobile menu, scroll reveals
  assets/js/contact.js    ← form validation & submission
  assets/js/demo.js       ← fees demo app (fictional data, in-memory only)
  assets/css/school-demo.css, assets/js/school-demo.js ← Maconte Academy demo website
  assets/css/portal.css, assets/js/portal.js           ← parent portal demo app
  assets/img/             ← logo, favicons, Open Graph image
  _headers                ← security headers (Netlify / Cloudflare Pages)
scripts/build.mjs         ← static builder (partials, tokens, sitemap, robots, JSON-LD)
scripts/serve.mjs         ← local preview server
scripts/check-links.mjs   ← link checker
tools/                    ← HTML sources for regenerating the OG image & icons
dist/                     ← generated output (deploy this folder)
```

### How pages work
Each page starts with a metadata block, which drives `<title>`, the meta description, Open Graph tags, the canonical URL and the sitemap:

```html
<!--meta { "title": "...", "description": "...", "nav": "about" } -->
```

Inside pages and partials:
- `{{> partial-name}}` includes a partial.
- `{{site.contact.phone}}` inserts a config value (HTML-escaped).
- `{{links.whatsapp}}` / `{{links.email}}` / `{{links.phone}}` are ready-made links.

Unknown tokens fail the build, so a typo can't reach the live site.

## Replacing the placeholders

Edit **`site.config.json`** and rebuild. Values in `[square brackets]` are placeholders:

| Key | What to enter | Example |
|---|---|---|
| `url` | Your live domain (used for canonical URLs, sitemap and social previews) | `https://www.makovelle.co.zw` |
| `contact.email` | Business email | `hello@makovelle.co.zw` |
| `contact.phone` | Phone number, as it should be displayed | `+263 77 123 4567` |
| `contact.whatsapp` | WhatsApp number, international format, digits only | `263771234567` |
| `contact.city` | City / town | `Harare` |
| `contact.hours` | Business hours | `Monday – Friday, 08:00 – 17:00 CAT` |
| `social.*` | Optional profile URLs (added to structured data) | `https://linkedin.com/company/...` |
| `form.endpoint` | Contact-form service URL (see below) | `https://formspree.io/f/abcdwxyz` |

While a value is still a placeholder, any link that depends on it, such as the WhatsApp buttons, safely points to the contact page instead of a broken link.

## Contact form

The form validates all input in the browser and **never claims success unless a real service confirms delivery**.

- **No endpoint configured (current state):** after validation, visitors see “Your message has not been sent yet”. They are offered *Send via WhatsApp* and *Send by email* buttons with their message pre-filled, once those details are set in the config.
- **Endpoint configured:** the form is POSTed to the service. Success or error is shown based on the service's actual response.

### Connecting Formspree (recommended, free tier available)
1. Create an account at formspree.io and create a new form. Set the recipient to your business email.
2. Copy the form endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `site.config.json` → `form.endpoint`, then run `npm run build` and redeploy.
4. Submit a test enquiry and confirm it reaches your inbox.

The endpoint URL is public by design and is not a secret, so no API keys are exposed. The form includes a hidden spam trap field (`_gotcha`).
To use a different service, also add its domain to `connect-src` and `form-action` in `src/_headers`.

## Deployment

The site is static: deploy the **`dist/`** folder anywhere.

**Netlify (recommended):** connect the repository. `netlify.toml` already sets the build command (`npm run build`) and the publish directory (`dist`). The security headers in `_headers` and the custom 404 page work automatically.

**Cloudflare Pages:** build command `npm run build`, output directory `dist`. `_headers` is supported.

**Vercel:** framework preset “Other”, build command `npm run build`, output directory `dist`.

**Traditional hosting (cPanel etc.):** run `npm run build` locally and upload the *contents* of `dist/` to `public_html`. Set the 404 page to `/404.html`. `_headers` will not apply there; configure headers in `.htaccess` if needed.

After going live:
1. Set `url` in the config to the real domain and rebuild.
2. Submit `https://your-domain/sitemap.xml` in Google Search Console.
3. Create a Google Business Profile once you have a business address or service area. This matters a lot for searches like “software company in Zimbabwe”.

## Design system

Defined in `src/assets/css/main.css` under **Tokens**:
- Colours: deep black `#0B0B0D`, champagne gold `#D6B77A`, warm white `#F7F5F0`, charcoal `#171719`, muted greys. A darker gold (`#7A5C2A`) is used for gold text on light sections to keep WCAG AA contrast.
- Type: *Instrument Serif* (display headings) and *Manrope* (body/UI), from Google Fonts.
- Sections can be switched to the light theme with `class="section section--light"`; components re-colour automatically.

Accessibility: skip link, semantic landmarks, logical heading order, visible focus styles, keyboard-operable mobile menu (Escape closes it and focus is kept inside while open), labelled form fields with announced errors, and `prefers-reduced-motion` support.

## Regenerating images
`tools/og-image.html` and `tools/icon.html` are the sources for the social-share image and the PNG icons. If the tagline changes, edit the HTML and re-render, for example:
```bash
chromium --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=src/assets/img/og-image.png tools/og-image.html
```

## Content notes
- All portfolio items are clearly labelled as **demonstration or concept projects**. *Maconte Academy* and all student names and amounts are fictional.
- No testimonials, client logos, statistics, addresses or company history have been invented. Add real ones as they become available.
