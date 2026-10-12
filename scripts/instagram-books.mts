/**
 * Instagram carousels for the Books launch, from real screenshots of the live
 * feature (shelf, 3D book, reader, zoom, Urdu edition, resume) on colour panels,
 * 1080x1440 like the other cards. Two sets, each in its own folder:
 *   instagram/books-launch/mobile/    phone frames (390 x 844 screenshots)
 *   instagram/books-launch/desktop/   browser windows (1000 x 780 screenshots)
 * Needs the site running:  npm run dev   then   npm run instagram:books
 * Uses playwright-core with system Chrome. No people in any frame: only covers,
 * pages and the interface. Regenerating replaces only these two folders.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright-core';

const SITE = process.env.SITE ?? 'http://127.0.0.1:5173';
const root = process.cwd();
const outRoot = resolve(root, 'instagram/books-launch');
const tmp = resolve(outRoot, '.tmp');
rmSync(tmp, { recursive: true, force: true });
for (const v of ['mobile', 'desktop']) {
	rmSync(resolve(outRoot, v), { recursive: true, force: true });
	mkdirSync(resolve(outRoot, v), { recursive: true });
}
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({
	channel: 'chrome',
	headless: true,
	args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});

// ---- 1. real screenshots ----------------------------------------------------------------
type Device = 'mobile' | 'desktop';
const ctxOptions = (d: Device) =>
	d === 'mobile'
		? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
		: { viewport: { width: 1000, height: 780 }, deviceScaleFactor: 2 };

const slider = (p: Page, n: number) =>
	p.evaluate((n) => {
		const r = document.querySelector<HTMLInputElement>('.scrub')!;
		r.value = String(n);
		r.dispatchEvent(new Event('input', { bubbles: true }));
	}, n);

const captures: { name: string; init?: () => void; run: (p: Page, d: Device) => Promise<void> }[] = [
	{
		name: 'shelf',
		run: async (p, d) => {
			await p.goto(`${SITE}/books/`, { waitUntil: 'networkidle' });
			await p.waitForTimeout(1500);
			await p.evaluate((y) => scrollTo(0, y), d === 'mobile' ? 130 : 60);
			await p.waitForTimeout(400);
		}
	},
	{
		name: 'book',
		run: async (p) => {
			await p.goto(`${SITE}/books/blissful-union/`, { waitUntil: 'networkidle' });
			await p.waitForSelector('.scene.gl canvas', { timeout: 20000 });
			await p.waitForTimeout(1700); // the cover has opened and rests on the first spread
		}
	},
	{
		name: 'read',
		run: async (p) => {
			await p.goto(`${SITE}/books/blissful-union/read/`, { waitUntil: 'networkidle' });
			await p.waitForTimeout(3500);
		}
	},
	{
		name: 'zoom',
		run: async (p) => {
			await p.goto(`${SITE}/books/blissful-union/read/`, { waitUntil: 'networkidle' });
			await p.waitForTimeout(2500);
			await slider(p, 13);
			await p.waitForTimeout(1500);
			await p.click('[aria-label="Zoom in"]');
			await p.waitForTimeout(900);
			await p.click('[aria-label="Zoom in"]');
			await p.waitForTimeout(2200);
		}
	},
	{
		name: 'urdu',
		run: async (p) => {
			await p.goto(`${SITE}/books/blissful-union/read/?ed=urdu`, { waitUntil: 'networkidle' });
			await p.waitForTimeout(3000);
			await slider(p, 12);
			await p.waitForTimeout(2200);
		}
	},
	{
		name: 'resume',
		init: () => localStorage.setItem('bookpos:blissful-union:0', '47'),
		run: async (p) => {
			await p.goto(`${SITE}/books/blissful-union/read/`, { waitUntil: 'networkidle' });
			await p.waitForSelector('.resume', { timeout: 15000 });
			await p.waitForTimeout(1800);
		}
	}
];

for (const d of ['mobile', 'desktop'] as Device[]) {
	for (const c of captures) {
		const ctx = await browser.newContext(ctxOptions(d));
		if (c.init) await ctx.addInitScript(c.init);
		const p = await ctx.newPage();
		await c.run(p, d);
		await p.screenshot({ path: resolve(tmp, `${d}-${c.name}.png`) });
		await ctx.close();
	}
	// the home page row of covers (only the first three books are shown: no illustrated figures)
	const ctx = await browser.newContext(ctxOptions(d));
	const p = await ctx.newPage();
	await p.goto(`${SITE}/`, { waitUntil: 'networkidle' });
	const sec = p.locator('section[aria-labelledby=books-h]');
	await sec.scrollIntoViewIfNeeded();
	await p.waitForTimeout(900);
	if (d === 'mobile') {
		await p.evaluate(() => {
			const el = document.querySelector('section[aria-labelledby=books-h]')!;
			scrollTo(0, el.getBoundingClientRect().top + scrollY - 90);
		});
		await p.waitForTimeout(500);
		await p.screenshot({ path: resolve(tmp, 'mobile-strip.png') });
	} else {
		const box = (await sec.boundingBox())!;
		await p.screenshot({ path: resolve(tmp, 'desktop-strip.png'), clip: { x: 0, y: box.y + 40, width: 690, height: Math.min(box.height - 60, 520) } });
	}
	await ctx.close();
}

// ---- 2. the slides ----------------------------------------------------------------------
const flower = `<svg width="46" height="46" viewBox="-9 -9 18 18"><g fill="#ff00a0"><circle cx="0" cy="-4.4" r="3.2"/><circle cx="4.18" cy="-1.36" r="3.2"/><circle cx="2.59" cy="3.56" r="3.2"/><circle cx="-2.59" cy="3.56" r="3.2"/><circle cx="-4.18" cy="-1.36" r="3.2"/></g><circle r="2.1" fill="#ffbe00"/></svg>`;
const base = `
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1440px;background:#fff;color:#0d0c13;font-family:Inter,system-ui,sans-serif;position:relative;overflow:hidden}
.top{position:absolute;left:88px;right:88px;top:84px;display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:14px;font-size:38px;font-weight:600;letter-spacing:-.02em}
.count{font:500 28px 'JetBrains Mono',ui-monospace,monospace;color:#6b6a78;letter-spacing:.04em}
.eyebrow{position:absolute;left:88px;top:204px;font-size:30px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
h1{position:absolute;left:88px;right:88px;top:262px;font-size:112px;line-height:1.02;letter-spacing:-.045em;font-weight:500;text-wrap:balance}
.panel{position:absolute;left:56px;right:56px;bottom:0;border-radius:64px 64px 0 0}
.phone{position:absolute;border:8px solid #0d0c13;border-bottom:0;border-radius:72px 72px 0 0;overflow:hidden;background:#fff}
.phone img{display:block;width:100%}
.win{position:absolute;background:#fff;border:6px solid #0d0c13;border-bottom:0;border-radius:30px 30px 0 0;overflow:hidden}
.bar{height:56px;background:#f6f6f8;border-bottom:2px solid #e8e7ee;display:flex;align-items:center;gap:12px;padding:0 20px}
.bar i{width:16px;height:16px;border-radius:50%;background:#cfcdd9}
.bar span{margin-left:14px;flex:1;max-width:520px;height:34px;border-radius:17px;background:#fff;border:2px solid #e8e7ee;font:500 20px/30px 'JetBrains Mono',ui-monospace,monospace;color:#6b6a78;padding:0 16px;white-space:nowrap;overflow:hidden}
.win img{display:block;width:100%}
`;
type Slide = { name: string; hue: string; eyebrow: string; title: string; shot?: string; url?: string; custom?: 'cover' | 'start' };
const u = 'arriqaaq.com/books';
const slides: Slide[] = [
	{ name: 'cover', hue: '#9800ff', eyebrow: 'New on Arriqaaq', title: 'Our books, <span style="color:#9800ff">free</span> to read.', custom: 'cover' },
	{ name: 'shelf', hue: '#0066ff', eyebrow: 'The shelf', title: 'Nine books, <span style="color:#0066ff">one shelf.</span>', shot: 'shelf', url: u },
	{ name: '3d-book', hue: '#ff00a0', eyebrow: 'Every book', title: 'Open a book <span style="color:#ff00a0">in 3D.</span>', shot: 'book', url: `${u}/blissful-union` },
	{ name: 'reader', hue: '#00c25a', eyebrow: 'The reader', title: 'Read the whole book <span style="color:#00c25a">here.</span>', shot: 'read', url: `${u}/blissful-union/read` },
	{ name: 'zoom', hue: '#0066ff', eyebrow: 'On any screen', title: 'Zoom in. <span style="color:#0066ff">Jump to any page.</span>', shot: 'zoom', url: `${u}/blissful-union/read` },
	{ name: 'urdu', hue: '#9800ff', eyebrow: 'Two languages', title: 'English and <span style="color:#9800ff">Urdu</span> editions.', shot: 'urdu', url: `${u}/blissful-union/read` },
	{ name: 'resume', hue: '#ff00a0', eyebrow: 'Made for phones', title: 'Pick up <span style="color:#ff00a0">where you stopped.</span>', shot: 'resume', url: `${u}/blissful-union/read` },
	{ name: 'start', hue: '#00c25a', eyebrow: 'Free, always', title: 'Start reading <span style="color:#00c25a">today.</span>', custom: 'start' }
];
const img = (d: Device, n: string) => pathToFileURL(resolve(tmp, `${d}-${n}.png`)).href;

const frame = (d: Device, n: string, url: string, style: string) =>
	d === 'mobile'
		? `<div class="phone" style="${style}"><img src="${img(d, n)}"></div>`
		: `<div class="win" style="${style}"><div class="bar"><i></i><i></i><i></i><span>${url}</span></div><img src="${img(d, n)}"></div>`;

const startText = (top: number, left: number) => `<div style="position:absolute;left:${left}px;right:${left}px;top:${top}px;display:grid;gap:26px;color:#fff">
<div style="font-size:94px;font-weight:600;letter-spacing:-.045em;line-height:1">arriqaaq.com/books</div>
<div style="font-size:40px;font-weight:500;letter-spacing:-.02em;line-height:1.3">No sign-up. No cost. Read on the site,<br>or download any book as a PDF.</div></div>`;

function body(d: Device, s: Slide, i: number) {
	const panelTop = d === 'mobile' ? 690 : 640;
	const head = `<div class="top"><div class="brand">${flower}arriqaaq</div><div class="count">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</div></div>
<div class="eyebrow" style="color:${s.hue}">${s.eyebrow}</div><h1>${s.title}</h1><div class="panel" style="background:${s.hue};top:${panelTop}px"></div>`;
	if (d === 'mobile') {
		const small = 'width:340px;border-width:6px;border-radius:52px 52px 0 0;';
		if (s.custom === 'cover')
			return head + frame(d, 'shelf', '', `${small}left:60px;top:850px;height:640px`) + frame(d, 'read', '', `${small}left:370px;top:760px;height:700px`) + frame(d, 'book', '', `${small}left:680px;top:850px;height:640px`);
		if (s.custom === 'start') return head + startText(730, 88) + frame(d, 'strip', '', 'left:160px;width:760px;top:1010px;height:430px;border-width:8px;border-radius:56px 56px 0 0');
		return head + frame(d, s.shot!, '', 'left:290px;top:640px;width:500px;height:900px');
	}
	if (s.custom === 'cover')
		return head + frame(d, 'shelf', u, 'left:84px;width:760px;top:730px') + frame(d, 'read', `${u}/blissful-union/read`, 'left:300px;width:700px;top:1010px');
	if (s.custom === 'start') return head + startText(704, 112) + frame(d, 'strip', 'arriqaaq.com', 'left:160px;width:760px;top:1030px');
	return head + frame(d, s.shot!, s.url!, 'left:68px;width:944px;top:722px');
}

const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } });
for (const d of ['mobile', 'desktop'] as Device[]) {
	for (const [i, s] of slides.entries()) {
		const f = resolve(tmp, `${d}-slide-${i}.html`);
		writeFileSync(
			f,
			`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=JetBrains+Mono:wght@500&display=swap"><style>${base}</style></head><body>${body(d, s, i)}</body></html>`
		);
		await page.goto(pathToFileURL(f).href, { waitUntil: 'networkidle' }).catch(() => {});
		await page.evaluate(() => document.fonts.ready);
		const name = `${String(i + 1).padStart(2, '0')}-${s.name}.png`;
		await page.screenshot({ path: resolve(outRoot, d, name) });
		console.log('wrote', d, name);
	}
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
