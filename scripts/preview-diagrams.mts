/**
 * Render every diagram in one batch module (scripts/diagrams/<batch>.ts) to
 * PNGs at phone width (390px) and desktop width (1280px), using the site's
 * figure styling, so an author can check them visually. Uses playwright-core
 * with the system Chrome (no browser download).
 * Usage: npm run preview:diagrams -- <batch> <out-dir> [key]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [batch, outDir, onlyKey] = process.argv.slice(2);
const repo = process.cwd();
const mod = await import(pathToFileURL(resolve(repo, `scripts/diagrams/${batch}.ts`)).href);
const diagrams: Record<string, { title: string; body: string; wide?: boolean }> = mod.diagrams;
mkdirSync(outDir, { recursive: true });
const { chromium } = await import('playwright-core');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const css = `body{margin:0;background:#fff;font-family:Inter,'Noto Naskh Arabic',system-ui,sans-serif;padding:20px}
figure{margin:0 auto;max-width:440px} figure.cols{max-width:760px} .dgm-d{display:none} @media (min-width:900px){figure.cols .dgm-m{display:none} figure.cols .dgm-d{display:block}}
figure.wide{max-width:1040px} svg{width:100%;height:auto;overflow:visible;display:block}
figcaption{margin-top:12px;font-size:14px;color:#6b6a78;text-align:left}`;
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=JetBrains+Mono:wght@400;600&family=Noto+Naskh+Arabic:wght@400..700&display=swap">`;
for (const [key, d] of Object.entries(diagrams)) {
	if (onlyKey && key !== onlyKey) continue;
	const html = `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${css}</style></head><body><figure class="${d.wide ? 'wide' : ''} ${d.body.includes('dgm-d') ? 'cols' : ''}">${d.body}<figcaption>${d.title}</figcaption></figure></body></html>`;
	const file = resolve(outDir, `${key}.html`);
	writeFileSync(file, html);
	for (const w of [390, 1280]) {
		const p = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: w < 600 ? 2 : 1 });
		await p.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' }).catch(() => {});
		await p.waitForTimeout(300);
		await p.locator('figure').screenshot({ path: resolve(outDir, `${key}-${w}.png`) });
		await p.close();
	}
	console.log('rendered', key);
}
await browser.close();
