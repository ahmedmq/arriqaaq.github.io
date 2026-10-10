/**
 * Diagram kit: the Arriqaaq diagram language (DESIGN.md → "Diagram
 * language"). Modelled on SurrealDB's agent-memory deep-dive diagram ("The
 * six parts of an agentic system") and the hifz context-layer deck. Values
 * below were read from surrealdb.com's computed styles.
 *
 * The look, in one paragraph: diagrams are ONE cohesive structure, not a
 * list of cards. Rectangular blocks with square corners sit 8px apart,
 * forming slabs and layers. Context blocks are light lavender; the layers
 * that matter are solid SurrealDB purple, darkening toward the focus. Every
 * block can carry a small numbered mono label ("3 THE CONTEXT LAYER"), a
 * content line, and a meta line or tags. Relationships are thin grey lines
 * ending in a small diamond, labelled by a dark obsidian chip ("CAPTURE").
 * A group of blocks is named by one purple sans label ("AGENT MEMORY").
 * Pink is the single highlight. Blue, amber and green are only for a
 * diagram that genuinely needs more categories than purple and pink.
 *
 * Phone-first: canvas W = 360. Prefer 2-column slabs and full-width layers
 * over long single-file stacks. Keep text short: a label, a line, a meta.
 */

export const W = 360;
export const GAP = 8; // space between blocks (SurrealDB)
export const PAD_X = 16; // block padding (SurrealDB 14px 16px)
export const PAD_Y = 14;

/** Colours. Purple ramp and lavender are SurrealDB's exact diagram values. */
export const P = {
	// SurrealDB purple ramp: darkest = the focus layer
	purple0: '#5b1bdc',
	purple1: '#6a2ce4',
	purple2: '#7c48e8',
	purple3: '#8b5cec',
	brandPurple: '#9800ff', // site brand purple: group labels, small accents
	pink: '#ff00a0', // the single highlight
	// supporting palette, only when more categories are genuinely needed
	blue: '#0066ff',
	amber: '#ffbe00',
	green: '#00c25a',
	// neutrals
	lavender: '#ebe9f5', // context block (SurrealDB)
	obsidian: '#242132', // chips (SurrealDB)
	ink: '#0d0c13',
	ink2: '#45434f',
	label: '#706d8f', // mono label on light blocks (SurrealDB)
	line: '#b6b3c9', // connectors
	white: '#ffffff',
	// legacy names used by older batch code
	purple: '#6a2ce4',
	ink3: '#706d8f',
	surface: '#ebe9f5'
} as const;

const MONO = `font-family="JetBrains Mono, ui-monospace, monospace"`;
const SANS = `font-family="Inter, system-ui, sans-serif"`;

export type Tone =
	| 'light' // lavender context block, ink text
	| 'p0'
	| 'p1'
	| 'p2'
	| 'p3' // purple ramp, white text
	| 'pink' // highlight fill, ink text: rare, prefer accent: true on a light block
	| 'blue' // white text
	| 'amber' // ink text
	| 'green' // ink text
	| 'ink' // obsidian, white text
	| 'outline'; // white with hairline, ink text (rare: "empty" or contrast cases)

const FILL: Record<Tone, string> = {
	light: P.lavender,
	p0: P.purple0,
	p1: P.purple1,
	p2: P.purple2,
	p3: P.purple3,
	pink: P.pink,
	blue: P.blue,
	amber: P.amber,
	green: P.green,
	ink: P.obsidian,
	outline: P.white
};
const DARK = new Set<Tone>(['p0', 'p1', 'p2', 'p3', 'blue', 'ink']);
const fg = (t: Tone) => (DARK.has(t) ? P.white : P.ink);
const labelColor = (t: Tone) => (DARK.has(t) ? 'rgba(255,255,255,0.8)' : P.label);
const metaColor = (t: Tone) => (DARK.has(t) ? 'rgba(255,255,255,0.75)' : P.ink2);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Average glyph widths in em: mono is fixed, Inter is narrower. */
const EM = { mono: 0.6, sans: 0.54 };

