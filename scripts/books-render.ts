// Renders each book's cover and "Look inside" pages from its PDF (or from a
// source image when the PDF is not in the repo yet), and writes
// content/books/media.json. Needs poppler (pdftoppm, pdfinfo) and ImageMagick.
//
//   npm run books:render            all books
//   npm run books:render -- ibn-hazm   one book
//
// Output is committed (static/images/books/<slug>/), so the site build itself
// needs neither tool.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const BOOKS = resolve(ROOT, 'content/books');
const MEDIA = resolve(BOOKS, 'media.json');
const only = process.argv[2];

const run = (cmd: string, args: string[]) => execFileSync(cmd, args, { encoding: 'utf8' });
const size = (file: string) => {
	const [w, h] = run('magick', ['identify', '-format', '%w %h', file]).split(' ').map(Number);
	return { w, h };
};

const media: Record<string, any> = existsSync(MEDIA) ? JSON.parse(readFileSync(MEDIA, 'utf8')) : {};

for (const f of readdirSync(BOOKS).filter((f) => /\.ya?ml$/.test(f)).sort()) {
	const b: any = yaml.load(readFileSync(resolve(BOOKS, f), 'utf8'));
	if (only && b.slug !== only) continue;
	const out = resolve(ROOT, 'static/images/books', b.slug);
	rmSync(out, { recursive: true, force: true });
	mkdirSync(out, { recursive: true });

	const pdfPath = b.pdf ?? b.editions?.[0]?.pdf;
	const pdf = pdfPath ? resolve(ROOT, 'static' + pdfPath) : null;
	const hasPdf = !!pdf && existsSync(pdf);
	const rec: any = { pages: b.pages ?? null, pdf: hasPdf, cover: null, ratio: null, page_ratio: null, previews: [] };

	if (hasPdf) {
		const info = run('pdfinfo', [pdf!]);
		rec.pages = Number(/Pages:\s+(\d+)/.exec(info)![1]);
		const m = /Page size:\s+([\d.]+) x ([\d.]+)/.exec(info)!;
		rec.page_ratio = +(Number(m[1]) / Number(m[2])).toFixed(4);
	}

	const toJpg = (srcPng: string, dest: string, width: number, crop?: string) => {
		const args = [srcPng];
		if (crop) args.push('-crop', crop, '+repage');  // crop is WxH+X+Y
		args.push('-resize', `${width}x`, '-quality', '82', '-strip', dest);
		run('magick', args);
	};
	const page = (n: number, dest: string, width: number) => {
		const tmp = resolve(out, `.tmp-${n}`);
		run('pdftoppm', ['-f', String(n), '-l', String(n), '-r', '110', '-png', '-singlefile', pdf!, tmp]);
		toJpg(`${tmp}.png`, dest, width);
		rmSync(`${tmp}.png`);
	};

	const coverFile = resolve(out, 'cover.jpg');
	if (b.cover?.image) toJpg(resolve(ROOT, b.cover.image), coverFile, 600, b.cover.crop);
	else if (hasPdf) page(b.cover_page ?? 1, coverFile, 600);
	if (existsSync(coverFile)) {
		const s = size(coverFile);
		rec.cover = `/images/books/${b.slug}/cover.jpg`;
		rec.ratio = +(s.w / s.h).toFixed(4);
	}

	if (hasPdf) {
		for (const n of b.preview ?? []) {
			if (n > rec.pages) throw new Error(`${b.slug}: preview page ${n} is past the last page (${rec.pages})`);
			page(n, resolve(out, `p-${n}.jpg`), 640);
			rec.previews.push(n);
		}
	}
	media[b.slug] = rec;
	console.log(`${b.slug}: ${rec.pages ?? '?'} pages, cover ${rec.cover ? 'ok' : 'none'}, ${rec.previews.length} preview pages${hasPdf ? '' : ' (no PDF yet)'}`);
}
writeFileSync(MEDIA, JSON.stringify(media, null, '\t') + '\n');
