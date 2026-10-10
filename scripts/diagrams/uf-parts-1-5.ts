/**
 * Diagrams for batch "uf-parts-1-5". Built with scripts/diagram-kit.ts in the
 * diagram language (DESIGN.md → Diagram language): square blocks 8px apart
 * forming one structure, lavender context, purple ramp for the focus, pink as
 * the sparing highlight. Phone first at W = 360.
 * Each key is referenced from markdown as [[SVG:<key>]].
 */
import { W, GAP, svg, block, row, chip, connector, group, blockHeight, responsive, type BlockOpts, type Diagram, type Section, type Tone } from '../diagram-kit.js';

type Part = { svg: string; h: number };

/** Half-width column for two-up grids. */
const HALF = (W - GAP) / 2;

/** Connector with a chip on it, then optionally a group label. Returns the new y. */
function link(y: number, label: string, groupLabel?: string): Part {
	let out = connector(W / 2, y, W / 2, y + 62);
	out += chip(W / 2, y + 16, label).svg;
	let h = 62 + 4;
	if (groupLabel) {
		out += group(0, y + h, groupLabel).svg;
		h += 26;
	}
	return { svg: out, h };
}

/** Full-width blocks top to bottom, 8px apart. */
function slabs(y: number, items: BlockOpts[]): Part {
	let out = '';
	let cy = y;
	for (const it of items) {
		const b = block(0, cy, W, it);
		out += b.svg;
		cy += b.h + GAP;
	}
	return { svg: out, h: cy - GAP - y };
}

/** Two-up grid: pairs share a row height; an odd last item spans the full width. */
function grid(y: number, items: BlockOpts[]): Part {
	let out = '';
	let cy = y;
	for (let i = 0; i < items.length; i += 2) {
		const pair = items.slice(i, i + 2);
		const r = pair.length === 2 ? row(0, cy, W, pair) : block(0, cy, W, pair[0]);
		out += r.svg;
		cy += r.h + GAP;
	}
	return { svg: out, h: cy - GAP - y };
}

/* ---------- 101 / 103: sources of revelation to fatwa (flow) ---------- */

function sourcesToFatwa(): string {
	let out = '';
	let y = 0;
	const head = block(0, y, W, { tone: 'light', accent: true, label: 'The origin', content: 'Revelation From Allah' });
	out += head.svg;
	y += head.h;
	const l1 = link(y, 'Reaches us through', 'The four sources');
	out += l1.svg;
	y += l1.h;
	const r1 = row(0, y, W, [
		{ tone: 'p0', n: 1, label: 'Source', content: 'Quran' },
		{ tone: 'p0', n: 2, label: 'Source', content: 'Sunnah' }
	]);
	out += r1.svg;
	y += r1.h + GAP;
	const r2 = row(0, y, W, [
		{ tone: 'p2', n: 3, label: 'Source', content: 'Ijma', meta: 'consensus' },
		{ tone: 'p2', n: 4, label: 'Source', content: 'Ijtihaad', meta: 'deduction of legal rulings' }
	]);
	out += r2.svg;
	y += r2.h;
	const l2 = link(y, 'Produces');
	out += l2.svg;
	y += l2.h;
	const foot = row(0, y, W, [
		{ tone: 'light', label: 'Understanding', content: 'Fiqh' },
		{ tone: 'light', accent: true, label: 'Ruling given', content: '→ Fatwa' }
	]);
	out += foot.svg;
	return svg(y + foot.h, out);
}

/* ---------- 102: timeline as a layer stack of era slabs ---------- */

function imamsTimeline(): string {
	let out = group(0, 0, 'Time scale (CE)').svg;
	const s = slabs(26, [
		{ tone: 'light', accent: true, n: 1, label: '500 – 600', content: 'Prophet Muhammad (peace be upon him)', meta: '569–632' },
		{ tone: 'light', n: 2, label: '600 – 700', content: 'Companions (Sahabas)' },
		{
			tone: 'p0',
			n: 3,
			label: '700 – 800',
			tags: ['Imam Abu Hanifa · 703–767', 'Imam Malik · 717–801', 'Imam Shafi · 769–820', 'Imam Ahmad ibn Hanbal · 778–855']
		},
		{ tone: 'p2', n: 4, label: '800 – 900', tags: ['Imam Bukhari · 810–870', 'Imam Muslim · 817–875'] }
	]);
	out += s.svg;
	return svg(26 + s.h, out);
}

