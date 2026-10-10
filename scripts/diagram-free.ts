/**
 * Free-form diagram primitives (DESIGN.md → Diagram language → Free-form).
 *
 * The block kit (diagram-kit.ts) draws slabs and layers. Not every idea is a
 * stack, so these draw the other shapes: rounded nodes joined by dashed
 * arrows, hubs with spokes, paths that wind down the page, dot plots.
 * Same rules apply: only palette colours at full strength, Inter for words,
 * JetBrains Mono for small uppercase labels, phone-first on a 360 canvas.
 *
 * A node is white with an ink outline, or a full palette fill with an ink
 * outline. Text on a fill follows the palette's `on` colour: white on purple
 * and blue, and also on pink, amber and green (owner rule: white on colour).
 */
import { P, wrapTo } from './diagram-kit.js';

export type Hue = 'purple' | 'blue' | 'pink' | 'amber' | 'green' | 'ink' | 'white';

const FILL: Record<Hue, string> = {
	purple: P.brandPurple,
	blue: P.blue,
	pink: P.pink,
	amber: P.amber,
	green: P.green,
	ink: P.obsidian,
	white: P.white
};
// Owner rule: text inside a colour is always white. Black on colour looks
// bad. Only a white node takes ink text.
const ON: Record<Hue, string> = {
	purple: P.white,
	blue: P.white,
	pink: P.white,
	amber: P.white,
	green: P.white,
	ink: P.white,
	white: P.ink
};

const MONO = `font-family="JetBrains Mono, ui-monospace, monospace"`;
const SANS = `font-family="Inter, system-ui, sans-serif"`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const STROKE = 1.5;

export type NodeOpts = {
	hue?: Hue;
	label?: string; // small mono uppercase line on top
	ar?: string; // Arabic line(s), Noto Naskh, right-aligned
	title: string; // the main words, Inter 600 ('' for a body-only node)
	body?: string; // a sentence or two, Inter 13 regular
	meta?: string; // small mono line(s) beneath
	tags?: string[]; // small white pills inside, at the bottom
	tab?: { text: string; hue?: Hue }; // a coloured pill straddling the top border
	r?: number; // corner radius
	align?: 'start' | 'middle';
	titleSize?: number;
	bodySize?: number;
};

const PAD = 14;
const AR = `font-family="Noto Naskh Arabic, Inter, serif"`;

/** Width of a tag pill for a given string. */
const tagW = (t: string) => Math.round(t.length * 6.3 + 20);

function tagRows(tags: string[], inner: number): string[][] {
	const rows: string[][] = [[]];
	let x = 0;
	for (const t of tags) {
		const w = tagW(t);
		if (x + w > inner && rows[rows.length - 1].length) {
			rows.push([]);
			x = 0;
		}
		rows[rows.length - 1].push(t);
		x += w + 6;
	}
	return rows;
}

/** Measure every text group of a node at width w, so it can be sized before it is drawn. */
function measure(w: number, o: NodeOpts) {
	const inner = w - PAD * 2;
	const ts = o.titleSize ?? 15;
	const bs = o.bodySize ?? 13;
	const ar = o.ar ? wrapTo(o.ar, inner, 17, 'sans') : [];
	const title = wrapTo(o.title, inner, ts, 'sans');
	const body = o.body ? wrapTo(o.body, inner, bs, 'sans') : [];
	const meta = o.meta ? wrapTo(o.meta, inner, 10.5, 'mono') : [];
	const tags = o.tags?.length ? tagRows(o.tags, inner) : [];
	let h = PAD;
	if (o.label) h += 16;
	h += ar.length * 26;
	h += title.length * Math.round(ts * 1.3);
	if (body.length) h += (title.length || ar.length ? 4 : 0) + body.length * Math.round(bs * 1.4);
	if (meta.length) h += 6 + meta.length * 15;
	if (tags.length) h += 10 + tags.length * 28 - 6;
	return { inner, ts, bs, ar, title, body, meta, tags, h: Math.ceil(h + PAD) };
}