/** Greedy word wrap for a given text width (no padding applied). */
export function wrapTo(text: string, width: number, size: number, face: 'mono' | 'sans' = 'mono'): string[] {
	const budget = Math.max(4, Math.floor(width / (EM[face] * size)));
	const lines: string[] = [];
	let cur = '';
	for (const w of text.split(/\s+/).filter(Boolean)) {
		if (!cur) cur = w;
		else if ((cur + ' ' + w).length <= budget) cur += ' ' + w;
		else {
			lines.push(cur);
			cur = w;
		}
	}
	if (cur) lines.push(cur);
	return lines;
}

/** Back-compat: wrap for a box of `width` including padding. */
export function wrap(text: string, width: number, size = 13): string[] {
	return wrapTo(text, width - PAD_X * 2, size, 'sans');
}

// Type scale (viewBox px, rendered about 1:1 on a phone).
const T = {
	label: { size: 10.5, lh: 15, track: 0.8 }, // mono uppercase
	content: { size: 13, lh: 18.5 }, // mono
	body: { size: 13, lh: 19 }, // sans, for longer explanations
	meta: { size: 11.5, lh: 16, track: 0.4 } // mono
};

export type BlockOpts = {
	tone?: Tone;
	n?: number | string; // number shown before the label: "3 THE CONTEXT LAYER"
	label?: string; // small mono uppercase label
	content?: string; // main line(s), mono 13
	body?: string; // longer explanation, sans 13 (use sparingly)
	meta?: string; // mono 11.5 line at the bottom, e.g. "gathers · filters · packages"
	accent?: boolean; // light blocks only: label and meta in pink (the highlight without a loud fill)
	tags?: string[]; // little rectangles at the bottom (SurrealDB storage tags)
	h?: number; // force height (to align a row)
	align?: 'start' | 'middle';
	contentFace?: 'mono' | 'sans';
};

/** Height a block needs, so rows can be aligned before drawing. */
export function blockHeight(w: number, o: BlockOpts): number {
	const inner = w - PAD_X * 2;
	let h = PAD_Y;
	const face = o.contentFace ?? 'mono';
	if (o.label || o.n != null) h += T.label.lh + 4;
	if (o.content) h += wrapTo(o.content, inner, T.content.size, face).length * T.content.lh;
	if (o.body) h += (o.content ? 6 : 0) + wrapTo(o.body, inner, T.body.size, 'sans').length * T.body.lh;
	if (o.meta) h += 10 + wrapTo(o.meta, inner, T.meta.size, 'mono').length * T.meta.lh;
	if (o.tags?.length) h += 12 + tagRows(o.tags, inner).length * 36;
	return Math.ceil(h + PAD_Y);
}

function tagRows(tags: string[], inner: number): string[][] {
	const rows: string[][] = [[]];
	let x = 0;
	for (const t of tags) {
		const w = tagWidth(t);
		if (x + w > inner && rows[rows.length - 1].length) {
			rows.push([]);
			x = 0;
		}
		rows[rows.length - 1].push(t);
		x += w + 6;
	}
	return rows;
}
const tagWidth = (t: string) => Math.round(t.length * EM.mono * T.meta.size + 28);

