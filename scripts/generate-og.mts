/**
 * Renders the default social share card (static/og/default.png, 1200x630) in
 * the site's own look: Inter 500 title, palette pixel blocks, the canonical
 * description. Used by Seo.svelte for every page without its own feature
 * image. Re-run after a brand change: npm run og
 * Uses playwright-core with the system Chrome (no browser download).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rng } from '../src/lib/art.ts';

const out = resolve(process.cwd(), 'static/og');
mkdirSync(out, { recursive: true });
const tones = ['#ff00a0', '#9800ff', '#0066ff', '#ffbe00', '#00c25a'];
const rand = rng('arriqaaq-hero');
const COLS = 12;
const ROWS = 4;
const blocks = Array.from({ length: COLS * ROWS }, () => tones[Math.floor(rand() * tones.length)]);
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#fff;color:#0d0c13;font-family:Inter,system-ui,sans-serif;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.eyebrow{font-size:26px;font-weight:500;color:#45434f;letter-spacing:-.01em}
h1{font-size:112px;line-height:1.02;letter-spacing:-.04em;font-weight:500;max-width:760px}
h1 span{color:#ff00a0}
p{font-size:28px;line-height:1.35;color:#45434f;max-width:720px;letter-spacing:-.01em}
.row{display:flex;justify-content:space-between;align-items:flex-end}
.brand{font-size:30px;font-weight:600;letter-spacing:-.02em}
.px{position:absolute;right:80px;top:72px;display:grid;grid-template-columns:repeat(${COLS},20px);gap:8px}
.px i{width:20px;height:20px;display:block}
</style></head><body>
<div class="px">${blocks.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
<div class="eyebrow">The deen, from first principles</div>
<div><h1>Roots before branches<span>.</span></h1></div>
<div class="row"><p>An online creative space for authentic Islamic courses, articles, crafts, education and technology.</p><div class="brand">arriqaaq.com</div></div>
</body></html>`;
const file = resolve(out, 'default.html');
writeFileSync(file, html);
const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' }).catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(out, 'default.png') });
await browser.close();
import('node:fs').then((fs) => fs.rmSync(file));
console.log('wrote static/og/default.png');
