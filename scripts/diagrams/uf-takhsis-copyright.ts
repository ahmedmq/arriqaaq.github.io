/**
 * Diagrams for batch "uf-takhsis-copyright". Built with scripts/diagram-kit.ts
 * and following DESIGN.md → Diagram language (W = 360, square blocks 8px
 * apart, lavender context, purple ramp for the focus).
 * Each key is referenced from markdown as [[SVG:<key>]].
 *
 * Conventions in this batch:
 * - Aam / Khaas pairs are a two-up slab: Aam lavender (context), Khaas purple
 *   (focus). Arabic is the block content, the translation is body, the
 *   citation is meta.
 * - A chip on a split connector names how the pair relates ("SAME VERSE").
 * - Where the post states the principle, the pair merges into one dark p0
 *   block carrying the principle and its references.
 */
import { W, GAP, svg, block, row, chip, connector, type BlockOpts, type Diagram } from '../diagram-kit.js';

const HALF = (W - GAP) / 2;
const COLS = [HALF / 2, HALF + GAP + HALF / 2]; // centres of a two-up row

/**
 * Split connector: from the bottom of a full-width block (y) down to a chip,
 * then out to the centre of each column of a two-up row. Returns the y where
 * the row starts. Built only from connector() and chip().
 */
function split(y: number, label: string, dash = false): { svg: string; y: number } {
	let out = connector(W / 2, y, W / 2, y + 16, { diamond: false, dash });
	out += chip(W / 2, y + 16, label).svg;
	const top = y + 46;
	const mid = top + 12;
	const end = top + 26;
	out += connector(W / 2, top, W / 2, mid, { diamond: false, dash });
	out += connector(COLS[0], mid, COLS[1], mid, { diamond: false, dash });
	for (const cx of COLS) out += connector(cx, mid, cx, end, { dash });
	return { svg: out, y: end + 6 };
}

/**
 * Merge connector: from the bottom of a two-up row (y) the two columns join,
 * pass through a chip, and land on the full-width block below. Returns the y
 * where that block starts.
 */
function merge(y: number, label: string): { svg: string; y: number } {
	const mid = y + 14;
	let out = '';
	for (const cx of COLS) out += connector(cx, y, cx, mid, { diamond: false });
	out += connector(COLS[0], mid, COLS[1], mid, { diamond: false });
	out += connector(W / 2, mid, W / 2, mid + 10, { diamond: false });
	out += chip(W / 2, mid + 10, label).svg;
	out += connector(W / 2, mid + 40, W / 2, mid + 58);
	return { svg: out, y: mid + 64 };
}

type Ev = { ar?: string; en: string; cite: string; note?: string };

const aam = (e: Ev): BlockOpts => ({ tone: 'light', n: 1, label: 'Aam (General)', content: e.ar, contentFace: 'sans', body: e.en, meta: [e.cite, e.note].filter(Boolean).join(' · ') });
const khaas = (e: Ev, label = 'Khaas (Specific)'): BlockOpts => ({ tone: 'p1', n: 2, label, content: e.ar, contentFace: 'sans', body: e.en, meta: e.cite || undefined });

// ---------------------------------------------------------------------------
// Tree as slabs: the types of Takhsees
// ---------------------------------------------------------------------------

type Leaf = { n: number; label: string; name: string; meaning: string; tone: BlockOpts['tone'] };

function typeTree(root: string, meta: string, leaves: Leaf[]): string {
	let out = '';
	let y = 0;
	const head = block(0, y, W, { tone: 'p0', label: 'Takhsees', content: root, meta });
	out += head.svg;
	y += head.h + GAP;
	for (let i = 0; i < leaves.length; i += 2) {
		const r = row(
			0,
			y,
			W,
			leaves.slice(i, i + 2).map((l) => ({ tone: l.tone, n: l.n, label: l.label, content: l.name, body: l.meaning }))
		);
		out += r.svg;
		y += r.h + GAP;
	}
	return svg(y - GAP, out);
}

function takhsisTypes(): string {
	return typeTree('Types of Takhsees', 'together · separate · intellect · custom', [
		{ n: 1, label: 'Type', name: 'Al-Mukhassis al-Muttasil', meaning: 'General ruling (Aam) and its specific limitation (Khaas) appear together in the same text.', tone: 'p1' },
		{ n: 2, label: 'Type', name: 'Al-Mukhassis al-Munfasil', meaning: 'General ruling (Aam) is mentioned in one text, and the specific limitation (Khaas) comes in a separate text.', tone: 'p2' },
		{ n: 3, label: 'Type', name: 'Takhsees bil-Aql', meaning: 'General ruling (Aam) is understood to exclude certain cases through intellectual reasoning.', tone: 'light' },
		{ n: 4, label: 'Type', name: 'Takhsees bil-Urf', meaning: 'Specifying a general text by reference to custom (‘Urf).', tone: 'light' }
	]);
}

function takhsisBySource(): string {
	return typeTree('Takhsees by source', 'Quran · Sunnah · Ijma', [
		{ n: 1, label: 'Source', name: 'Quran by Quran', meaning: 'General verse (Aam) in the Quran is clarified by another specific verse (Khaas) in the Quran.', tone: 'p1' },
		{ n: 2, label: 'Source', name: 'Quran by Sunnah', meaning: 'General ruling established in the Quran is clarified by a specific ruling found in the Sunnah (Hadith).', tone: 'p2' },
		{ n: 3, label: 'Source', name: 'Sunnah by Sunnah', meaning: 'General ruling found in one Hadith is limited or clarified by a specific ruling found in another Hadith.', tone: 'p3' },
		{ n: 4, label: 'Source', name: 'Ijma (Consensus)', meaning: 'General text from the Quran or Sunnah is limited by the Ijmaa of qualified scholars.', tone: 'light' }
	]);
}