/* ---------- 104: expansion and intermingling led to ijtihaad (flow) ---------- */

function expansionIjtihaad(): string {
	let out = group(0, 0, 'Two changes').svg;
	let y = 26;
	const r1 = row(0, y, W, [
		{ tone: 'light', n: 1, label: 'Change', content: 'Territorial Expansion' },
		{ tone: 'light', n: 2, label: 'Change', content: 'Intermingling of Arabs and Non-Arabs' }
	]);
	out += r1.svg;
	y += r1.h;
	const l = link(y, 'Together led to', 'The result');
	out += l.svg;
	y += l.h;
	const r2 = row(0, y, W, [
		{ tone: 'p2', n: 3, label: 'Result', content: 'New Problems' },
		{ tone: 'p0', n: 4, label: 'Result', content: 'Frequent Use of Ijtihaad' }
	]);
	out += r2.svg;
	return svg(y + r2.h, out);
}

/* ---------- 105: the words in "Usul al Fiqh" (layer stack) ---------- */

function usulTerms(): string {
	let out = group(0, 0, 'The words').svg;
	let y = 26;
	const s = slabs(y, [
		{
			tone: 'light',
			n: 1,
			label: 'Asl',
			body: 'Asl can mean Daleel (evidence), Mustashab (default position), Rajih (correct or strongest opinion) or Qaaidah (principle).'
		},
		{
			tone: 'p2',
			n: 2,
			label: 'Usul',
			content: 'Usul = plural of Asl',
			body: 'Usool literally means "foundations" or "something that is base or a thing is built on it".'
		},
		{
			tone: 'p2',
			n: 3,
			label: 'Fiqh',
			body: 'Fiqh literally means "fahm" (understanding) of issues of deen whether it is about Aqeedah (Fiqh al-Akbar), Fiqh of Fitan, manners (Adaab), Tafsir, Ahkaam etc.'
		}
	]);
	out += s.svg;
	y += s.h;
	const l = link(y, 'Together');
	out += l.svg;
	y += l.h;
	const f = block(0, y, W, {
		tone: 'p0',
		n: 4,
		label: 'Usul al Fiqh',
		body: 'Understanding general evidences of Fiqh, and how to extract rulings to make full use of evidence by studying words and its implications.'
	});
	out += f.svg;
	return svg(y + f.h, out);
}

/* ---------- 106 / 107: comparisons (two-up slabs) ---------- */

function compare(left: string, right: string, rows: [string, string][]): string {
	let out = '';
	const head = row(0, 0, W, [
		{ tone: 'p0', label: 'Topic', content: left },
		{ tone: 'p2', label: 'Topic', content: right }
	]);
	out += head.svg;
	let y = head.h + GAP;
	rows.forEach(([l, r]) => {
		const rr = row(0, y, W, [
			{ tone: 'light', body: l },
			{ tone: 'light', body: r }
		]);
		out += rr.svg;
		y += rr.h + GAP;
	});
	return svg(y - GAP, out);
}

const fiqhVsUsul = () =>
	compare('Fiqh', 'Usul al-Fiqh', [
		['It is Fard (compulsory) to pray five times a day.', 'How to extract ruling from ayah of Quran that it is Fard.'],
		['Specific and detailed evidence (Adillah Tafseeliyyah)', 'General evidence (Adillah Ijmaliyyah)'],
		['It is Haram to eat pork', 'What does Haram mean, what is Mustahab, etc.'],
		['If someone passes wind it breaks their wudu', 'Amr (command) means obligation']
	]);

const usulVsQawaid = () =>
	compare('Usul al-Fiqh', 'Qawaid al-Fiqh', [
		['Methodology of deriving legal rulings from Quran and Hadith', 'Maxims or principles of Fiqh derived from Quran and Sunnah'],
		['Not evidence; a methodology for extraction', 'Can be used as evidence in itself'],
		['Ex: Derivation of Salah obligation from Quranic command ("Establish prayer" (Quran 2:43) - Amr (command))', 'Ex: Principle: "Certainty is not invalidated by doubt"']
	]);

/* ---------- 108: three approaches to books of Usool ul-Fiqh (layer stack) ---------- */

/** One tone per manhaj, shared by 108-112. */
const MANHAJ: Record<'hadith' | 'mutakallimeen' | 'ray' | 'both', Tone> = { hadith: 'p0', mutakallimeen: 'p1', ray: 'p2', both: 'p3' };

