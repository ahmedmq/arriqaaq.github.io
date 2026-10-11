/**
 * Diagrams for batch "uf-takhsis-copyright". Free-form (scripts/diagram-free.ts):
 * a hub with four spokes, a tree on a spine, forks and merges with a pill on
 * the join, a region that holds a verse, and large pull quotes.
 * Palette colours at full strength: pink, purple, blue, green. W = 360.
 *
 * Conventions in this batch:
 * - Aam is blue, Khaas is pink, and the principle is dark.
 * - Arabic is set in Noto Naskh, right-aligned; the translation is body text;
 *   the citation is a small mono line.
 * Each key is referenced from markdown as [[SVG:<key>]].
 */
import { W, svg, type Diagram } from '../diagram-kit.js';
import { node, nodeHeight, arrow, funnel, pill, region, outline, defs, words, caption, type NodeOpts, type Hue } from '../diagram-free.js';

const HW = 170;
const RX = W - HW;

type Ev = { ar?: string; en: string; cite: string; note?: string };

const aam = (e: Ev): NodeOpts => ({ hue: 'blue', align: 'start', label: '1 · Aam (General)', ar: e.ar, title: '', body: e.en, bodySize: 12.5, meta: [e.cite, e.note].filter(Boolean).join(' · ') });
const khaas = (e: Ev, label = '2 · Khaas (Specific)'): NodeOpts => ({ hue: 'pink', align: 'start', label, ar: e.ar, title: '', body: e.en, bodySize: 12.5, meta: e.cite || undefined });

const pairH = (a: NodeOpts, b: NodeOpts) => Math.max(nodeHeight(HW, a), nodeHeight(HW, b));

// ---------------------------------------------------------------------------
// The types of Takhsees: a hub with four spokes
// ---------------------------------------------------------------------------

type Leaf = { n: number; label: string; name: string; meaning: string; hue: Hue };

function typeHub(root: string, meta: string, leaves: Leaf[], rootLabel = 'Takhsees'): string {
	const hubO: NodeOpts = { hue: 'ink', label: rootLabel, title: root, titleSize: 16, meta };
	const hubW = 230;
	const hubH = nodeHeight(hubW, hubO);
	const os = leaves.map((l): NodeOpts => ({ hue: l.hue, align: 'start', label: `${l.n} · ${l.label}`, title: l.name, titleSize: 14, body: l.meaning, bodySize: 12.5 }));
	const h1 = Math.max(nodeHeight(HW, os[0]), nodeHeight(HW, os[1]));
	const h2 = Math.max(nodeHeight(HW, os[2]), nodeHeight(HW, os[3]));
	const band = hubH + 64;
	const hubY = h1 + 32;
	const y2 = h1 + band;
	let out = defs;
	const cx = W / 2;
	const cy = hubY + hubH / 2;
	out += arrow(cx - 50, hubY, HW / 2, h1, { head: false }) + arrow(cx + 50, hubY, RX + HW / 2, h1, { head: false });
	out += arrow(cx - 50, hubY + hubH, HW / 2, y2, { head: false }) + arrow(cx + 50, hubY + hubH, RX + HW / 2, y2, { head: false });
	void cy;
	out += node(0, 0, HW, os[0], h1).svg + node(RX, 0, HW, os[1], h1).svg;
	out += node((W - hubW) / 2, hubY, hubW, hubO, hubH).svg;
	out += node(0, y2, HW, os[2], h2).svg + node(RX, y2, HW, os[3], h2).svg;
	return svg(y2 + h2, out);
}

function takhsisTypes(): string {
	return typeHub('Types of Takhsees', 'together · separate · intellect · custom', [
		{ n: 1, label: 'Type', name: 'Al-Mukhassis al-Muttasil', meaning: 'General ruling (Aam) and its specific limitation (Khaas) appear together in the same text.', hue: 'purple' },
		{ n: 2, label: 'Type', name: 'Al-Mukhassis al-Munfasil', meaning: 'General ruling (Aam) is mentioned in one text, and the specific limitation (Khaas) comes in a separate text.', hue: 'blue' },
		{ n: 3, label: 'Type', name: 'Takhsees bil-Aql', meaning: 'General ruling (Aam) is understood to exclude certain cases through intellectual reasoning.', hue: 'pink' },
		{ n: 4, label: 'Type', name: 'Takhsees bil-Urf', meaning: 'Specifying a general text by reference to custom (‘Urf).', hue: 'green' }
	]);
}

