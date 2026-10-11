/**
 * Diagrams for batch "uf-istinbat". Free-form (scripts/diagram-free.ts): a
 * tree written as an outline with a dashed spine, a hub with four spokes, and
 * a simple fork. Palette colours at full strength: pink, purple, blue, green.
 * W = 360. Each key is referenced from markdown as [[SVG:<key>]].
 *
 * Each Mubhath keeps one colour across its overview row and its own hub. On
 * the Jumhoor tree, Mantooq is blue and Mafhoom purple; the node revealed at
 * each step is filled pink.
 */
import { W, svg, type Diagram } from '../diagram-kit.js';
import { node, nodeHeight, ring, curve, arrow, outline, defs, type NodeOpts, type Hue } from '../diagram-free.js';

/* ---------- Hanafiyyah: the five Mubhath ---------- */

const HANAFI = 'Ways of al-Istinbaat according to Hanafiyyah';

const MUBHATH: { label: string; hue: Hue; leaves: string[] }[] = [
	{ label: 'Mubhath 1', hue: 'purple', leaves: ['Dhahir', 'Nass', 'Muawwal', 'Mujmal'] },
	{ label: 'Mubhath 2', hue: 'blue', leaves: ['Al-Khafi', 'Al-Mushkil', 'Al-Mujmal', 'Al-Mutashabih'] },
	{ label: 'Mubhath 3', hue: 'pink', leaves: ['Al-Haqiqah', 'Al-Majaz', 'Al-Sareeh', 'Al-Kinayah'] },
	{ label: 'Mubhath 4', hue: 'green', leaves: ['Ibaarah al-Nass', 'Isharah al-Nass', 'Iqtida al-Nass', 'Dalalah al-Nass'] },
	{ label: 'Mubhath 5', hue: 'ink', leaves: ['Mafhoom al-Sifah', 'Mafhoom al-Shart', 'Mafhoom al-Ghayah', 'Mafhoom al-Adad'] }
];

/** Overview: the root, then the five Mubhath on a spine, each with its four as tags. */
function hanafiOverview(): string {
	const o = outline(
		[
			{ depth: 0, o: { hue: 'white', label: 'Ways of al-Istinbaat', title: HANAFI, titleSize: 15, meta: 'five Mubhath · four categories each' } },
			...MUBHATH.map((m, i) => ({
				depth: 1,
				o: { hue: m.hue, align: 'start' as const, label: `${i + 1} · Mubhath`, title: '', tags: m.leaves }
			}))
		],
		{ indent: 24, gap: 18 }
	);
	return svg(o.h, defs + o.svg);
}

/** One Mubhath on its own: a hub, and its four categories on four spokes. */
function mubhath(i: number): string {
	const m = MUBHATH[i];
	const lw = 150;
	const leaf = (t: string): NodeOpts => ({ hue: 'white', title: t, titleSize: 16 });
	const hs = m.leaves.map((t) => nodeHeight(lw, leaf(t)));
	const row1 = Math.max(hs[0], hs[1]);
	const row2 = Math.max(hs[2], hs[3]);
	const R = 62;
	const cy = row1 + 26 + R;
	const y2 = cy + R + 26;
	const cx = W / 2;
	const lx = [0, W - lw, 0, W - lw];
	const ly = [0, 0, y2, y2];
	const lh = [row1, row1, row2, row2];
	let out = defs;
	m.leaves.forEach((_, k) => {
		const px = lx[k] + lw / 2;
		const py = k < 2 ? ly[k] + lh[k] : ly[k];
		out += arrow(cx, cy, px, py, { head: false });
	});
	out += ring(cx, cy, R, { hue: m.hue, label: 'Hanafiyyah', title: m.label, titleSize: 17, meta: 'four categories' });
	m.leaves.forEach((t, k) => {
		out += node(lx[k], ly[k], lw, leaf(t), lh[k]).svg;
	});
	return svg(y2 + row2, out);
}

/* ---------- Overview of both approaches ---------- */

function forkOver(root: NodeOpts, kids: NodeOpts[]): string {
	const rw = 300;
	const rh = nodeHeight(rw, root);
	const kw = 168;
	const kh = Math.max(...kids.map((k) => nodeHeight(kw, k)));
	const y = rh + 58;
	let out = defs;
	out += curve(W / 2 - 60, rh, kw / 2, y) + curve(W / 2 + 60, rh, W - kw / 2, y);
	out += node((W - rw) / 2, 0, rw, root, rh).svg;
	out += node(0, y, kw, kids[0], kh).svg + node(W - kw, y, kw, kids[1], kh).svg;
	return svg(y + kh, out);
}

const JUMHOOR = 'Ways of al-Istinbaat according to Jumhoor (Majority)';

