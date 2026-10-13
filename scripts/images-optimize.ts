/**
 * Image weight for phones: writes a WebP copy next to each raster image in
 * static/images/ (at most 1600px wide) and records every image's size in
 * content/images.json. The build (scripts/rehype-images.ts) uses that to give
 * each article <img> a width and height (no layout shift) and a WebP source.
 *
 *   npm run images:optimize     after adding or changing images; idempotent
 *
 * Originals are never modified, and a WebP is kept only when it is smaller.
 * Images used by the pages DESIGN.md says never to touch (team pages,
 * /magazine/, /lettersfromthesoul/, the /ilm/ post) are skipped entirely.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES = resolve(ROOT, 'static/images');
const MANIFEST = resolve(ROOT, 'content/images.json');
const MAX_W = 1600;
const RASTER = new Set(['.png', '.jpg', '.jpeg']);

// DESIGN.md → never touch these pages' images.
export const PROTECTED_PAGES = [
	'pages/aiasha-sadaf-ismailmalik',
	'pages/asiya-khan',
	'pages/huda-syed',
	'pages/zahravenkat',
	'pages/zara-ilyas',
	'pages/saniya-khaleel',
	'pages/zahra-shahid',
	'pages/magazine',
	'pages/lettersfromthesoul',
	'pages/unfurl',
	'posts/ilm'
];

function protectedImages(): Set<string> {
	const out = new Set<string>();
	for (const p of PROTECTED_PAGES) {
		const f = resolve(ROOT, `content/${p}.md`);
		if (!existsSync(f)) continue;
		for (const m of readFileSync(f, 'utf8').matchAll(/\/images\/[^\s")'\]]+/g)) out.add(decodeURI(m[0]));
	}
	return out;
}

function walk(dir: string, out: string[] = []): string[] {
	for (const f of readdirSync(dir)) {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

type Entry = { w: number; h: number; webp?: string };

const skip = protectedImages();
const manifest: Record<string, Entry> = {};
let before = 0;
let after = 0;
let made = 0;

for (const file of walk(IMAGES).sort()) {
	const ext = extname(file).toLowerCase();
	if (!RASTER.has(ext)) continue;
	const url = '/' + relative(resolve(ROOT, 'static'), file).split('\\').join('/');
	let meta;
	try {
		meta = await sharp(file).metadata();
	} catch {
		continue; // not a readable image
	}
	if (!meta.width || !meta.height) continue;
	const entry: Entry = { w: meta.width, h: meta.height };
	manifest[url] = entry;
	if (skip.has(url)) continue;

	// foo.png → foo.png.webp, so foo.png and foo.jpg never collide.
	const out = file + '.webp';
	const size = statSync(file).size;
	if (!existsSync(out) || statSync(out).mtimeMs < statSync(file).mtimeMs) {
		await sharp(file)
			.rotate()
			.resize({ width: MAX_W, withoutEnlargement: true })
			.webp({ quality: 78, effort: 5 })
			.toFile(out);
		made++;
	}
	const webpSize = statSync(out).size;
	// Worth it only when clearly smaller; otherwise the original stays the only source.
	if (webpSize < size * 0.9) {
		entry.webp = url + '.webp';
		before += size;
		after += webpSize;
	}
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
const mb = (n: number) => (n / 1048576).toFixed(1) + ' MB';
console.log(
	`images: ${Object.keys(manifest).length} measured, ${made} WebP written; ` +
		`${Object.values(manifest).filter((e) => e.webp).length} served as WebP: ${mb(before)} → ${mb(after)}`
);
