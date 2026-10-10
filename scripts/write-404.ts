/**
 * Post-build: give build/404.html real, crawlable content. adapter-static's
 * fallback is an empty app shell; GitHub Pages serves it with HTTP 404, so
 * agents landing on a dead URL would see nothing. We inject a short recovery
 * block (links to home, sitemap, llms.txt) and a meta robots noindex. The
 * client router replaces it with the styled error page for browsers.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.cwd(), 'build/404.html');
const html = readFileSync(file, 'utf8');
if (html.includes('data-agent-404')) process.exit(0);

const block = `<main data-agent-404>
<h1>404: page not found</h1>
<p>This page does not exist on Arriqaaq. Try one of these:</p>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/articles/">All articles</a></li>
<li><a href="/courses/">Courses</a></li>
<li><a href="/llms.txt">llms.txt</a>, an index of every page and post</li>
<li><a href="/sitemap.xml">sitemap.xml</a>, every URL on the site</li>
</ul>
</main>`;

const out = html
	.replace('<head>', '<head>\n\t\t<meta name="robots" content="noindex" />\n\t\t<title>404: page not found | Arriqaaq</title>')
	.replace(/(<div style="display: contents">)/, `$1${block}`);
if (out === html) throw new Error('write-404: could not find insertion points in build/404.html');
writeFileSync(file, out);
console.log('build/404.html: added agent recovery content');