const istinbaatOverview = (): string =>
	forkOver(
		{ hue: 'ink', label: 'Ways of al-Istinbaat', title: 'Ways of al-Istinbaat from Quran and Sunnah', titleSize: 15, meta: 'two approaches' },
		[
			{ hue: 'blue', label: '1 · Jumhoor', title: 'Ways of al-Istinbaat according to Jumhoor (Majority)', titleSize: 14 },
			{ hue: 'purple', label: '2 · Hanafiyyah', title: 'Ways of al-Istinbaat according to Hanafiyyah', titleSize: 14 }
		]
	);

/* ---------- Jumhoor: Mantooq and Mafhoom, revealed step by step ---------- */

function jumhoor(stage: 1 | 2 | 3 | 4 | 5): string {
	const root: NodeOpts = { hue: 'ink', label: 'Ways of al-Istinbaat', title: JUMHOOR, titleSize: 15 };
	const mantooq: NodeOpts = { hue: 'blue', label: '1 · Mantooq', title: 'Al-Istidlaal bil Mantooq', titleSize: 15 };
	const mafhoom: NodeOpts = { hue: 'purple', label: '2 · Mafhoom', title: 'Al-Istidlaal bil Mafhoom', titleSize: 15 };
	if (stage === 1) return forkOver(root, [mantooq, mafhoom]);

	const leaf = (accent: boolean, n: string, label: string, title: string, tags?: string[]): NodeOpts => ({
		hue: accent ? 'pink' : 'white',
		align: 'start',
		label: `${n} · ${label}`,
		title,
		tags
	});
	const items: { depth: number; o: NodeOpts }[] = [
		{ depth: 0, o: root },
		{ depth: 1, o: mantooq },
		{ depth: 2, o: leaf(stage === 2, '1.1', 'Mantooq', 'Mantooq Sareeh', ['Dhahir', 'Nass', 'Muawwal', 'Mujmal']) },
		{
			depth: 2,
			o: leaf(stage === 3, '1.2', 'Mantooq', 'Mantooq Ghayr Sareeh', stage >= 3 ? ['Dalalatul Iqtida', 'Dalalatul Isharah', 'Dalalatut Tambeeh wal Eemah'] : undefined)
		},
		{ depth: 1, o: mafhoom }
	];
	if (stage >= 4) {
		items.push({ depth: 2, o: leaf(stage === 4, '2.1', 'Mafhoom', 'Mafhoom al-Muwafaqah') });
		items.push({
			depth: 2,
			o: leaf(stage >= 4, '2.2', 'Mafhoom', 'Mafhoom al-Mukhalafah', stage >= 5 ? ['Mafhoom al-Sifah', 'Mafhoom al-Shart', 'Mafhoom al-Ghayah', 'Mafhoom al-Adad'] : undefined)
		});
	}
	const o = outline(items, { indent: 28, gap: 18 });
	return svg(o.h, defs + o.svg);
}

export const diagrams: Record<string, Diagram> = {
	'istinbat-hanafi-overview': { title: 'The five Mubhath of al-Istinbaat according to the Hanafiyyah', type: 'svg', body: hanafiOverview() },
	'istinbat-hanafi-mubhath-1': { title: 'Mubhath 1 and its four categories', type: 'svg', body: mubhath(0) },
	'istinbat-hanafi-mubhath-2': { title: 'Mubhath 2 and its four categories', type: 'svg', body: mubhath(1) },
	'istinbat-hanafi-mubhath-3': { title: 'Mubhath 3 and its four categories', type: 'svg', body: mubhath(2) },
	'istinbat-hanafi-mubhath-4': { title: 'Mubhath 4 and its four categories', type: 'svg', body: mubhath(3) },
	'istinbat-hanafi-mubhath-5': { title: 'Mubhath 5 and its four categories', type: 'svg', body: mubhath(4) },
	'istinbat-overview': { title: 'The two approaches to al-Istinbaat from the Quran and Sunnah', type: 'svg', body: istinbaatOverview() },
	'istinbat-jumhoor-mantooq-mafhoom': { title: 'Al-Istinbaat according to the Jumhoor: Mantooq and Mafhoom', type: 'svg', body: jumhoor(1) },
	'istinbat-jumhoor-mantooq-sareeh': { title: 'The four types of Mantooq Sareeh', type: 'svg', body: jumhoor(2) },
	'istinbat-jumhoor-mantooq-ghayr-sareeh': { title: 'The three types of Mantooq Ghayr Sareeh', type: 'svg', body: jumhoor(3) },
	'istinbat-jumhoor-mafhoom-types': { title: 'The two types of Mafhoom', type: 'svg', body: jumhoor(4) },
	'istinbat-jumhoor-mukhalafah-types': { title: 'The four types of Mafhoom al-Mukhalafah', type: 'svg', body: jumhoor(5) }
};
