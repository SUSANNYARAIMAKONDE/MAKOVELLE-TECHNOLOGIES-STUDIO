#!/usr/bin/env node
/**
 * Makovelle static site builder — zero dependencies.
 *
 *  src/pages/**.html   page bodies, each starting with  <!--meta { ...json... }-->
 *  src/partials/*.html reusable fragments, included with {{> name}}
 *  src/assets/**       copied verbatim to dist/assets
 *  site.config.json    company details, exposed as {{site.*}}
 *
 * Tokens: {{page.title}}, {{site.contact.phone}}, {{links.whatsapp}} ... (HTML-escaped)
 *         {{{raw.jsonld}}} triple braces = inserted without escaping.
 * Unknown tokens fail the build so typos never reach production.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

const site = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
const siteUrl = site.url.replace(/\/+$/, '');

/* ---------- placeholders & derived links ---------- */
const isPlaceholder = (v) => typeof v !== 'string' || v.trim() === '' || /^\[.*\]$/.test(v.trim());
const warnings = [];
(function scan(obj, path) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue;
    if (v && typeof v === 'object') scan(v, `${path}${k}.`);
    else if (typeof v === 'string' && /^\[.*\]$/.test(v.trim())) warnings.push(`${path}${k} = ${v}`);
  }
})(site, '');
if (/\.example$/.test(new URL(siteUrl).hostname)) warnings.push(`url = ${site.url} (set your real domain for canonical URLs & sitemap)`);
if (!site.form.endpoint) warnings.push('form.endpoint is empty (contact form will offer WhatsApp/email instead of sending)');

const c = site.contact;
const waDigits = isPlaceholder(c.whatsapp) ? '' : c.whatsapp.replace(/\D/g, '');
const links = {
  whatsapp: waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(c.whatsappMessage)}` : '/contact/#contact-options',
  whatsappExternal: waDigits ? 'target="_blank" rel="noopener"' : '',
  email: isPlaceholder(c.email) ? '/contact/#contact-options' : `mailto:${c.email}`,
  phone: isPlaceholder(c.phone) ? '/contact/#contact-options' : `tel:${c.phone.replace(/[^\d+]/g, '')}`,
};
const waAltDigits = isPlaceholder(c.whatsappAlt || '') ? '' : c.whatsappAlt.replace(/\D/g, '');
const waLink = (d) => `https://wa.me/${d}?text=${encodeURIComponent(c.whatsappMessage)}`;
const escHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const waLines = {
  // Footer list items and contact-page lines for each configured WhatsApp number
  footer: [[waDigits, c.whatsapp], [waAltDigits, c.whatsappAlt]].filter(([d]) => d)
    .map(([d, label]) => `<li><a href="${waLink(d)}" target="_blank" rel="noopener">WhatsApp ${escHtml(label)}</a></li>`).join('\n            ')
    || '<li><a href="/contact/#contact-options">WhatsApp</a></li>',
  contact: [[waDigits, c.whatsapp], [waAltDigits, c.whatsappAlt]].filter(([d]) => d)
    .map(([d, label]) => `<a class="wa-number" href="${waLink(d)}" target="_blank" rel="noopener">${escHtml(label)}</a>`).join(''),
};
const flags = { whatsappReady: !!waDigits, emailReady: !isPlaceholder(c.email) };

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const partials = Object.fromEntries(
  readdirSync(join(SRC, 'partials')).filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), readFileSync(join(SRC, 'partials', f), 'utf8')])
);