/** Height a node needs for its text at width w. */
export function nodeHeight(w: number, o: NodeOpts): number {
	return measure(w, o).h;
}

/** The text of a node, drawn from (x, y) in a box of width w. No outline. */
function nodeText(x: number, y: number, w: number, o: NodeOpts, m = measure(w, o)): string {
	const hue = o.hue ?? 'white';
	const middle = (o.align ?? 'middle') === 'middle';
	const tx = middle ? x + w / 2 : x + PAD;
	const anchor = middle ? 'middle' : 'start';
	const ink = ON[hue];
	// White on amber is low contrast, so text on amber is always semibold.
	const fw = hue === 'amber' ? 600 : 400;
	let out = '';
	let cy = y + PAD;
	if (o.label) {
		out += `<text x="${tx}" y="${cy + 9}" text-anchor="${anchor}" ${MONO} font-size="10" font-weight="${hue === 'amber' ? 700 : 400}" letter-spacing="1" fill="${ink}">${esc(o.label.toUpperCase())}</text>`;
		cy += 16;
	}
	for (const l of m.ar) {
		out += `<text x="${x + w - PAD}" y="${cy + 18}" text-anchor="end" direction="rtl" ${AR} font-size="17" font-weight="${hue === 'amber' ? 700 : 400}" fill="${ink}">${esc(l)}</text>`;
		cy += 26;
	}
	for (const l of m.title) {
		out += `<text x="${tx}" y="${cy + m.ts}" text-anchor="${anchor}" ${SANS} font-size="${m.ts}" font-weight="600" letter-spacing="-0.2" fill="${ink}">${esc(l)}</text>`;
		cy += Math.round(m.ts * 1.3);
	}
	if (m.body.length) {
		if (m.title.length || m.ar.length) cy += 4;
		for (const l of m.body) {
			out += `<text x="${tx}" y="${cy + m.bs}" text-anchor="${anchor}" ${SANS} font-size="${m.bs}" font-weight="${hue === 'amber' ? 600 : fw}" fill="${ink}">${esc(l)}</text>`;
			cy += Math.round(m.bs * 1.4);
		}
	}
	if (m.meta.length) {
		cy += 6;
		for (const l of m.meta) {
			out += `<text x="${tx}" y="${cy + 10}" text-anchor="${anchor}" ${MONO} font-size="10.5" font-weight="${hue === 'amber' ? 700 : 400}" fill="${ink}">${esc(l)}</text>`;
			cy += 15;
		}
	}
	if (m.tags.length) {
		cy += 10;
		for (const row of m.tags) {
			const total = row.reduce((a, t) => a + tagW(t) + 6, -6);
			let tx2 = middle ? x + w / 2 - total / 2 : x + PAD;
			for (const t of row) {
				const tw = tagW(t);
				out += `<rect x="${tx2}" y="${cy}" width="${tw}" height="22" rx="11" fill="${P.white}" stroke="${P.ink}" stroke-width="1"/><text x="${tx2 + tw / 2}" y="${cy + 14.5}" text-anchor="middle" ${MONO} font-size="10.5" fill="${P.ink}">${esc(t)}</text>`;
				tx2 += tw + 6;
			}
			cy += 28;
		}
	}
	return out;
}

/** A rounded node. Returns { svg, h }. Height is derived unless `h` is given. */
export function node(x: number, y: number, w: number, o: NodeOpts, h?: number) {
	const hue = o.hue ?? 'white';
	const m = measure(w, o);
	const hh = h ?? m.h;
	let out = `<rect x="${x + STROKE / 2}" y="${y + STROKE / 2}" width="${w - STROKE}" height="${hh - STROKE}" rx="${o.r ?? 12}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="${STROKE}"/>`;
	out += nodeText(x, y, w, o, m);
	if (o.tab) out += tab(x + 14, y, o.tab.text, o.tab.hue);
	return { svg: out, h: hh };
}

