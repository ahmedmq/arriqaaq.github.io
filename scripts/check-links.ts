/**
 * Link checker for the built site (DESIGN.md → Content integrity).
 * Crawls every HTML page in build/ and fails if it finds:
 *   - an internal link or image that points at nothing,
 *   - an in-page #anchor with no matching id,
 *   - an unconverted directive (raw "::bookmark{" text),
 *   - a reference to a host known to be offline.
 * Run after a build:  npm run build && npm run check:links
 * External sites are not fetched (many block bots); add a host to DEAD_HOSTS
 * when one goes offline.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const BUILD = resolve(process.cwd(), 'build');
const DEAD_HOSTS = ['health.arriqaaq.com', 'ilm.arriqaaq.com', 'telesco.pe', 'telegram-cdn.org', 'pps.whatsapp.net', 'fbcdn.net', 'glide-prod'];
const OWN_HOSTS = new Set(['arriqaaq.com', 'www.arriqaaq.com']);

if (!existsSync(BUILD)) {
	console.error('No build/ directory. Run `npm run build` first.');
	process.exit(2);
}

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
	});
}

function exists(path: string): boolean {
	const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
	if (!clean || clean === '/') return true;
	const fp = join(BUILD, clean.replace(/^\//, ''));
	return (
		(existsSync(fp) && statSync(fp).isFile()) ||
		existsSync(join(fp, 'index.html')) ||
		existsSync(fp + '.html')
	);
}

const unescape = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const problems: string[] = [];
const pages = walk(BUILD);

for (const file of pages) {
	const html = readFileSync(file, 'utf8');
	const page = '/' + relative(BUILD, file).replace(/index\.html$/, '');
	if (/::(bookmark|image|embed|gallery|callout|toggle|pause)\{/.test(html)) problems.push(`${page}: unconverted directive`);
	const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
	for (const m of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
		const v = unescape(m[2]);
		if (DEAD_HOSTS.some((h) => v.includes(h))) problems.push(`${page}: offline host ${v}`);
		if (/^(mailto:|tel:|javascript:|data:)/.test(v)) continue;
		if (v.startsWith('#')) {
			if (v.length > 1 && !ids.has(decodeURIComponent(v.slice(1)))) problems.push(`${page}: missing anchor ${v}`);
			continue;
		}
		if (/^(https?:)?\/\//.test(v)) {
			const url = new URL(v.startsWith('//') ? 'https:' + v : v);
			if (OWN_HOSTS.has(url.hostname) && !url.pathname.startsWith('/blog') && !exists(url.pathname)) problems.push(`${page}: broken ${v}`);
			continue;
		}
		if (v.startsWith('/_app/') || v.startsWith('/pagefind')) continue;
		const target = v.startsWith('/') ? v : new URL(v, 'https://x' + page).pathname;
		if (!exists(target)) problems.push(`${page}: broken ${v}`);
	}
}

if (problems.length) {
	console.error(`check-links: ${problems.length} problem(s) across ${pages.length} pages`);
	for (const p of problems.slice(0, 200)) console.error('  ' + p);
	process.exit(1);
}
console.log(`check-links: ${pages.length} pages, no broken links, images, anchors or directives`);