function usoolApproaches(): string {
	// Head: the question block and the chip; each manhaj is its own section.
	const head: Section = (y) => {
		const b = block(0, y, W, { tone: 'light', label: 'Books of Usool ul-Fiqh', content: '3 Different Approaches' });
		// The connector runs on through the section gap, so its diamond still
		// sits 4px above the first manhaj (as link() does in a plain stack).
		const cy = y + b.h;
		const out = b.svg + connector(W / 2, cy, W / 2, cy + 74) + chip(W / 2, cy + 16, 'Written in the manhaj of').svg;
		return { svg: out, h: b.h + 62 };
	};
	const manahij: BlockOpts[] = [
		{
			tone: MANHAJ.hadith,
			n: 1,
			label: 'Manhaj Ahlul Hadith',
			content: 'Formed independently of Fiqh.',
			body: 'No discussions on Mantiq (logic) of Greek Philosophers. Rules and guidelines to make istinbaat from Nusoos (Quran and Sunnah) giving highest preference to it.'
		},
		{
			tone: MANHAJ.mutakallimeen,
			n: 2,
			label: 'Manhaj Mutakallimeen',
			content: 'Formed independently of Fiqh.',
			body: 'Chapters and discussions on Mantiq (logic) of Greek Philosophers. If there is a contradiction, Aql has precedence over texts (Hadith).'
		},
		{
			tone: MANHAJ.ray,
			n: 3,
			label: 'Manhaj Ahlul Ray',
			content: 'Formed in the light of compiled Fiqh of Madhab of Fiqh.',
			body: 'No discussions on Mantiq (logic) of Greek Philosophers. Rules to defend the official positions of madhab.'
		},
		{
			tone: MANHAJ.both,
			n: 4,
			label: 'Manhaj Mutakallimeen + Ahlur Ray',
			content: 'Tried to club both approaches.',
			body: 'Benefits from Mantiq (logic) of Greek Philosophers. Rules based on Mutakallimeen manhaj and Fiqhi examples based on books of Ahlur Ray.'
		}
	];
	return responsive(
		manahij.map((m): Section => (y) => block(0, y, W, m)),
		{ head }
	);
}

/* ---------- 109-112: books per manhaj (head slab + two-up grid) ---------- */

function bookList(manhaj: string, tone: Tone, books: [string, string][]): string {
	let out = '';
	const head = block(0, 0, W, { tone, label: 'Books on Usul al Fiqh', content: manhaj });
	out += head.svg;
	const g = grid(
		head.h + GAP,
		books.map(([t, a], i) => ({ tone: 'light', n: i + 1, label: 'Book', content: t, meta: a }))
	);
	out += g.svg;
	return svg(head.h + GAP + g.h, out);
}

const booksHadith = () =>
	bookList('Manhaj Ahlul Hadith', MANHAJ.hadith, [
		['Ar-Risalah', 'by Imam Shafiee'],
		['Al-Madkhal', 'by Al-Bayhaqi'],
		['Al-Ikhkaam fee Usool al-Ahkam', 'by Ibn Hazm'],
		['Al-Faqeeh wal Mutafaqqih', 'by Khateeb al-Baghdadi'],
		['Jami Bayan al-Ilm', 'by Ibn Abdul Barr'],
		['Qawatih al-Adillah', 'by As-Samaani'],
		['Alam al-Muwaqqieen', 'by Ibn al-Qayyim']
	]);

const booksRay = () =>
	bookList('Manhaj Ahlur Ray', MANHAJ.ray, [
		['Al-Fusool fil Usool', 'Abu Bakr al-Razi al-Jassas'],
		['Taqweem al-Adillah', 'by Al-Dabusi'],
		['Al-Mabsoot', 'by Al-Sarkhasi'],
		['Kanz al-Usool', 'by Al-Bazdawi'],
		['Meezan al-Usool', 'by Alauddin Samarqandi']
	]);

const booksMutakallimeen = () =>
	bookList('Manhaj Mutakallimeen', MANHAJ.mutakallimeen, [
		['Al-Mutamad', 'by Abul Hasan al-Basari al-Mutazili'],
		['Al-Burhaan fee Usool al-Fiqh', 'by Imam al-Haramayn al-Juwaini'],
		['Al-Mustasfa', 'by Abu Hamid al-Ghazali'],
		['Al-Mahsool', 'by Fakhruddin al-Raazi'],
		['Al-Ikhkaam fee Usool al-Ahkam', 'by Al-Aamidi']
	]);

