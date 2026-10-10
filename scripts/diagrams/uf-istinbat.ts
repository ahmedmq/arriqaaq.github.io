/**
 * Diagrams for batch "uf-istinbat". Built with scripts/diagram-kit.ts and
 * following DESIGN.md → Diagram language ("tree as slabs", W = 360).
 * Each key is referenced from markdown as [[SVG:<key>]].
 *
 * Layout: the root is a full-width p0 block; first-level branches are
 * full-width purple blocks 8px below it (two-up when there are exactly two
 * unexpanded branches); a branch's leaves are tags inside it, or two-up
 * lavender blocks directly under it. Deeper levels are lavender blocks with
 * tags. The node revealed at each Jumhoor step carries the pink accent.
 */
import { W, GAP, block, row, svg, responsive, type BlockOpts, type Diagram, type Section } from '../diagram-kit.js';

/**
 * Tree as slabs: lays out rows of blocks top to bottom, 8px apart. Each row
 * is one full-width block, or a two-up (or wider) row() of blocks.
 */
function slabs(rows: (BlockOpts | BlockOpts[])[]): string {
	let out = '';
	let y = 0;
	for (const r of rows) {
		const b = Array.isArray(r) ? row(0, y, W, r) : block(0, y, W, r);
		out += b.svg;
		y += b.h + GAP;
	}
	return svg(y - GAP, out);
}

/* ---------- Hanafiyyah: the five Mubhath ---------- */

const HANAFI = 'Ways of al-Istinbaat according to Hanafiyyah';

const MUBHATH: { label: string; leaves: string[] }[] = [
	{ label: 'Mubhath 1', leaves: ['Dhahir', 'Nass', 'Muawwal', 'Mujmal'] },
	{ label: 'Mubhath 2', leaves: ['Al-Khafi', 'Al-Mushkil', 'Al-Mujmal', 'Al-Mutashabih'] },
	{ label: 'Mubhath 3', leaves: ['Al-Haqiqah', 'Al-Majaz', 'Al-Sareeh', 'Al-Kinayah'] },
	{ label: 'Mubhath 4', leaves: ['Ibaarah al-Nass', 'Isharah al-Nass', 'Iqtida al-Nass', 'Dalalah al-Nass'] },
	{ label: 'Mubhath 5', leaves: ['Mafhoom al-Sifah', 'Mafhoom al-Shart', 'Mafhoom al-Ghayah', 'Mafhoom al-Adad'] }
];

/**
 * Overview: root, then the five Mubhath as one purple family, leaves as tags.
 * Responsive: the root is the head, each Mubhath a section (two columns on desktop).
 */
const hanafiOverview = (): string =>
	responsive(
		MUBHATH.map((m, i): Section => (y) => block(0, y, W, { tone: 'p2', n: i + 1, label: 'Mubhath', tags: m.leaves })),
		{ head: (y) => block(0, y, W, { tone: 'p0', label: 'Ways of al-Istinbaat', content: HANAFI, meta: 'five Mubhath · four categories each' }) }
	);

/** One Mubhath on its own: the branch as root, its four leaves two-up under it. */
function mubhath(i: number): string {
	const m = MUBHATH[i];
	const leaf = (content: string): BlockOpts => ({ tone: 'light', content });
	return slabs([
		{ tone: 'p0', label: 'Hanafiyyah', content: m.label, meta: 'four categories' },
		[leaf(m.leaves[0]), leaf(m.leaves[1])],
		[leaf(m.leaves[2]), leaf(m.leaves[3])]
	]);
}

/* ---------- Overview of both approaches ---------- */

const istinbaatOverview = (): string =>
	slabs([
		{ tone: 'p0', label: 'Ways of al-Istinbaat', content: 'Ways of al-Istinbaat from Quran and Sunnah', meta: 'two approaches' },
		[
			{ tone: 'p1', n: 1, label: 'Jumhoor', content: 'Ways of al-Istinbaat according to Jumhoor (Majority)' },
			{ tone: 'p2', n: 2, label: 'Hanafiyyah', content: 'Ways of al-Istinbaat according to Hanafiyyah' }
		]
	]);

/* ---------- Jumhoor: Mantooq and Mafhoom, revealed step by step ---------- */

const JUMHOOR = 'Ways of al-Istinbaat according to Jumhoor (Majority)';

function jumhoor(stage: 1 | 2 | 3 | 4 | 5): string {
	const root: BlockOpts = { tone: 'p0', label: 'Ways of al-Istinbaat', content: JUMHOOR };
	const mantooq: BlockOpts = { tone: 'p1', n: 1, label: 'Mantooq', content: 'Al-Istidlaal bil Mantooq' };
	const mafhoom: BlockOpts = { tone: 'p2', n: 2, label: 'Mafhoom', content: 'Al-Istidlaal bil Mafhoom' };
	if (stage === 1) return slabs([root, [mantooq, mafhoom]]);

	const rows: (BlockOpts | BlockOpts[])[] = [root, mantooq];
	rows.push({ tone: 'light', accent: stage === 2, n: '1.1', label: 'Mantooq', content: 'Mantooq Sareeh', tags: ['Dhahir', 'Nass', 'Muawwal', 'Mujmal'] });
	rows.push({
		tone: 'light',
		accent: stage === 3,
		n: '1.2',
		label: 'Mantooq',
		content: 'Mantooq Ghayr Sareeh',
		tags: stage >= 3 ? ['Dalalatul Iqtida', 'Dalalatul Isharah', 'Dalalatut Tambeeh wal Eemah'] : undefined
	});
	rows.push(mafhoom);
	if (stage >= 4) {
		rows.push({ tone: 'light', accent: stage === 4, n: '2.1', label: 'Mafhoom', content: 'Mafhoom al-Muwafaqah' });
		rows.push({
			tone: 'light',
			accent: stage >= 4,
			n: '2.2',
			label: 'Mafhoom',
			content: 'Mafhoom al-Mukhalafah',
			tags: stage >= 5 ? ['Mafhoom al-Sifah', 'Mafhoom al-Shart', 'Mafhoom al-Ghayah', 'Mafhoom al-Adad'] : undefined
		});
	}
	if (stage === 5) {
		// The full tree is too tall for one desktop column: root as head, then
		// the Mantooq branch and the Mafhoom branch as two sections.
		const branch = (items: (BlockOpts | BlockOpts[])[]): Section => (y0) => {
			let out = '';
			let y = y0;
			for (const r of items) {
				const b = Array.isArray(r) ? row(0, y, W, r) : block(0, y, W, r);
				out += b.svg;
				y += b.h + GAP;
			}
			return { svg: out, h: y - GAP - y0 };
		};
		const mafhoomAt = rows.indexOf(mafhoom);
		return responsive([branch(rows.slice(1, mafhoomAt)), branch(rows.slice(mafhoomAt))], { head: branch([root]) });
	}
	return slabs(rows);
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