/** The core primitive: a square-cornered block. Returns { svg, h }. */
export function block(x: number, y: number, w: number, o: BlockOpts) {
	const tone = o.tone ?? 'light';
	const h = o.h ?? blockHeight(w, o);
	const inner = w - PAD_X * 2;
	const align = o.align ?? 'start';
	const tx = align === 'middle' ? x + w / 2 : x + PAD_X;
	const anchor = align === 'middle' ? 'middle' : 'start';
	const face = o.contentFace ?? 'mono';
	let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${FILL[tone]}"${tone === 'outline' ? ` stroke="${P.line}" stroke-width="1"` : ''}/>`;
	let cy = y + PAD_Y;
	const accentInk = o.accent && !DARK.has(tone) ? '#e3008f' : null;
	if (o.label || o.n != null) {
		const lab = [o.n != null ? String(o.n) : '', o.label ?? ''].filter(Boolean).join(' ');
		out += `<text x="${tx}" y="${cy + 10}" text-anchor="${anchor}" ${MONO} font-size="${T.label.size}" letter-spacing="${T.label.track}" fill="${accentInk ?? (tone === 'pink' ? P.ink : labelColor(tone))}">${esc(lab.toUpperCase())}</text>`;
		cy += T.label.lh + 4;
	}
	if (o.content) {
		for (const l of wrapTo(o.content, inner, T.content.size, face)) {
			out += `<text x="${tx}" y="${cy + 13}" text-anchor="${anchor}" ${face === 'mono' ? MONO : SANS} font-size="${T.content.size}" fill="${fg(tone)}">${esc(l)}</text>`;
			cy += T.content.lh;
		}
	}
	if (o.body) {
		if (o.content) cy += 6;
		for (const l of wrapTo(o.body, inner, T.body.size, 'sans')) {
			out += `<text x="${tx}" y="${cy + 13}" text-anchor="${anchor}" ${SANS} font-size="${T.body.size}" fill="${metaColor(tone)}">${esc(l)}</text>`;
			cy += T.body.lh;
		}
	}
	if (o.meta) {
		cy += 10;
		for (const l of wrapTo(o.meta, inner, T.meta.size, 'mono')) {
			out += `<text x="${tx}" y="${cy + 11}" text-anchor="${anchor}" ${MONO} font-size="${T.meta.size}" letter-spacing="${T.meta.track}" fill="${accentInk ?? metaColor(tone)}">${esc(l)}</text>`;
			cy += T.meta.lh;
		}
	}
	if (o.tags?.length) {
		cy += 12;
		for (const row of tagRows(o.tags, inner)) {
			let tx2 = x + PAD_X;
			for (const t of row) {
				const tw = tagWidth(t);
				const bg = DARK.has(tone) ? 'rgba(255,255,255,0.18)' : P.white;
				out += `<rect x="${tx2}" y="${cy}" width="${tw}" height="30" fill="${bg}"/><text x="${tx2 + 14}" y="${cy + 19}" ${MONO} font-size="${T.meta.size}" letter-spacing="${T.meta.track}" fill="${fg(tone)}">${esc(t)}</text>`;
				tx2 += tw + 6;
			}
			cy += 36;
		}
	}
	return { svg: out, h };
}

/**
 * A row of blocks sharing one height (SurrealDB's 2-up slabs). Widths are
 * split evenly across `w` with GAP between. Returns { svg, h }.
 */
export function row(x: number, y: number, w: number, items: BlockOpts[], weights?: number[]) {
	const n = items.length;
	const ws = weights ?? items.map(() => 1);
	const total = ws.reduce((a, b) => a + b, 0);
	const avail = w - GAP * (n - 1);
	const widths = ws.map((k) => Math.floor((avail * k) / total));
	const h = Math.max(...items.map((it, i) => blockHeight(widths[i], it)));
	let out = '';
	let cx = x;
	items.forEach((it, i) => {
		out += block(cx, y, widths[i], { ...it, h }).svg;
		cx += widths[i] + GAP;
	});
	return { svg: out, h, widths };
}

/** Obsidian chip with mono uppercase label, centred on cx (SurrealDB "CAPTURE"). */
export function chip(cx: number, y: number, label: string, tone: 'ink' | 'pink' | 'purple' = 'ink') {
	const w = Math.round(label.length * EM.mono * T.label.size + 32);
	const fill = tone === 'pink' ? P.pink : tone === 'purple' ? P.purple0 : P.obsidian;
	const color = tone === 'pink' ? P.ink : P.white;
	return {
		svg: `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="30" fill="${fill}"/><text x="${cx}" y="${y + 19}" text-anchor="middle" ${MONO} font-size="${T.label.size}" letter-spacing="${T.label.track}" fill="${color}">${esc(label.toUpperCase())}</text>`,
		w,
		h: 30
	};
}

/** Thin connector ending in a small diamond (SurrealDB). Vertical or horizontal. */
export function connector(x1: number, y1: number, x2: number, y2: number, o: { diamond?: boolean; dash?: boolean; color?: string } = {}) {
	const c = o.color ?? P.line;
	let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1"${o.dash ? ' stroke-dasharray="4 4"' : ''}/>`;
	if (o.diamond !== false) out += `<path d="M${x2},${y2 - 5} L${x2 + 5},${y2} L${x2},${y2 + 5} L${x2 - 5},${y2} Z" fill="${c}"/>`;
	return out;
}

