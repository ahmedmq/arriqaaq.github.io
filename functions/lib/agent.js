/**
 * Pure helpers for the agent-readiness middleware (no Cloudflare APIs, so
 * they run under `node --test`). Not a route: it exports no onRequest*.
 */

/**
 * Parse an Accept header into [{type, q}], highest q first (stable).
 * @param {string | null | undefined} header
 */
export function parseAccept(header) {
	return String(header ?? '')
		.split(',')
		.map((part, i) => {
			const [type, ...params] = part.trim().toLowerCase().split(';');
			const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
			const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
			return { type: type.trim(), q: Number.isNaN(q) ? 1 : q, i };
		})
		.filter((a) => a.type)
		.sort((a, b) => b.q - a.q || a.i - b.i);
}

/**
 * True when the client explicitly ranks text/markdown at least as high as
 * text/html (https://acceptmarkdown.com). Wildcards never select markdown, so
 * browsers and plain `curl` keep getting HTML.
 * @param {string | null | undefined} header
 */
export function prefersMarkdown(header) {
	const accepts = parseAccept(header);
	const md = accepts.find((a) => a.type === 'text/markdown');
	if (!md || md.q === 0) return false;
	const html = accepts.find((a) => a.type === 'text/html' || a.type === 'application/xhtml+xml');
	return !html || md.q >= html.q;
}

/**
 * Add tokens to a Vary header without duplicating or dropping existing ones.
 * @param {string | null | undefined} existing
 * @param {...string} tokens
 */
export function addVary(existing, ...tokens) {
	const have = String(existing ?? '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
	if (have.includes('*')) return '*';
	for (const t of tokens) {
		if (!have.some((h) => h.toLowerCase() === t.toLowerCase())) have.push(t);
	}
	return have.join(', ');
}

/**
 * Short markdown body for 404 responses so an agent can recover.
 * @param {string} origin
 * @param {string} pathname
 */
export function notFoundMarkdown(origin, pathname) {
	return `# 404: page not found

\`${pathname}\` does not exist on arriqaaq.com. Try one of these instead:

- [Home](${origin}/): courses, subjects and the latest articles
- [All articles](${origin}/articles/)
- [Courses](${origin}/courses/)
- [llms.txt](${origin}/llms.txt): index of every page and post with summaries
- [sitemap.xml](${origin}/sitemap.xml): every URL on the site
- [llms-full.txt](${origin}/llms-full.txt): the whole site as markdown

Tip: every page has a markdown version at \`<page URL>index.md\`.
`;
}