function render(tpl, ctx, file, depth = 0) {
  if (depth > 10) throw new Error(`Partial recursion too deep in ${file}`);
  tpl = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Unknown partial "${name}" in ${file}`);
    return render(partials[name], ctx, `partials/${name}`, depth + 1);
  });
  tpl = tpl.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, key) => {
    const v = get(ctx, key);
    if (v === undefined) throw new Error(`Unknown token {{{${key}}}} in ${file}`);
    return String(v);
  });
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = get(ctx, key);
    if (v === undefined) throw new Error(`Unknown token {{${key}}} in ${file}`);
    return esc(v);
  });
}

/* ---------- structured data (only real, supplied facts) ---------- */
function jsonLd() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    slogan: site.tagline,
    url: siteUrl + '/',
    logo: siteUrl + '/assets/img/logo-mark.svg',
    image: siteUrl + '/assets/img/og-image.png',
    description: 'Software development and technology solutions company in Zimbabwe: websites, school management systems, custom business software, ERP and business automation.',
    areaServed: { '@type': 'Country', name: site.country },
    address: { '@type': 'PostalAddress', addressCountry: site.countryCode },
    knowsAbout: ['Website development', 'School management systems', 'Custom business software', 'ERP solutions', 'Business automation', 'Software maintenance and support'],
  };
  if (!isPlaceholder(c.city)) org.address.addressLocality = c.city;
  if (!isPlaceholder(c.email)) org.email = c.email;
  if (!isPlaceholder(c.phone)) org.telephone = c.phone;
  if (c.openingHours) org.openingHours = c.openingHours; // schema.org format, e.g. "Mo-Sa 08:00-17:00"
  const sameAs = Object.values(site.social).filter((v) => !isPlaceholder(v));
  if (sameAs.length) org.sameAs = sameAs;
  return JSON.stringify(org).replace(/</g, '\\u003c');
}

/* ---------- build ---------- */
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

for (const file of walk(join(SRC, 'assets'))) {
  const out = join(DIST, 'assets', relative(join(SRC, 'assets'), file));
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(file, out);
}

const pagesDir = join(SRC, 'pages');
const sitemap = [];
const layout = readFileSync(join(SRC, 'partials', '_layout.html'), 'utf8');
const bare = readFileSync(join(SRC, 'partials', '_bare.html'), 'utf8');

for (const file of walk(pagesDir).filter((f) => f.endsWith('.html'))) {
  const relFile = relative(pagesDir, file).split(sep).join('/');
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^\s*<!--meta\s*([\s\S]*?)-->/);
  if (!m) throw new Error(`Missing <!--meta {...}--> header in ${relFile}`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);

  // about.html -> /about/ ; work/x.html -> /work/x/ ; index.html -> / ; 404.html stays a file
  let urlPath, outFile;
  if (relFile === '404.html') { urlPath = '/404.html'; outFile = '404.html'; }
  else if (relFile.endsWith('index.html')) { urlPath = '/' + relFile.replace(/index\.html$/, ''); outFile = relFile; }
  else { urlPath = '/' + relFile.replace(/\.html$/, '/'); outFile = relFile.replace(/\.html$/, '/index.html'); }

  const page = {
    title: meta.title,
    description: meta.description,
    nav: meta.nav || '',
    url: siteUrl + urlPath,
    ogImage: siteUrl + (meta.ogImage || '/assets/img/og-image.png'),
    robots: meta.noindex ? 'noindex, follow' : 'index, follow',
    bodyClass: meta.bodyClass || '',
    backUrl: meta.backUrl || '/work/',
  };
  const ctx = { site, page, links, flags, year: new Date().getFullYear(), raw: { jsonld: jsonLd(), waFooter: waLines.footer, waContact: waLines.contact }, form: { endpoint: site.form.endpoint || '', whatsapp: waDigits, email: flags.emailReady ? c.email : '' } };

  const content = render(body, ctx, relFile);
  let html = render(meta.bare ? bare : layout, { ...ctx, raw: { ...ctx.raw, content } }, relFile);
  // Mark the active navigation item
  if (page.nav) html = html.replace(new RegExp(`data-nav="${page.nav}"`, 'g'), `data-nav="${page.nav}" aria-current="page"`);

  const out = join(DIST, outFile);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  if (!meta.noindex) sitemap.push({ loc: page.url, priority: meta.priority || '0.7' });
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemap.sort((a, b) => a.loc.localeCompare(b.loc))
    .map((s) => `  <url><loc>${s.loc}</loc><lastmod>${today}</lastmod><priority>${s.priority}</priority></url>`).join('\n') +
  `\n</urlset>\n`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
for (const f of ['_headers', '_redirects']) if (existsSync(join(SRC, f))) copyFileSync(join(SRC, f), join(DIST, f));

console.log(`✔ Built ${sitemap.length} indexed pages → dist/`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} placeholder(s) still to replace in site.config.json:`);
  for (const w of warnings) console.log('   • ' + w);
}