/** Elbow connector: down from (x1,y1), across, then down to (x2,y2). */
export function elbow(x1: number, y1: number, x2: number, y2: number, color: string = P.line): string {
	const my = (y1 + y2) / 2;
	return `<path d="M${x1},${y1} V${my} H${x2} V${y2}" fill="none" stroke="${color}" stroke-width="1"/>`;
}

/** Group label: purple sans, names the blocks below it (SurrealDB "AGENT MEMORY"). */
export function group(x: number, y: number, s: string, o: { color?: string; anchor?: 'start' | 'middle' } = {}) {
	return {
		svg: `<text x="${x}" y="${y + 14}" text-anchor="${o.anchor ?? 'start'}" ${SANS} font-size="14" font-weight="500" letter-spacing="0.6" fill="${o.color ?? P.brandPurple}">${esc(s.toUpperCase())}</text>`,
		h: 22
	};
}

/** Free text. face 'mono' (default, labels and short lines) or 'sans'. */
export function text(x: number, y: number, s: string, o: { size?: number; weight?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; mono?: boolean; sans?: boolean; tracking?: number; upper?: boolean } = {}): string {
	const size = o.size ?? 13;
	const face = o.sans ? SANS : MONO;
	const tr = o.tracking != null ? ` letter-spacing="${o.tracking}"` : '';
	const str = o.upper ? s.toUpperCase() : s;
	return `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'start'}" ${face} font-size="${size}" font-weight="${o.weight ?? 400}" fill="${o.color ?? P.ink}"${tr}>${esc(str)}</text>`;
}

/** Wrapped paragraph (sans); returns { svg, h }. */
export function para(x: number, y: number, w: number, s: string, o: { size?: number; color?: string; anchor?: 'start' | 'middle' } = {}) {
	const size = o.size ?? 13;
	const lh = Math.round(size * 1.45);
	const lines = wrapTo(s, w, size, 'sans');
	const tx = o.anchor === 'middle' ? x + w / 2 : x;
	return {
		svg: lines.map((l, i) => `<text x="${tx}" y="${y + size + i * lh}" text-anchor="${o.anchor ?? 'start'}" ${SANS} font-size="${size}" fill="${o.color ?? P.ink2}">${esc(l)}</text>`).join(''),
		h: lines.length * lh
	};
}

/** Wrap a body in an <svg>. Height is required. Width defaults to W. */
export function svg(h: number, body: string, w: number = W): string {
	return `<svg class="dgm-svg" viewBox="0 0 ${w} ${Math.ceil(h)}" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
}

/** Vertical stack: lays items out top to bottom with `gap` (default GAP). */
export function stack(y0: number, gap: number, items: ((y: number) => { svg: string; h: number })[]) {
	let y = y0;
	let out = '';
	for (const it of items) {
		const r = it(y);
		out += r.svg;
		y += r.h + gap;
	}
	return { svg: out, y: y - gap };
}

export type Diagram = { title: string; type: 'svg' | 'html'; body: string; wide?: boolean };

// ---------------------------------------------------------------------------
// Back-compat shims for batch code written against the first kit. They map
// the old API onto the new language so nothing breaks while batches are
// re-laid out. New code should use block/row/chip/connector/group.
// ---------------------------------------------------------------------------

export type Hue = 'pink' | 'purple' | 'blue' | 'amber' | 'green' | 'ink';
export type BoxOpts = { hue?: Hue; solid?: boolean; align?: 'middle' | 'start'; size?: number; h?: number; tag?: string };

const HUE_TONE: Record<Hue, Tone> = { pink: 'pink', purple: 'p1', blue: 'blue', amber: 'amber', green: 'green', ink: 'p0' };

/** @deprecated use block() */
export function box(x: number, y: number, w: number, title: string | null, body?: string, o: BoxOpts = {}) {
	const tone: Tone = o.solid ? HUE_TONE[o.hue ?? 'ink'] : 'light';
	return block(x, y, w, { tone, label: o.tag, content: title ?? undefined, body, h: o.h, align: o.align, contentFace: 'sans' });
}

/** @deprecated */
export function boxHeight(width: number, title: string | null, body?: string): number {
	return blockHeight(width, { content: title ?? undefined, body, contentFace: 'sans' });
}

/** @deprecated use chip() */
export function pill(x: number, y: number, label: string, hue: Hue = 'ink') {
	const c = chip(0, y, label, hue === 'pink' ? 'pink' : hue === 'purple' ? 'purple' : 'ink');
	return { svg: c.svg.replace(/x="(-?[\d.]+)"/g, (_, v) => `x="${+v + x + c.w / 2}"`), w: c.w };
}

/** @deprecated use connector() */
export function arrow(x1: number, y1: number, x2: number, y2: number, _hue: Hue = 'ink', dash = false): string {
	return connector(x1, y1, x2, y2, { dash });
}

/** @deprecated use connector({ diamond: false }) */
export function line(x1: number, y1: number, x2: number, y2: number, color: string = P.line, w = 1): string {
	return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}"/>`;
}

