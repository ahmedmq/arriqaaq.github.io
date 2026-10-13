/**
 * rehype plugin: in Mustalah Hadith posts, wraps the first mention of each
 * scholar in every h2 section in <span class="sch" data-sch="id">, and of
 * each glossary term in <span class="trm" data-term="id">, so the page can
 * open a card on tap (src/lib/components/reading/ReferenceCards.svelte). The text itself is not changed, and without
 * JavaScript the span is plain text. Headings, links, quotes, figures,
 * widgets and Pause and check boxes are left alone.
 * Data and matching: src/lib/data/scholars.ts and src/lib/data/glossary.ts.
 */
import { scholarPattern, matchedScholar } from '../src/lib/data/scholars.js';
import { termPattern, matchedTerm } from '../src/lib/data/glossary.js';

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
			// Scholars and terms, in text order; a match inside an earlier one is skipped.
			const found: { at: number; text: string; key: string; props: Record<string, string | string[]> }[] = [];
			for (const m of text.matchAll(scholarPattern())) {
				const s = matchedScholar(m);
				if (s) found.push({ at: m.index!, text: m[0], key: `s:${s.id}`, props: { className: ['sch'], dataSch: s.id } });
			}
			for (const m of text.matchAll(termPattern())) {
				const t = matchedTerm(m);
				if (t) found.push({ at: m.index!, text: m[0], key: `t:${t.id}`, props: { className: ['trm'], dataTerm: t.id } });
			}
			found.sort((a, b) => a.at - b.at);
			const nodes: Node[] = [];
			let last = 0;
			for (const f of found) {
				if (f.at < last || seen.has(f.key)) continue;
				seen.add(f.key);
				if (f.at > last) nodes.push({ type: 'text', value: text.slice(last, f.at) });
				nodes.push({ type: 'element', tagName: 'span', properties: f.props, children: [{ type: 'text', value: f.text }] });
				last = f.at + f.text.length;
			}
			if (!nodes.length) return [{ type: 'text', value: text }];
			if (last < text.length) nodes.push({ type: 'text', value: text.slice(last) });
			return nodes;
		};

		walk(tree);
	};
}