// ---------------------------------------------------------------------------
// Flow into a two-up slab: context block, chip, Aam | Khaas
// ---------------------------------------------------------------------------

function headedPair(head: BlockOpts, chipLabel: string, left: BlockOpts, right: BlockOpts, dash = false): string {
	let out = '';
	const h = block(0, 0, W, head);
	out += h.svg;
	const s = split(h.h, chipLabel, dash);
	out += s.svg;
	const r = row(0, s.y, W, [left, right]);
	out += r.svg;
	return svg(s.y + r.h, out);
}

function muttasil(): string {
	return headedPair(
		{ tone: 'light', label: 'Al-Mukhassis al-Muttasil', body: 'In this Al-Mukhassis is together with al-Aam (They are not separated)' },
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
	return headedPair(
		{ tone: 'light', label: 'Al-Mukhassis al-Munfasil', body: 'In this Al-Mukhassis is separated from al-Aam (They are not together)' },
		'A separate text',
		aam(AAM_228),
		khaas(KHAAS_654),
		true
	);
}

function bilAql(): string {
	return headedPair(
		{ tone: 'light', label: 'Takhsees bil-Aql', body: 'Some scholars of Usool made this categorization, though it is not necessary.' },
		'By intellect',
		aam({ ar: 'اللَّهُ خَالِقُ كُلِّ شَيْءٍ', en: 'Allah is the Creator of all things', cite: '(Quran 39:62)' }),
		{ tone: 'p1', n: 2, label: 'Khaas (by Aql)', content: 'Creation of creator is not included in this.' }
	);
}

function bilUrf(): string {
	let out = '';
	const pos = row(0, 0, W, [
		{ tone: 'light', n: 1, label: 'Position', body: 'This is the position of some Maliki scholars, one can make Takhsees based on Urf.' },
		{ tone: 'light', accent: true, n: 2, label: 'Position', body: 'Others say that they consider only the Urf at the time of Prophet ﷺ to make takhsees of the text.' }
	]);
	out += pos.svg;
	const s = split(pos.h, 'By custom (Urf)');
	out += s.svg;
	const r = row(0, s.y, W, [
		{ tone: 'light', n: 1, label: 'Aam (General)', content: 'الطَّعَامُ بِالطَّعَامِ مِثْلاً بِمِثْلٍ', contentFace: 'sans', body: 'Allah’s Messenger ﷺ said: “Food (may be sold) for food, of same quantities.”', meta: '(Saheeh Muslim 1592)' },
		{ tone: 'p1', n: 2, label: 'Khaas (by Urf)', body: 'Maliki scholars say that the طعام used in this Hadith should be used for food used during the time of Prophet ﷺ.' }
	]);
	out += r.svg;
	return svg(s.y + r.h, out);
}

// ---------------------------------------------------------------------------
// Two-up slab merging into the principle (p0)
// ---------------------------------------------------------------------------

const PRINCIPLE = 'Khaas (specific) Dalil (evidence) takes precedence over Aam (General) Dalil.';
const PRINCIPLE_REFS = 'Fath al-Bari 1/89 · Majmoo al-Fatawaa 31/141 · Nayl al-Awtar 1/485 · Tafseer Bahr al-Muheet 3/168';

function pairToPrinciple(a: Ev, k: Ev, principle = PRINCIPLE): string {
	let out = '';
	const r = row(0, 0, W, [aam(a), khaas(k)]);
	out += r.svg;
	const m = merge(r.h, 'Specified by Khaas');
	out += m.svg;
	const p = block(0, m.y, W, { tone: 'p0', label: 'Principle', content: principle, meta: PRINCIPLE_REFS });
	out += p.svg;
	return svg(m.y + p.h, out);
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
// Copyright: pull quotes as single blocks, and a two-up comparison
// ---------------------------------------------------------------------------

function quote(o: BlockOpts): string {
	const b = block(0, 0, W, o);
	return svg(b.h, b.svg);
}

function pdfSharing(): string {
	const r = row(0, 0, W, [
		{ tone: 'light', accent: true, n: 1, label: 'Sharing', content: 'I share PDF because it helps us learn' },
		{ tone: 'p0', n: 2, label: 'Not sharing', content: 'I don’t share PDF because it is not my property' }
	]);
	return svg(r.h, r.svg);
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
		body: quote({ tone: 'light', label: 'Sharing vs stealing', body: '“In the digital age, the line between sharing and stealing can be blurry.”' })
	},
	'copyright-livelihood': {
		title: 'Taking work without permission',
		type: 'svg',
		body: quote({ tone: 'p0', label: 'Livelihood', body: '“Remember: when you take someone else’s work without permission, you’re not just taking their words, you’re taking their livelihood.”' })
	},
	'copyright-pdf-sharing': { title: 'Two reasons people give about sharing PDFs', type: 'svg', body: pdfSharing() },
	'copyright-honesty-policy': {
		title: 'Honesty and copyright',
		type: 'svg',
		body: quote({ tone: 'light', accent: true, label: 'Honesty', body: '“When it comes to copyright, honesty is the best PDF policy.”' })
	}
};