/** @deprecated use group() or text({ upper: true }) */
export function eyebrow(x: number, y: number, s: string, _hue: Hue = 'ink', anchor: 'start' | 'middle' = 'start'): string {
	return text(x, y, s, { size: T.label.size, color: P.label, anchor, tracking: T.label.track, upper: true });
}

// ---------------------------------------------------------------------------
// Responsive diagrams. A tall diagram is split into its natural SECTIONS
// (a category with its items, a table with its fields, a run of pipeline
// steps). On phones the sections stack in one 360-wide column; on desktop
// they flow into two columns (728 wide, shown at about actual size), so
// the whole structure fits in view. Reading order is kept: the left column
// holds the first half (by height), the right column the rest.
// Use it for any diagram taller than about 900px.
// ---------------------------------------------------------------------------

export type Section = (y: number) => { svg: string; h: number };

const COL_GAP = 24; // between the two desktop columns
const SEC_GAP = 16; // between sections in a column

export function responsive(sections: Section[], o: { head?: Section } = {}): string {
	const head = o.head;
	// Phone: one column.
	let y = 0;
	let mobile = '';
	if (head) {
		const r = head(0);
		mobile += r.svg;
		y = r.h + SEC_GAP;
	}
	const heights: number[] = [];
	for (const s of sections) {
		const r = s(y);
		mobile += r.svg;
		heights.push(r.h);
		y += r.h + SEC_GAP;
	}
	const mobileH = y - SEC_GAP;

	// Desktop: head spans both columns (drawn at 2x width would distort, so the
	// head is drawn once in the left column's width and centred above).
	const DW = W * 2 + COL_GAP;
	let desk = '';
	let top = 0;
	if (head) {
		const r = head(0);
		desk += `<g transform="translate(${(DW - W) / 2} 0)">${r.svg}</g>`;
		top = r.h + SEC_GAP;
	}
	const total = heights.reduce((a, b) => a + b + SEC_GAP, 0);
	let acc = 0;
	let split = sections.length;
	for (let i = 0; i < sections.length; i++) {
		if (acc + heights[i] / 2 > total / 2) {
			split = i;
			break;
		}
		acc += heights[i] + SEC_GAP;
	}
	if (split === 0) split = 1;
	const col = (from: number, to: number, x: number) => {
		let cy = top;
		let out = '';
		for (let i = from; i < to; i++) {
			const r = sections[i](cy);
			out += `<g transform="translate(${x} 0)">${r.svg}</g>`;
			cy += r.h + SEC_GAP;
		}
		return { out, h: cy - SEC_GAP };
	};
	const L = col(0, split, 0);
	const R = col(split, sections.length, W + COL_GAP);
	desk += L.out + R.out;
	const deskH = Math.max(L.h, R.h);

	return (
		`<svg class="dgm-svg dgm-m" viewBox="0 0 ${W} ${Math.ceil(mobileH)}" xmlns="http://www.w3.org/2000/svg" role="img">${mobile}</svg>` +
		`<svg class="dgm-svg dgm-d" viewBox="0 0 ${DW} ${Math.ceil(deskH)}" xmlns="http://www.w3.org/2000/svg" role="img">${desk}</svg>`
	);
}