/** A small coloured pill sitting on a border, left edge at x, centred on y. */
export function tab(x: number, y: number, s: string, hue: Hue = 'purple') {
	const w = Math.round(s.length * 6.4 + 22);
	return `<rect x="${x}" y="${y - 10}" width="${w}" height="20" rx="10" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="1"/><text x="${x + w / 2}" y="${y + 3.6}" text-anchor="middle" ${MONO} font-size="10" font-weight="${hue === 'amber' ? 700 : 400}" letter-spacing="0.9" fill="${ON[hue]}">${esc(s.toUpperCase())}</text>`;
}

/**
 * A circle with centred text (same options as a node). Text wraps inside the
 * circle, so keep it short. Returns the svg.
 */
export function ring(cx: number, cy: number, r: number, o: NodeOpts): string {
	const hue = o.hue ?? 'white';
	const w = r * 1.55 + PAD * 2;
	const m = measure(w, o);
	let out = `<circle cx="${cx}" cy="${cy}" r="${r - STROKE / 2}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="${STROKE}"/>`;
	out += nodeText(cx - w / 2, cy - m.h / 2, w, { ...o, align: 'middle' }, m);
	return out;
}

/** A small numbered or lettered dot, for a spine or a list. */
export function badge(cx: number, cy: number, s: string, hue: Hue = 'purple', r = 14) {
	return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="${STROKE}"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" ${MONO} font-size="11" font-weight="700" fill="${ON[hue]}">${esc(s)}</text>`;
}

/** A plain ink dot, for a junction on a spine. */
export function dot(cx: number, cy: number, r = 4, hue: Hue = 'ink') {
	return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="1"/>`;
}

/** Free text in Inter, wrapped to w. Returns { svg, h }. Ink by default; `hue` picks the on-colour. */
export function words(x: number, y: number, w: number, s: string, o: { size?: number; weight?: number; hue?: Hue; anchor?: 'start' | 'middle'; color?: string } = {}) {
	const size = o.size ?? 13;
	const lh = Math.round(size * 1.45);
	const anchor = o.anchor ?? 'start';
	const tx = anchor === 'middle' ? x + w / 2 : x;
	const fill = o.color ?? (o.hue ? ON[o.hue] : P.ink);
	const lines = wrapTo(s, w, size, 'sans');
	return {
		svg: lines.map((l, i) => `<text x="${tx}" y="${y + size + i * lh}" text-anchor="${anchor}" ${SANS} font-size="${size}" font-weight="${o.weight ?? 400}" fill="${fill}">${esc(l)}</text>`).join(''),
		h: lines.length * lh
	};
}

/** A curly brace from y1 to y2, tip pointing right of x. */
export function brace(x: number, y1: number, y2: number) {
	const m = (y1 + y2) / 2;
	return `<path d="M${x},${y1} Q${x + 9},${y1} ${x + 9},${y1 + 9} V${m - 9} Q${x + 9},${m} ${x + 18},${m} Q${x + 9},${m} ${x + 9},${m + 9} V${y2 - 9} Q${x + 9},${y2} ${x},${y2}" fill="none" stroke="${P.ink}" stroke-width="1.25"/>`;
}

/** A bar for a scale or a count: a rounded rectangle, filled. */
export function bar(x: number, y: number, w: number, h: number, hue: Hue = 'purple') {
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(8, h / 2)}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="${STROKE}"/>`;
}

/** A large outlined region (a set, a panel, a verse), white by default. */
export function region(x: number, y: number, w: number, h: number, o: { dash?: boolean; r?: number; hue?: Hue } = {}) {
	return `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="${o.r ?? 18}" fill="${FILL[o.hue ?? 'white']}" stroke="${P.ink}" stroke-width="${STROKE}"${o.dash ? ' stroke-dasharray="6 5"' : ''}/>`;
}

/** Arrowhead marker, defined once per diagram. */
export const defs = `<defs><marker id="dfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${P.ink}"/></marker></defs>`;