const booksCombined = () =>
	bookList('Manhaj Mutakallimeen + Ahlur Ray', MANHAJ.both, [
		['Badee’un Nidham', 'by Imam As-Sa’ati'],
		['Tanqeeh al-Usool', 'by Sadrush Shareeah'],
		['Jam’ul Jawaami', 'Tajuddin As-Subki'],
		['At-Tahreer', 'Abil Humam al-Hanafi'],
		['Musallam ath-Thuboot', 'Muhibullah Bihari']
	]);

/* ---------- 113: the five categories of Hukm at-Taklifi (layer stack, a scale) ---------- */

function hukmTaklifi(): string {
	let out = '';
	let y = 0;
	const head = block(0, y, W, { tone: 'light', label: 'Five categories', content: 'Hukm at Taklifi' });
	out += head.svg;
	y += head.h;
	const l = link(y, 'From obligatory to prohibited');
	out += l.svg;
	y += l.h;
	const s = slabs(y, [
		{ tone: 'p0', n: 1, label: 'Fard (or Wajib)', contentFace: 'sans', content: 'An obligatory act whose performance is rewarded and whose nonperformance is punished.' },
		{ tone: 'p3', n: 2, label: 'Mandoob', contentFace: 'sans', content: 'A recommended act whose performance is rewarded and whose nonperformance is not punished.' },
		{
			tone: 'light',
			n: 3,
			label: 'Halal (or Mubah)',
			contentFace: 'sans', content: 'A permissible act whose performance is not rewarded and whose nonperformance is not punished, however intention can make it rewardable.'
		},
		{ tone: 'light', accent: true, n: 4, label: 'Makrooh', contentFace: 'sans', content: 'A disliked act whose non-performance is rewarded and whose performance is not punished.' },
		{ tone: 'pink', n: 5, label: 'Haraam', contentFace: 'sans', content: 'A prohibited act whose non-performance is rewarded and whose performance is punished.' }
	]);
	out += s.svg;
	return svg(y + s.h, out);
}

/* ---------- 114: Hukm Taklifi, majority vs Imam Abu Hanifah (two-up slabs) ---------- */

function hukmMadhabs(): string {
	const rows: { cat: string; maj: string; han: string[] }[] = [
		{ cat: 'Mandatory', maj: 'Wajib', han: ['1. Mandatory (Fard)', '2. Necessary (Wajib)'] },
		{ cat: 'Preferred', maj: 'Mustahab', han: ['Mustahab'] },
		{ cat: 'Permissible', maj: 'Mubah', han: ['Mubah'] },
		{ cat: 'Forbidden', maj: 'Haram', han: ['1. Indirectly forbidden (Makrooh Tahreem)', '2. Forbidden (haram)'] },
		{ cat: 'Disliked', maj: 'Makrooh', han: ['• Makrooh Tanzih', '• Makrooh Tahreemi'] }
	];
	// Head: the title and the two column headers (the key to every row).
	const head: Section = (y0) => {
		let out = '';
		const b = block(0, y0, W, { tone: 'light', label: 'Categories of', content: 'Hukm Taklifi' });
		out += b.svg;
		const cols = row(0, y0 + b.h + GAP, W, [
			{ tone: 'p0', content: 'Majority', meta: '(Imam Ahmad, Imam Malik, Imam Shafi‘i and others from Ashabul Hadith)' },
			{ tone: 'p2', content: 'Imam Abu Hanifah' }
		]);
		out += cols.svg;
		return { svg: out, h: b.h + GAP + cols.h };
	};
	// One section per category: the category as a group label, then the
	// Majority cell beside the Hanafi cell(s). Each cell repeats its column
	// name, so a row still reads on its own when the desktop layout puts it
	// in the second column, away from the headers.
	const rx = HALF + GAP;
	const sections = rows.map((r): Section => (y0) => {
		let out = group(0, y0, r.cat).svg;
		const y = y0 + 26;
		// Right column: one cell per Hanafi category; left cell spans them all.
		const cells: BlockOpts[] = r.han.map((t, i) => ({ tone: 'light', label: i === 0 ? 'Abu Hanifah' : undefined, content: t }));
		// A pink label marks where Imam Abu Hanifah splits one category in two.
		const leftOpts: BlockOpts = { tone: 'light', accent: r.han.length > 1, label: 'Majority', content: r.maj };
		const hs = cells.map((c) => blockHeight(HALF, c));
		const total = Math.max(blockHeight(HALF, leftOpts), hs.reduce((a, b) => a + b, 0) + GAP * (hs.length - 1));
		if (hs.length === 1) hs[0] = total;
		else hs[hs.length - 1] = total - hs.slice(0, -1).reduce((a, b) => a + b + GAP, 0);
		out += block(0, y, HALF, { ...leftOpts, h: total }).svg;
		let cy = y;
		cells.forEach((c, i) => {
			out += block(rx, cy, HALF, { ...c, h: hs[i] }).svg;
			cy += hs[i] + GAP;
		});
		return { svg: out, h: 26 + total };
	});
	return responsive(sections, { head });
}

