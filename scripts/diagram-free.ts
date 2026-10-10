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
 * and blue, and also on pink and green (owner rule: white on colour).
 */
import { P, wrapTo } from './diagram-kit.js';

export type Hue = 'purple' | 'blue' | 'pink' | 'green' | 'ink' | 'white'; // no amber: it reads as orange

const FILL: Record<Hue, string> = {
	purple: P.brandPurple,
	blue: P.blue,
	pink: P.pink,
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
	title: string; // the main words, Inter 600
	meta?: string; // small mono line(s) beneath
	r?: number; // corner radius
	align?: 'start' | 'middle';
	titleSize?: number;
};

/** Height a node needs for its text at width w. */
export function nodeHeight(w: number, o: NodeOpts): number {
	const pad = 14;
	const inner = w - pad * 2;
	const ts = o.titleSize ?? 15;
	let h = pad;
	if (o.label) h += 16;
	h += wrapTo(o.title, inner, ts, 'sans').length * Math.round(ts * 1.3);
	if (o.meta) h += 6 + wrapTo(o.meta, inner, 10.5, 'mono').length * 15;
	return Math.ceil(h + pad);
}

/** A rounded node. Returns { svg, h }. Height is derived unless `h` is given. */
export function node(x: number, y: number, w: number, o: NodeOpts, h?: number) {
	const hue = o.hue ?? 'white';
	const pad = 14;
	const inner = w - pad * 2;
	const ts = o.titleSize ?? 15;
	const hh = h ?? nodeHeight(w, o);
	const middle = (o.align ?? 'middle') === 'middle';
	const tx = middle ? x + w / 2 : x + pad;
	const anchor = middle ? 'middle' : 'start';
	const ink = ON[hue];
	let out = `<rect x="${x + STROKE / 2}" y="${y + STROKE / 2}" width="${w - STROKE}" height="${hh - STROKE}" rx="${o.r ?? 12}" fill="${FILL[hue]}" stroke="${P.ink}" stroke-width="${STROKE}"/>`;
	let cy = y + pad;
	if (o.label) {
		out += `<text x="${tx}" y="${cy + 9}" text-anchor="${anchor}" ${MONO} font-size="10" letter-spacing="1" fill="${ink}">${esc(o.label.toUpperCase())}</text>`;
		cy += 16;
	}
	for (const l of wrapTo(o.title, inner, ts, 'sans')) {
		out += `<text x="${tx}" y="${cy + ts}" text-anchor="${anchor}" ${SANS} font-size="${ts}" font-weight="600" letter-spacing="-0.2" fill="${ink}">${esc(l)}</text>`;
		cy += Math.round(ts * 1.3);
	}
	if (o.meta) {
		cy += 6;
		for (const l of wrapTo(o.meta, inner, 10.5, 'mono')) {
			out += `<text x="${tx}" y="${cy + 10}" text-anchor="${anchor}" ${MONO} font-size="10.5" fill="${ink}">${esc(l)}</text>`;
			cy += 15;
		}
	}
	return { svg: out, h: hh };
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