/** A line with an optional arrowhead; dashed by default (hifz style). */
export function arrow(x1: number, y1: number, x2: number, y2: number, o: { dash?: boolean; head?: boolean } = {}) {
	return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${P.ink}" stroke-width="1.25"${o.dash === false ? '' : ' stroke-dasharray="5 4"'}${o.head === false ? '' : ' marker-end="url(#dfa)"'}/>`;
}

/** A smooth S-curve from (x1,y1) down to (x2,y2), dashed, with an arrowhead. */
export function curve(x1: number, y1: number, x2: number, y2: number, o: { dash?: boolean; head?: boolean } = {}) {
	const k = Math.max(24, (y2 - y1) / 2);
	return `<path d="M${x1},${y1} C${x1},${y1 + k} ${x2},${y2 - k} ${x2},${y2}" fill="none" stroke="${P.ink}" stroke-width="1.25"${o.dash === false ? '' : ' stroke-dasharray="5 4"'}${o.head === false ? '' : ' marker-end="url(#dfa)"'}/>`;
}

/** Like curve(), but leaves sideways: for trees that grow left to right. */
export function hcurve(x1: number, y1: number, x2: number, y2: number, o: { dash?: boolean; head?: boolean } = {}) {
	const k = Math.max(20, (x2 - x1) / 2);
	return `<path d="M${x1},${y1} C${x1 + k},${y1} ${x2 - k},${y2} ${x2},${y2}" fill="none" stroke="${P.ink}" stroke-width="1.25"${o.dash === false ? '' : ' stroke-dasharray="5 4"'}${o.head === false ? '' : ' marker-end="url(#dfa)"'}/>`;
}

/** A small label sitting on a line: a white pill with mono uppercase text. */
export function pill(cx: number, cy: number, s: string, hue: Hue = 'white') {
	const w = Math.round(s.length * 6.4 + 22);
	return `<rect x="${cx - w / 2}" y="${cy - 11}" width="${w}" height="22" rx="11" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="1"/><text x="${cx}" y="${cy + 3.6}" text-anchor="middle" ${MONO} font-size="9.5" letter-spacing="0.9" fill="${ON[hue]}">${esc(s.toUpperCase())}</text>`;
}

/** Free mono caption, uppercase. */
export function caption(x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle') {
	return `<text x="${x}" y="${y}" text-anchor="${anchor}" ${MONO} font-size="10" letter-spacing="1" fill="${P.ink2}">${esc(s.toUpperCase())}</text>`;
}

export { P };
/**
 * A tree written as an outline: each item sits at its depth, and a dashed
 * spine drops from a parent and bends into each child. Items are laid out top
 * to bottom, `gap` apart. Returns { svg, h }.
 */
export type OutlineItem = { depth: number; o: NodeOpts; gapBefore?: number };
export function outline(items: OutlineItem[], o: { width?: number; indent?: number; gap?: number; y0?: number } = {}) {
	const width = o.width ?? 360;
	const indent = o.indent ?? 28;
	const gap = o.gap ?? 20;
	let y = o.y0 ?? 0;
	const placed = items.map((it) => {
		if (it.gapBefore != null) y += it.gapBefore - gap;
		const x = it.depth * indent;
		const w = width - x;
		const h = nodeHeight(w, it.o);
		const r = { x, y, w, h, depth: it.depth, o: it.o, parent: -1 };
		y += h + gap;
		return r;
	});
	placed.forEach((c, i) => {
		for (let j = i - 1; j >= 0; j--)
			if (placed[j].depth === c.depth - 1) {
				c.parent = j;
				break;
			}
	});
	let lines = '';
	let nodes = '';
	for (const c of placed) {
		if (c.parent >= 0) {
			const p = placed[c.parent];
			const sx = p.x + 14;
			const cy = c.y + Math.min(c.h / 2, 24);
			lines += `<path d="M${sx},${p.y + p.h} V${cy - 12} Q${sx},${cy} ${sx + 12},${cy} H${c.x}" fill="none" stroke="${P.ink}" stroke-width="1.25" stroke-dasharray="5 4" marker-end="url(#dfa)"/>`;
		}
		nodes += node(c.x, c.y, c.w, c.o, c.h).svg;
	}
	return { svg: lines + nodes, h: y - gap - (o.y0 ?? 0) };
}

/**
 * Two panels side by side, compared row by row. Each panel is one outlined
 * region with a coloured header; rows are separated by dashed rules and share
 * a height so they line up across the panels.
 */
export type CompareHead = { title: string; label?: string; meta?: string; hue: Hue };
export function compare(left: CompareHead, right: CompareHead, rows: [string, string][], o: { size?: number; y0?: number } = {}) {
	const GAPX = 12;
	const pw = (360 - GAPX) / 2;
	const size = o.size ?? 12.5;
	const y0 = o.y0 ?? 0;
	const headO = (s: CompareHead): NodeOpts => ({ hue: s.hue, label: s.label, title: s.title, meta: s.meta, titleSize: 16 });
	const hh = Math.max(nodeHeight(pw, headO(left)), nodeHeight(pw, headO(right)));
	const rh = rows.map(([l, r]) => Math.max(words(0, 0, pw - 28, l, { size }).h, words(0, 0, pw - 28, r, { size }).h) + 26);
	const total = hh + rh.reduce((a, b) => a + b, 0);
	const rx = pw + GAPX;
	let out = region(0, y0, pw, total, { r: 16 }) + region(rx, y0, pw, total, { r: 16 });
	// The header is drawn 16px too tall, then the extra is covered in white, so
	// only its top corners are round.
	out += node(0, y0, pw, headO(left), hh + 16).svg + node(rx, y0, pw, headO(right), hh + 16).svg;
	out += `<rect x="1.5" y="${y0 + hh}" width="${pw - 3}" height="17" fill="${P.white}"/><rect x="${rx + 1.5}" y="${y0 + hh}" width="${pw - 3}" height="17" fill="${P.white}"/>`;
	out += `<line x1="0" y1="${y0 + hh}" x2="${pw}" y2="${y0 + hh}" stroke="${P.ink}" stroke-width="${STROKE}"/><line x1="${rx}" y1="${y0 + hh}" x2="${rx + pw}" y2="${y0 + hh}" stroke="${P.ink}" stroke-width="${STROKE}"/>`;
	let y = y0 + hh;
	rows.forEach(([l, r], i) => {
		if (i > 0) out += `<line x1="14" y1="${y}" x2="${pw - 14}" y2="${y}" stroke="${P.ink}" stroke-width="1" stroke-dasharray="3 4"/><line x1="${rx + 14}" y1="${y}" x2="${rx + pw - 14}" y2="${y}" stroke="${P.ink}" stroke-width="1" stroke-dasharray="3 4"/>`;
		out += words(14, y + 13, pw - 28, l, { size }).svg + words(rx + 14, y + 13, pw - 28, r, { size }).svg;
		y += rh[i];
	});
	return { svg: out, h: total };
}

/**
 * Several lines gather into one labelled point, then spread out again. Points
 * are [x, y]; (cx, cy) is the pill. Leave `label` out for a plain meeting
 * point. Lines in carry no head; lines out carry one.
 */
export function funnel(srcs: [number, number][], dsts: [number, number][], cx: number, cy: number, label?: string, hue: Hue = 'white') {
	const a = label ? cy - 13 : cy;
	const b = label ? cy + 13 : cy;
	let out = '';
	for (const [x, y] of srcs) out += x === cx ? arrow(x, y, cx, a, { head: false }) : curve(x, y, cx, a, { head: false });
	for (const [x, y] of dsts) out += x === cx ? arrow(cx, b, x, y) : curve(cx, b, x, y);
	if (label) out += pill(cx, cy, label, hue);
	return out;
}