function takhsisBySource(): string {
	const leaf = (n: number, name: string, meaning: string, hue: Hue) => ({ depth: 1, o: { hue, align: 'start' as const, label: `${n} · Source`, title: name, titleSize: 14, body: meaning, bodySize: 12.5 } });
	const o = outline(
		[
			{ depth: 0, o: { hue: 'ink', label: 'Takhsees', title: 'Takhsees by source', titleSize: 16, meta: 'Quran · Sunnah · Ijma' } },
			leaf(1, 'Quran by Quran', 'General verse (Aam) in the Quran is clarified by another specific verse (Khaas) in the Quran.', 'green'),
			leaf(2, 'Quran by Sunnah', 'General ruling established in the Quran is clarified by a specific ruling found in the Sunnah (Hadith).', 'purple'),
			leaf(3, 'Sunnah by Sunnah', 'General ruling found in one Hadith is limited or clarified by a specific ruling found in another Hadith.', 'blue'),
			leaf(4, 'Ijma (Consensus)', 'General text from the Quran or Sunnah is limited by the Ijmaa of qualified scholars.', 'pink')
		],
		{ indent: 24, gap: 18 }
	);
	return svg(o.h, defs + o.svg);
}

// ---------------------------------------------------------------------------
// A head, a pill on the join, then Aam beside Khaas
// ---------------------------------------------------------------------------

const headNode = (o: NodeOpts) => ({ ...o, hue: 'white' as Hue, align: 'start' as const, title: '', bodySize: 13 });

/** Head, then a fork through a pill to two nodes. `stagger` sets the right node lower (a separate text). */
function headedFork(head: NodeOpts, pillLabel: string, left: NodeOpts, right: NodeOpts, stagger = 0): string {
	const hw = 300;
	const ho = headNode(head);
	const hh = nodeHeight(hw, ho);
	const M = hh + 38;
	const y = M + 64;
	const h = pairH(left, right);
	let out = defs + node((W - hw) / 2, 0, hw, ho, hh).svg;
	out += funnel([[W / 2, hh]], [[HW / 2, y], [RX + HW / 2, y + stagger]], W / 2, M, pillLabel);
	out += node(0, y, HW, left, h).svg + node(RX, y + stagger, HW, right, h).svg;
	return svg(y + stagger + h, out);
}

/** Head, a pill on the border of a region, and Aam beside Khaas inside it: one verse. */
function headedRegion(head: NodeOpts, pillLabel: string, left: NodeOpts, right: NodeOpts): string {
	const hw = 300;
	const ho = headNode(head);
	const hh = nodeHeight(hw, ho);
	const ry = hh + 46;
	const h = pairH(left, right);
	const pad = 10;
	const iw = (W - 3 * pad) / 2;
	const h2 = Math.max(nodeHeight(iw, left), nodeHeight(iw, right));
	let out = defs + node((W - hw) / 2, 0, hw, ho, hh).svg;
	out += arrow(W / 2, hh, W / 2, ry - 12);
	out += region(0, ry, W, h2 + 40, { r: 20 });
	out += pill(W / 2, ry, pillLabel);
	out += node(pad, ry + 26, iw, left, h2).svg + node(pad * 2 + iw, ry + 26, iw, right, h2).svg;
	void h;
	return svg(ry + h2 + 40, out);
}

function muttasil(): string {
	return headedRegion(
		{ title: '', label: 'Al-Mukhassis al-Muttasil', body: 'In this Al-Mukhassis is together with al-Aam (They are not separated)' },
		'Same verse',
		aam({ ar: 'فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ', en: 'So whoever is present this month, let them fast.', cite: '(Quran 2:185)', note: 'The word مَن is Aam (General) in this Ayah' }),
		khaas({
			ar: 'وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ',
			en: 'But whoever is ill or on a journey, then ⌜let them fast⌝ an equal number of days ⌜after Ramaḍân⌝.',
			cite: '(Quran 2:185)'
		})
	);
}

const AAM_228: Ev = {
	ar: 'وَالْمُطَلَّقَاتُ يَتَرَبَّصْنَ بِأَنفُسِهِنَّ ثَلَاثَةَ قُرُوءٍ',
	en: 'Divorced women remain in waiting [i.e., do not remarry] for three periods (monthly cycles)',
	cite: '(Quran 2:228)'
};
const KHAAS_654: Ev = {
	ar: 'وَأُولَاتُ الْأَحْمَالِ أَجَلُهُنَّ أَن يَضَعْنَ حَمْلَهُنَّ',
	en: 'As for those who are pregnant, their waiting period ends with delivery.',
	cite: '(Quran 65:4)'
};

function munfasil(): string {
	return headedFork(
		{ title: '', label: 'Al-Mukhassis al-Munfasil', body: 'In this Al-Mukhassis is separated from al-Aam (They are not together)' },
		'A separate text',
		aam(AAM_228),
		khaas(KHAAS_654),
		36
	);
}

