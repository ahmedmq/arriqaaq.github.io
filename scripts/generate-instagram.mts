/**
 * Renders Instagram post images (1080x1440 (3:4), the size Instagram now uses for the profile grid) into
 * instagram/. Same look as the site: Inter, palette at full strength, pixel
 * blocks. Add a card by adding an entry to `cards`. Run: npm run instagram
 * Uses playwright-core with the system Chrome.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { rng } from '../src/lib/art.ts';

const root = process.cwd();
const out = resolve(root, 'instagram');
mkdirSync(out, { recursive: true });
const tones = ['#ff00a0', '#9800ff', '#0066ff', '#ffbe00', '#00c25a'];
const course = yaml.load(readFileSync(resolve(root, 'content/courses/usul-al-fiqh.yaml'), 'utf8')) as any;
const lessons = course.modules.reduce((n: number, m: any) => n + m.lessons.length, 0);
const mustalah = yaml.load(readFileSync(resolve(root, 'content/courses/mustalah-hadith.yaml'), 'utf8')) as any;
const mustalahLessons = mustalah.modules.reduce((n: number, m: any) => n + m.lessons.length, 0);
// Mustalah Hadith is a purple course; a few pink squares keep it lively.
const pinkAt = new Set([3, 10, 14, 21]);

const grid = (n: number, cols: number, size: number, color: (i: number) => string) =>
	`<div style="display:grid;grid-template-columns:repeat(${cols},${size}px);gap:8px">${Array.from(
		{ length: n },
		(_, i) => `<i style="width:${size}px;height:${size}px;background:${color(i)}"></i>`
	).join('')}</div>`;

const rand = rng('arriqaaq-hero');
const heroBlocks = Array.from({ length: 48 }, () => tones[Math.floor(rand() * tones.length)]);


/**
 * A small diagram for a lesson card: four coloured steps joined by dashed
 * arrows, in plain words anyone can follow without reading the post. Same
 * four palette colours as the post's diagrams (green, purple, blue, pink),
 * white text on colour, no amber. Add a function like this per lesson.
 */
function mustalahStory(): string {
	const step = (hue: string, label: string, title: string) =>
		`<div style="background:${hue};border:4px solid #0d0c13;border-radius:28px;padding:28px 32px;color:#fff;width:400px;height:190px;display:flex;flex-direction:column;justify-content:center;gap:8px">
<div style="font-size:21px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">${label}</div>
<div style="font-size:38px;font-weight:600;letter-spacing:-.02em;line-height:1.12">${title}</div></div>`;
	const arrowL = (w: number) =>
		`<svg width="${w}" height="40" viewBox="0 0 ${w} 40"><line x1="${w - 2}" y1="20" x2="14" y2="20" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M16,8 L2,20 L16,32 Z" fill="#0d0c13"/></svg>`;
	const arrow = (w: number) =>
		`<svg width="${w}" height="40" viewBox="0 0 ${w} 40"><line x1="2" y1="20" x2="${w - 14}" y2="20" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M${w - 16},8 L${w - 2},20 L${w - 16},32 Z" fill="#0d0c13"/></svg>`;
	const down = `<svg width="40" height="64" viewBox="0 0 40 64"><line x1="20" y1="2" x2="20" y2="48" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M8,46 L20,62 L32,46 Z" fill="#0d0c13"/></svg>`;
	return `<div style="display:flex;flex-direction:column;align-items:center;gap:0">
<div style="display:flex;align-items:center;gap:20px">${step('#00c25a', 'Since the Sahabah', 'Hadith written in sahifas')}${arrow(60)}${step('#9800ff', 'The first works', 'Al-Risalah of al\u2011Shafi\u2019i')}</div>
<div style="align-self:flex-end;margin-right:200px">${down}</div>
<div style="display:flex;align-items:center;gap:20px">${step('#ff00a0', 'The turning point', 'Ibn al-Salah')}${arrowL(60)}${step('#0066ff', 'The later days', 'Books on the science itself')}</div></div>`;
}

