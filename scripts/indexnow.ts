/**
 * IndexNow: tell Bing, Yandex, Seznam and others which URLs changed, so they
 * recrawl within minutes instead of days (https://www.indexnow.org). Free, no
 * account; ownership is proven by the key file in static/<key>.txt.
 *
 *   tsx scripts/indexnow.ts diff    before deploy: compare build/sitemap.xml
 *                                   with the live one, write the new or
 *                                   changed URLs (and renamed ones) to
 *                                   .indexnow-urls.json
 *   tsx scripts/indexnow.ts submit  after deploy: send that list
 *   tsx scripts/indexnow.ts all     after deploy: send every sitemap URL
 *                                   (first run, or after a site-wide change)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const KEY = 'ce8800a9b620c6eb19cbc16a98185f63';
const ROOT = process.cwd();
const SITE = JSON.parse(readFileSync(resolve(ROOT, 'src/lib/generated/settings.json'), 'utf8')).url as string;
const HOST = new URL(SITE).host;
const LIST = resolve(ROOT, '.indexnow-urls.json');

function parseSitemap(xml: string): Map<string, string> {
	const out = new Map<string, string>();
	for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) out.set(m[1], m[2] ?? '');
	return out;
}

async function submit(urls: string[]) {
	if (!urls.length) return console.log('indexnow: nothing changed');
	// One request takes up to 10,000 URLs.
	const res = await fetch('https://api.indexnow.org/indexnow', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) })
	});
	console.log(`indexnow: ${urls.length} URLs → HTTP ${res.status}`);
	// 200/202 = accepted. Anything else is reported but never fails a deploy.
	if (res.status >= 300) console.log(await res.text());
}

const mode = process.argv[2];
if (mode === 'diff') {
	const next = parseSitemap(readFileSync(resolve(ROOT, 'build/sitemap.xml'), 'utf8'));
	let live = new Map<string, string>();
	try {
		live = parseSitemap(await (await fetch(`${SITE}/sitemap.xml`)).text());
	} catch {
		console.log('indexnow: live sitemap unreachable, listing nothing');
		live = next;
	}
	const changed = [...next].filter(([u, mod]) => live.get(u) !== mod).map(([u]) => u);
	// URLs that left the sitemap (renamed or removed) are submitted too, so
	// engines see the redirect or the 404 quickly.
	const gone = [...live.keys()].filter((u) => !next.has(u));
	writeFileSync(LIST, JSON.stringify([...changed, ...gone], null, '\t'));
	console.log(`indexnow: ${changed.length} new or changed, ${gone.length} gone`);
} else if (mode === 'submit') {
	await submit(existsSync(LIST) ? JSON.parse(readFileSync(LIST, 'utf8')) : []);
} else if (mode === 'all') {
	await submit([...parseSitemap(readFileSync(resolve(ROOT, 'build/sitemap.xml'), 'utf8')).keys()]);
} else {
	console.error('usage: tsx scripts/indexnow.ts diff|submit|all');
	process.exit(1);
}