function bilAql(): string {
	return headedFork(
		{ title: '', label: 'Takhsees bil-Aql', body: 'Some scholars of Usool made this categorization, though it is not necessary.' },
		'By intellect',
		aam({ ar: 'اللَّهُ خَالِقُ كُلِّ شَيْءٍ', en: 'Allah is the Creator of all things', cite: '(Quran 39:62)' }),
		{ hue: 'pink', align: 'start', label: '2 · Khaas (by Aql)', title: '', body: 'Creation of creator is not included in this.', bodySize: 12.5 }
	);
}

function bilUrf(): string {
	const p1: NodeOpts = { hue: 'white', align: 'start', label: '1 · Position', title: '', body: 'This is the position of some Maliki scholars, one can make Takhsees based on Urf.', bodySize: 12.5 };
	const p2: NodeOpts = { hue: 'purple', align: 'start', label: '2 · Position', title: '', body: 'Others say that they consider only the Urf at the time of Prophet ﷺ to make takhsees of the text.', bodySize: 12.5 };
	const top = pairH(p1, p2);
	const M = top + 38;
	const y = M + 64;
	const left = aam({ ar: 'الطَّعَامُ بِالطَّعَامِ مِثْلاً بِمِثْلٍ', en: 'Allah’s Messenger ﷺ said: “Food (may be sold) for food, of same quantities.”', cite: '(Saheeh Muslim 1592)' });
	const right: NodeOpts = { hue: 'pink', align: 'start', label: '2 · Khaas (by Urf)', title: '', body: 'Maliki scholars say that the طعام used in this Hadith should be used for food used during the time of Prophet ﷺ.', bodySize: 12.5 };
	const h = pairH(left, right);
	let out = defs + node(0, 0, HW, p1, top).svg + node(RX, 0, HW, p2, top).svg;
	out += funnel([[HW / 2, top], [RX + HW / 2, top]], [[HW / 2, y], [RX + HW / 2, y]], W / 2, M, 'By custom (Urf)');
	out += node(0, y, HW, left, h).svg + node(RX, y, HW, right, h).svg;
	return svg(y + h, out);
}

// ---------------------------------------------------------------------------
// Aam beside Khaas, merging into the principle
// ---------------------------------------------------------------------------

const PRINCIPLE = 'Khaas (specific) Dalil (evidence) takes precedence over Aam (General) Dalil.';
const PRINCIPLE_REFS = 'Fath al-Bari 1/89 · Majmoo al-Fatawaa 31/141 · Nayl al-Awtar 1/485 · Tafseer Bahr al-Muheet 3/168';

function pairToPrinciple(a: Ev, k: Ev, principle = PRINCIPLE): string {
	const l = aam(a);
	const r = khaas(k);
	const h = pairH(l, r);
	const M = h + 38;
	const py = M + 56;
	const p: NodeOpts = { hue: 'ink', align: 'start', label: 'Principle', title: principle, titleSize: 15, meta: PRINCIPLE_REFS };
	const ph = nodeHeight(W, p);
	let out = defs + node(0, 0, HW, l, h).svg + node(RX, 0, HW, r, h).svg;
	out += funnel([[HW / 2, h], [RX + HW / 2, h]], [[W / 2, py]], W / 2, M, 'Specified by Khaas');
	out += node(0, py, W, p, ph).svg;
	return svg(py + ph, out);
}

function quranByQuran(): string {
	return pairToPrinciple(AAM_228, KHAAS_654);
}

function quranBySunnah(): string {
	return pairToPrinciple(
		{ ar: 'حُرِّمَتْ عَلَيْكُمُ الْمَيْتَةُ', en: 'Prohibited to you are dead animals', cite: '(Quran 5:3)' },
		{ ar: 'الْحِلُّ مَيْتَتُهُ', en: 'Its (Sea’s) dead creatures are halal', cite: '(Muwatta Malik 42)' },
		'Khaas (specific) Dalil (evidence) takes precedence over Aam (General) Dalil'
	);
}

function quranBySunnahTheft(): string {
	return pairToPrinciple(
		{ ar: 'وَالسَّارِقُ وَالسَّارِقَةُ فَاقْطَعُوا أَيْدِيَهُمَا', en: 'As for male and female thieves, cut off their hands', cite: '(Quran 5:38)' },
		{ ar: 'لاَ قَطْعَ فِي ثَمَرٍ وَلاَ كَثَرٍ', en: 'Do not cut the hand of one who steals fruit, or steals from palm trees', cite: '(Muwatta Malik 1536)' },
		'Khaas (specific) Dalil (evidence) takes precedence over Aam (General) Dalil'
	);
}

