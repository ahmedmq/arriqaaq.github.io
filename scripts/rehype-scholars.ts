/**
 * rehype plugin: in Mustalah Hadith posts, wraps the first mention of each
 * scholar in every h2 section in <span class="sch" data-sch="id">, so the
 * page can open a scholar card on tap (src/lib/components/reading/
 * ScholarCards.svelte). The text itself is not changed, and without
 * JavaScript the span is plain text. Headings, links, quotes, figures,
 * widgets and Pause and check boxes are left alone.
 * Data and matching: src/lib/data/scholars.ts.
 */
import { scholarPattern, matchedScholar } from '../src/lib/data/scholars.js';

type Node = { type: string; tagName?: string; value?: string; properties?: Record<string, any>; children?: Node[] };

const SKIP_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'code', 'pre', 'figure', 'blockquote', 'aside', 'svg', 'button', 'summary', 'details', 'script', 'style']);

function skip(n: Node): boolean {
	if (n.type !== 'element') return false;
	if (SKIP_TAGS.has(n.tagName!)) return true;
	const p = n.properties ?? {};
	const cls = ([] as string[]).concat(p.className ?? []);
	return 'dataWidget' in p || cls.includes('wd-static') || cls.includes('fig-widget');
}

export default function rehypeScholars(opts: { enabled?: boolean } = {}) {
	return (tree: Node) => {
		if (!opts.enabled) return;
		let seen = new Set<string>();

		const walk = (node: Node) => {
			if (!node.children) return;
			const out: Node[] = [];
			for (const child of node.children) {
				if (child.type === 'element' && child.tagName === 'h2') seen = new Set();
				if (child.type === 'text' && child.value) {
					out.push(...split(child.value));
					continue;
				}
				if (!skip(child)) walk(child);
				out.push(child);
			}
			node.children = out;
		};

		const split = (text: string): Node[] => {
			const re = scholarPattern();
			const nodes: Node[] = [];
			let last = 0;
			for (const m of text.matchAll(re)) {
				const s = matchedScholar(m);
				if (!s || seen.has(s.id)) continue;
				seen.add(s.id);
				const at = m.index!;
				if (at > last) nodes.push({ type: 'text', value: text.slice(last, at) });
				nodes.push({
					type: 'element',
					tagName: 'span',
					properties: { className: ['sch'], dataSch: s.id },
					children: [{ type: 'text', value: m[0] }]
				});
				last = at + m[0].length;
			}
			if (!nodes.length) return [{ type: 'text', value: text }];
			if (last < text.length) nodes.push({ type: 'text', value: text.slice(last) });
			return nodes;
		};

		walk(tree);
	};
}
