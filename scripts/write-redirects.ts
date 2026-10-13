/**
 * Post-build: a small page at each old (renamed) post URL that sends the
 * reader to the new one. On Cloudflare Pages functions/_middleware.js answers
 * these paths with a real 301 first, so the pages are the fallback for any
 * host without it (the GitHub Pages workflow). Google treats an instant meta
 * refresh as a permanent redirect, and the canonical points at the new URL.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const redirects: Record<string, string> = JSON.parse(readFileSync(resolve(ROOT, 'src/lib/generated/redirects.json'), 'utf8'));
const site = JSON.parse(readFileSync(resolve(ROOT, 'src/lib/generated/settings.json'), 'utf8')).url;

for (const [from, to] of Object.entries(redirects)) {
	const dir = resolve(ROOT, 'build', from);
	if (existsSync(resolve(dir, 'index.html'))) throw new Error(`write-redirects: /${from}/ is a live page`);
	const url = `${site}/${to}/`;
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		resolve(dir, 'index.html'),
		`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to /${to}/</title>
<link rel="canonical" href="${url}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=/${to}/">
<script>location.replace('/${to}/' + location.search + location.hash)</script>
</head>
<body><p>This page has moved to <a href="/${to}/">${url}</a>.</p></body>
</html>
`
	);
}
console.log(`write-redirects: ${Object.keys(redirects).length} old URLs`);