/* ---------- 115: divisions of Fard (tree as slabs) ---------- */

function fardDivisions(): string {
	let out = '';
	let y = 0;
	const root = block(0, y, W, { tone: 'p0', label: 'Ruling', content: 'Fard' });
	out += root.svg;
	y += root.h;
	const l = link(y, 'Divided by');
	out += l.svg;
	y += l.h;
	const branches: { name: string; tone: Tone; leaves: [string, string] }[] = [
		{ name: 'Time', tone: 'p1', leaves: ['1. Mutlaq', '2. Muqayyid'] },
		{ name: 'Extent', tone: 'p2', leaves: ['1. Muhaddad', '2. Ghayr Muhaddad'] },
		{ name: 'Subject', tone: 'p3', leaves: ['1. Fard Ayn', '2. Fard Kifayah'] },
		{ name: 'Identification of Object', tone: 'p3', leaves: ['1. Muayyan', '2. Mukhayyar'] }
	];
	branches.forEach((b, i) => {
		const bb = block(0, y, W, { tone: b.tone, n: i + 1, label: 'Division', content: b.name });
		out += bb.svg;
		y += bb.h + GAP;
		const lv = row(0, y, W, b.leaves.map((t) => ({ tone: 'light' as Tone, content: t })));
		out += lv.svg;
		y += lv.h + GAP;
	});
	return svg(y - GAP, out);
}

export const diagrams: Record<string, Diagram> = {
	'fiqh-sources-to-fatwa': { title: 'From revelation to fatwa: the four sources of Fiqh', type: 'svg', body: sourcesToFatwa() },
	'fiqh-imams-timeline': { title: 'Timeline of the Prophet, the Companions and the Imams (CE)', type: 'svg', body: imamsTimeline() },
	'fiqh-expansion-ijtihaad': { title: 'Why Ijtihaad grew: expansion and intermingling brought new problems', type: 'svg', body: expansionIjtihaad() },
	'usul-al-fiqh-terms': { title: 'The meaning of Asl, Usul, Fiqh and Usul al Fiqh', type: 'svg', body: usulTerms() },
	'fiqh-vs-usul-al-fiqh': { title: 'Fiqh compared with Usul al-Fiqh', type: 'svg', body: fiqhVsUsul() },
	'usul-vs-qawaid-al-fiqh': { title: 'Usul al-Fiqh compared with Qawaid al-Fiqh', type: 'svg', body: usulVsQawaid() },
	'usul-books-approaches': { title: 'Books of Usool ul-Fiqh: three different approaches', type: 'svg', body: usoolApproaches() },
	'usul-books-ahlul-hadith': { title: 'Books on Usul al Fiqh: Manhaj Ahlul Hadith', type: 'svg', body: booksHadith() },
	'usul-books-ahlur-ray': { title: 'Books on Usul al Fiqh: Manhaj Ahlur Ray', type: 'svg', body: booksRay() },
	'usul-books-mutakallimeen': { title: 'Books on Usul al Fiqh: Manhaj Mutakallimeen', type: 'svg', body: booksMutakallimeen() },
	'usul-books-mutakallimeen-ahlur-ray': { title: 'Books on Usul al Fiqh: Manhaj Mutakallimeen + Ahlur Ray', type: 'svg', body: booksCombined() },
	'hukm-taklifi-five-categories': { title: 'The five categories of Hukm at-Taklifi', type: 'svg', body: hukmTaklifi() },
	'hukm-taklifi-madhabs': { title: 'Hukm Taklifi: the majority compared with Imam Abu Hanifah', type: 'svg', body: hukmMadhabs() },
	'hukm-fard-divisions': { title: 'Divisions of Fard', type: 'svg', body: fardDivisions() }
};
