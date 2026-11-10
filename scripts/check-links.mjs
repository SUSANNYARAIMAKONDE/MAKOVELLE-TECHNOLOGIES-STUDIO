#!/usr/bin/env node
/** Verifies every internal href/src in dist/ resolves to a file, and every #fragment to an id. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const resolve = (p) => {
  const f = join(DIST, p);
  if (existsSync(f) && statSync(f).isFile()) return f;
  if (existsSync(join(f, 'index.html'))) return join(f, 'index.html');
  return null;
};
let errors = 0, checked = 0;
for (const page of pages) {
  // Tab links in the portal demo are JavaScript hash routes, not page anchors
  const html = readFileSync(page, 'utf8').replace(/<a [^>]*data-tab[^>]*>/g, '');
  const rel = page.slice(DIST.length);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    checked++;
    const [pathPart, hash] = url.split('#');
    const [cleanPath] = pathPart.split('?');
    const target = cleanPath ? resolve(cleanPath) : page;
    if (!target) { console.log(`✗ ${rel}: missing ${url}`); errors++; continue; }
    if (hash && target.endsWith('.html') && !readFileSync(target, 'utf8').includes(`id="${hash}"`)) {
      console.log(`✗ ${rel}: missing anchor ${url}`); errors++;
    }
  }
}
console.log(errors ? `\n${errors} broken link(s) of ${checked}` : `✔ ${checked} internal links OK across ${pages.length} pages`);
process.exit(errors ? 1 : 0);