function sunnahBySunnahSilk(): string {
	return pairToPrinciple(
		{
			ar: 'أُحِلَّ الذَّهَبُ وَالْحَرِيرُ لِإِنَاثِ أُمَّتِي وَحُرِّمَ عَلَى ذُكُورِهَا',
			en: 'Messenger of Allah ﷺ said: “Gold and silk have been permitted for the females of my Ummah, and forbidden to the males.”',
			cite: '(Sunan Nasaee 5148, Saheeh)'
		},
		{
			ar: 'رَخَّصَ النَّبِيُّ صلى الله عليه وسلم لِلزُّبَيْرِ وَعَبْدِ الرَّحْمَنِ فِي لُبْسِ الْحَرِيرِ لِحِكَّةٍ بِهِمَا',
			en: 'The Prophet ﷺ allowed Az-Zubair and Abdur-Rahman to wear silk because they were suffering from an itch',
			cite: '(Saheeh al-Bukhari 5839)'
		}
	);
}

// ---------------------------------------------------------------------------
// Copyright: pull quotes, and two reasons side by side
// ---------------------------------------------------------------------------

/** A quote with a large pink mark and no box. */
function openQuote(label: string, text: string): string {
	const w = words(54, 32, W - 54, text, { size: 18, weight: 500 });
	const h = Math.max(w.h + 40, 80);
	return svg(h, `<text x="0" y="72" font-family="Inter, system-ui, sans-serif" font-size="88" font-weight="700" fill="#ff00a0">“</text>` + caption(54, 18, label, 'start') + w.svg);
}

/** A quote on a full colour. */
function filledQuote(hue: Hue, label: string, text: string, size = 17): string {
	const o: NodeOpts = { hue, align: 'start', label, title: '', body: text, bodySize: size, r: 20 };
	const h = nodeHeight(W, o);
	return svg(h, node(0, 0, W, o, h).svg);
}

function pdfSharing(): string {
	const a: NodeOpts = { hue: 'pink', label: '1 · Sharing', title: 'I share PDF because it helps us learn', titleSize: 16 };
	const b: NodeOpts = { hue: 'purple', label: '2 · Not sharing', title: 'I don’t share PDF because it is not my property', titleSize: 16 };
	const h = Math.max(nodeHeight(HW, a), nodeHeight(HW, b));
	return svg(h + 30, node(0, 0, HW, a, h).svg + node(RX, 30, HW, b, h).svg);
}

export const diagrams: Record<string, Diagram> = {
	'takhsis-types': { title: 'The four types of Takhsees', type: 'svg', body: takhsisTypes() },
	'takhsis-muttasil-example': { title: 'Connected Takhsees: Aam and Khaas in the same verse (Quran 2:185)', type: 'svg', body: muttasil() },
	'takhsis-munfasil-example': { title: 'Disconnected Takhsees: Aam and Khaas in separate texts (Quran 2:228, 65:4)', type: 'svg', body: munfasil() },
	'takhsis-aql-example': { title: 'Takhsees by intellect (Quran 39:62)', type: 'svg', body: bilAql() },
	'takhsis-urf-example': { title: 'Takhsees by custom (Saheeh Muslim 1592)', type: 'svg', body: bilUrf() },
	'takhsis-by-source': { title: 'Classification of Takhsees by source', type: 'svg', body: takhsisBySource() },
	'takhsis-quran-by-quran': { title: 'Takhsees of Quran by Quran: the waiting period', type: 'svg', body: quranByQuran() },
	'takhsis-quran-by-sunnah-dead-animals': { title: 'Takhsees of Quran by Sunnah: dead animals and sea creatures', type: 'svg', body: quranBySunnah() },
	'takhsis-quran-by-sunnah-theft': { title: 'Takhsees of Quran by Sunnah: cutting the hand of a thief', type: 'svg', body: quranBySunnahTheft() },
	'takhsis-sunnah-by-sunnah-silk': { title: 'Takhsees of Sunnah by Sunnah: silk for men', type: 'svg', body: sunnahBySunnahSilk() },
	'copyright-sharing-vs-stealing': {
		title: 'Sharing and stealing online',
		type: 'svg',
		body: openQuote('Sharing vs stealing', '“In the digital age, the line between sharing and stealing can be blurry.”')
	},
	'copyright-livelihood': {
		title: 'Taking work without permission',
		type: 'svg',
		body: filledQuote('purple', 'Livelihood', '“Remember: when you take someone else’s work without permission, you’re not just taking their words, you’re taking their livelihood.”')
	},
	'copyright-pdf-sharing': { title: 'Two reasons people give about sharing PDFs', type: 'svg', body: pdfSharing() },
	'copyright-honesty-policy': {
		title: 'Honesty and copyright',
		type: 'svg',
		body: filledQuote('pink', 'Honesty', '“When it comes to copyright, honesty is the best PDF policy.”', 19)
	}
};