const base = `
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1440px;background:#fff;color:#0d0c13;font-family:Inter,system-ui,sans-serif;padding:96px 88px;display:flex;flex-direction:column;justify-content:space-between}
.eyebrow{font-size:34px;font-weight:500;color:#45434f;letter-spacing:-.01em}
h1{font-size:150px;line-height:1.02;letter-spacing:-.04em;font-weight:500}
p{font-size:38px;line-height:1.35;color:#45434f;letter-spacing:-.01em}
.brand{font-size:38px;font-weight:600;letter-spacing:-.02em}
i{display:block}`;

const cards: Record<string, string> = {
	'share-card': `<div>${grid(48, 12, 62, (i) => heroBlocks[i])}</div>
<div><div class="eyebrow" style="margin-bottom:32px">The deen, from first principles</div><h1>Roots before branches<span style="color:#ff00a0">.</span></h1></div>
<div><p style="margin-bottom:48px">An online creative space for authentic Islamic courses, articles, crafts, education and technology.</p><div class="brand">arriqaaq.com</div></div>`,
	'usul-al-fiqh-series': `<div style="display:flex;justify-content:space-between;align-items:flex-start">
<div class="eyebrow">Course · ${lessons} lessons · ${course.level}</div>${grid(24, 6, 36, () => '#0066ff')}</div>
<div><h1 style="color:#0066ff;margin-bottom:40px">${course.title}</h1>
<div style="font-family:'IBM Plex Sans Arabic','Noto Naskh Arabic',sans-serif;font-size:96px;font-weight:500;direction:rtl;text-align:left;margin-bottom:48px">${course.arabic}</div>
<p>${course.tagline}</p></div>
<div style="display:flex;justify-content:space-between;align-items:flex-end"><p style="color:#0d0c13;font-weight:500">Start with lesson one</p><div class="brand">arriqaaq.com</div></div>`
	,
	'mustalah-hadith-series': `<div style="display:flex;justify-content:space-between;align-items:flex-start">
<div class="eyebrow">Course · ${mustalahLessons} lesson${mustalahLessons === 1 ? '' : 's'} · ${mustalah.level}</div>${grid(24, 6, 36, (i) => (pinkAt.has(i) ? '#ff00a0' : '#9800ff'))}</div>
<div><h1 style="color:#9800ff;margin-bottom:40px">${mustalah.title}</h1>
<div style="font-family:'IBM Plex Sans Arabic','Noto Naskh Arabic',sans-serif;font-size:96px;font-weight:500;direction:rtl;text-align:left;margin-bottom:48px">${mustalah.arabic}</div>
<p>${mustalah.tagline}</p></div>
<div style="display:flex;justify-content:space-between;align-items:flex-end"><p style="color:#0d0c13;font-weight:500">Start with lesson one</p><div class="brand">arriqaaq.com</div></div>`,
	'mustalah-hadith-part-1': `<div style="display:flex;justify-content:space-between;align-items:flex-start">
<div class="eyebrow">${mustalah.title} · Part 1</div>${grid(4, 4, 44, (i) => ['#00c25a', '#9800ff', '#0066ff', '#ff00a0'][i])}</div>
<div><h1 style="color:#9800ff;margin-bottom:24px">A brief history</h1>
<p style="margin-bottom:48px">Understanding the history of Mustalah al-Hadith</p>
${mustalahStory()}</div>
<div style="display:flex;justify-content:space-between;align-items:flex-end"><p style="color:#0d0c13;font-weight:500">Read the first lesson</p><div class="brand">arriqaaq.com</div></div>`
};

const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, body] of Object.entries(cards)) {
	const file = resolve(out, `${name}.tmp.html`);
	writeFileSync(
		file,
		`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=IBM+Plex+Sans+Arabic:wght@500&display=swap"><style>${base}</style></head><body>${body}</body></html>`
	);
	const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } });
	await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' }).catch(() => {});
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: resolve(out, `${name}.png`) });
	await page.close();
	rmSync(file);
	console.log(`wrote instagram/${name}.png`);
}
await browser.close();
