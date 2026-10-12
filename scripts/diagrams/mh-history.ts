/**
 * Diagrams for the Mustalah Hadith course, Part 1 (brief history). Free-form
 * (scripts/diagram-free.ts): a path that winds down the page, and a hub with
 * four spokes. They wear the same five palette colours as the interactive
 * timeline and works widgets in the post, so a colour means the same thing in
 * every figure: green (since the Sahabah), purple (the first works), blue
 * (the later days), pink (Ibn al-Salah and after). No amber: it reads as orange.
 * Text comes only from the course notes and "Brief History of Mustalah
 * al-Hadith". Each key is referenced from markdown as [[SVG:<key>]].
 */
import { W, svg, type Diagram } from '../diagram-kit.js';
import { node, nodeHeight, curve, pill, defs, arrow, type NodeOpts } from '../diagram-free.js';

/* ---------- The path: five steps down the page ---------- */

function historyPath(): string {
	const steps: { x: number; w: number; o: NodeOpts; link?: string }[] = [
		{ x: 0, w: 212, o: { hue: 'green', label: '01 · Since the Sahabah', title: 'Hadith written in sahifas', meta: 'As-Sahifa as-Sadiqa · As-Sahifa as-Sahiha' }, link: 'Then' },
		{ x: 148, w: 212, o: { hue: 'purple', label: '02 · The first works', title: 'Al-Risalah of al-Shafi’i', meta: 'Muslim’s introduction · al-Tirmidhi’s Al-Ilal as-Sagheer' }, link: 'Then' },
		{ x: 0, w: 212, o: { hue: 'blue', label: '03 · The later days', title: 'Books on the science itself', meta: 'al-Ramahurmuzi · al-Hakim · al-Khatib al-Baghdadi' }, link: 'Gathered by' },
		{ x: 120, w: 240, o: { hue: 'pink', label: '04 · The turning point', title: 'Ibn al-Salah', titleSize: 19, meta: 'Muqaddimah Ibn al-Salah' }, link: 'Then' },
		{ x: 0, w: 240, o: { hue: 'pink', label: '05 · After Ibn al-Salah', title: 'Nukhbat al-Fikar and Al-Bayquniyyah', meta: 'Ibn Hajar · al-Bayquni' } }
	];
	const GAP = 62;
	let out = defs;
	let y = 0;
	let prev: { cx: number; bottom: number } | null = null;
	steps.forEach((s, i) => {
		const h = nodeHeight(s.w, s.o);
		const cx = s.x + s.w / 2;
		if (prev) {
			out += curve(prev.cx, prev.bottom, cx, y);
			out += pill((prev.cx + cx) / 2, (prev.bottom + y) / 2, steps[i - 1].link!);
		}
		out += node(s.x, y, s.w, s.o, h).svg;
		prev = { cx, bottom: y + h };
		y += h + GAP;
	});
	return svg(y - GAP, out);
}

/* ---------- The hub: the books around Ibn al-Salah ---------- */

function salahHub(): string {
	const half = 156;
	const hubW = 196;
	const topY = 0;
	const top: NodeOpts[] = [
		{ hue: 'purple', label: 'Abridgments', title: '7 works', meta: 'al-Nawawi to al-Bulqini' },
		{ hue: 'blue', label: 'Commentaries', title: '3 modern', meta: 'Shakir · Abdul Hameed · al-Ethiopee' }
	];
	const bottom: NodeOpts[] = [
		{ hue: 'green', label: 'Poems', title: '4 works', meta: 'al-Iraqi · al-Sakhawi · al-Suyuti · al-Tarmasi' },
		{ hue: 'pink', label: 'Critical notes', title: '3 works', meta: 'al-Zarkashi · al-Iraqi · Ibn Hajar' }
	];
	const rowH = (xs: NodeOpts[]) => Math.max(...xs.map((o) => nodeHeight(half, o)));
	const topH = rowH(top);
	const botH = rowH(bottom);
	const hubO: NodeOpts = { hue: 'ink', label: 'The turning point', title: 'Muqaddimah Ibn al-Salah', titleSize: 16 };
	const hubH = nodeHeight(hubW, hubO);
	const gap = 56;
	const hubY = topH + gap;
	const botY = hubY + hubH + gap;
	const hubX = (W - hubW) / 2;
	let out = defs;
	// spokes first, so the nodes sit on top of the line ends
	out += arrow(W * 0.28, topH, hubX + 28, hubY, { head: false });
	out += arrow(W * 0.72, topH, hubX + hubW - 28, hubY, { head: false });
	out += arrow(hubX + 28, hubY + hubH, W * 0.28, botY, { head: false });
	out += arrow(hubX + hubW - 28, hubY + hubH, W * 0.72, botY, { head: false });
	out += node(0, topY, half, top[0], topH).svg + node(W - half, topY, half, top[1], topH).svg;
	out += node(hubX, hubY, hubW, hubO, hubH).svg;
	out += node(0, botY, half, bottom[0], botH).svg + node(W - half, botY, half, bottom[1], botH).svg;
	return svg(botY + botH, out);
}

export const diagrams: Record<string, Diagram> = {
	'mh-history-map': {
		title: 'How the science of hadith terminology was written down, in five steps',
		type: 'svg',
		body: historyPath()
	},
	'mh-salah-hub': {
		title: 'The kinds of books written around Muqaddimah Ibn al-Salah',
		type: 'svg',
		body: salahHub()
	}
};
