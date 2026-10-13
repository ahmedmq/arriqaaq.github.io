// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { prefersMarkdown, addVary, notFoundMarkdown } from '../functions/lib/agent.js';

test('prefersMarkdown honours explicit markdown, not wildcards', () => {
	assert.equal(prefersMarkdown('text/markdown'), true);
	assert.equal(prefersMarkdown('text/markdown, text/html;q=0.5'), true);
	assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
	assert.equal(prefersMarkdown('text/markdown;q=0'), false);
	assert.equal(prefersMarkdown('*/*'), false);
	assert.equal(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8'), false);
	assert.equal(prefersMarkdown(null), false);
});

test('addVary appends Accept without duplicates', () => {
	assert.equal(addVary('accept-encoding', 'Accept', 'Accept-Encoding'), 'accept-encoding, Accept');
	assert.equal(addVary(null, 'Accept', 'Accept-Encoding'), 'Accept, Accept-Encoding');
	assert.equal(addVary('*', 'Accept'), '*');
});

test('404 markdown links to the recovery entry points', () => {
	const md = notFoundMarkdown('https://arriqaaq.com', '/nope/');
	for (const l of ['/llms.txt', '/sitemap.xml', '/articles/', '/courses/']) assert.ok(md.includes(l));
	assert.match(md, /^# 404/);
});

test('middleware: markdown request gets Vary and markdown 404', async () => {
	const { onRequest } = await import('../functions/_middleware.js');
	const assets = { fetch: async () => new Response('nf', { status: 404 }) };
	const mk = (accept) =>
		onRequest({
			request: new Request('https://arriqaaq.com/nope/', { headers: { accept } }),
			env: { ASSETS: assets },
			next: async () => new Response('<h1>x</h1>', { status: 404, headers: { vary: 'accept-encoding' } })
		});
	const md = await mk('text/markdown');
	assert.equal(md.status, 404);
	assert.match(md.headers.get('content-type'), /text\/markdown/);
	assert.match(md.headers.get('vary'), /Accept/);
	assert.match(await md.text(), /llms\.txt/);
	const html = await mk('text/html');
	assert.equal(html.status, 404);
	assert.match(html.headers.get('vary'), /Accept/);
});

test('built output (when present): share card, 404 content, home JSON-LD', { skip: !existsSync('build/index.html') }, () => {
	const home = readFileSync('build/index.html', 'utf8');
	assert.match(home, /og:image" content="https:\/\/arriqaaq\.com\/og\/default\.png"/);
	assert.match(home, /twitter:card" content="summary_large_image"/);
	const ld = [...home.matchAll(/application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => JSON.parse(m[1]));
	const org = ld.find((o) => o['@type'] === 'Organization');
	assert.ok(org.url && org.description && org.sameAs.length > 0);
	assert.ok(existsSync('build/og/default.png'));
	assert.match(readFileSync('build/404.html', 'utf8'), /data-agent-404[\s\S]*llms\.txt/);
	assert.match(readFileSync('build/llms.txt', 'utf8'), /## When to use this site/);
});

import { redirectTarget } from '../functions/lib/agent.js';

test('redirectTarget maps old slugs, with or without slash and the markdown mirror', () => {
	const r = { saddzarai: 'sadd-ad-dharai' };
	assert.equal(redirectTarget('/saddzarai/', r), '/sadd-ad-dharai/');
	assert.equal(redirectTarget('/saddzarai', r), '/sadd-ad-dharai/');
	assert.equal(redirectTarget('/saddzarai/index.md', r), '/sadd-ad-dharai/index.md');
	assert.equal(redirectTarget('/saddzarai/x/', r), null);
	assert.equal(redirectTarget('/sadd-ad-dharai/', r), null);
	assert.equal(redirectTarget('/toString/', r), null);
});
