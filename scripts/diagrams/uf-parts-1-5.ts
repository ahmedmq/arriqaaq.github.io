/**
 * Diagrams for batch "uf-parts-1-5". Free-form (scripts/diagram-free.ts):
 * rounded nodes joined by dashed arrows, a timeline on a spine, a brace,
 * two-panel comparisons, a scale, trees that grow sideways. Palette colours
 * at full strength: pink, purple, blue, green. Phone first at W = 360.
 * Every word is the original's. Each key is referenced from markdown as
 * [[SVG:<key>]].
 */
import { W, svg, type Diagram } from '../diagram-kit.js';
import { node, nodeHeight, curve, hcurve, arrow, pill, caption, badge, dot, brace, compare, funnel, outline, defs, P, type NodeOpts, type Hue } from '../diagram-free.js';

/* ---------- 101 / 103: sources of revelation to fatwa (flow) ---------- */

function sourcesToFatwa(): string {
	const hw = 168;
	const rx = W - hw;
	let out = defs;
	const origin: NodeOpts = { hue: 'ink', label: 'The origin', title: 'Revelation From Allah', titleSize: 16 };
	const ow = 240;
	const oh = nodeHeight(ow, origin);
	const src = (n: number, title: string, hue: Hue, meta?: string): NodeOpts => ({ hue, label: `${n} · Source`, title, meta, titleSize: 17 });
	const quran = src(1, 'Quran', 'purple');
	const sunnah = src(2, 'Sunnah', 'blue');
	const ijma = src(3, 'Ijma', 'green', 'consensus');
	const ijtihaad = src(4, 'Ijtihaad', 'pink', 'deduction of legal rulings');
	const y1 = oh + 86;
	const y2 = y1 + 26; // the right column sits lower: a loose stagger
	const hq = nodeHeight(hw, quran);
	const hs = nodeHeight(hw, sunnah);
	const y3 = Math.max(y1 + hq, y2 + hs) + 34;
	const y4 = y3 + 26;
	const hi = nodeHeight(hw, ijma);
	const hj = nodeHeight(hw, ijtihaad);
	// origin, then two curves out to the first pair
	out += curve(110, oh, hw / 2, y1);
	out += curve(250, oh, rx + hw / 2, y2);
	out += pill(W / 2, oh + 30, 'Reaches us through');
	out += caption(W / 2, oh + 62, 'The four sources');
	// the first pair feeds the second pair by short dashed links
	out += curve(hw / 2, y1 + hq, hw / 2, y3);
	out += curve(rx + hw / 2, y2 + hs, rx + hw / 2, y4);
	out += node((W - ow) / 2, 0, ow, origin, oh).svg;
	out += node(0, y1, hw, quran).svg + node(rx, y2, hw, sunnah).svg;
	out += node(0, y3, hw, ijma).svg + node(rx, y4, hw, ijtihaad).svg;
	// all four meet, and produce
	const bottom = Math.max(y3 + hi, y4 + hj);
	const M = bottom + 54;
	const fiqh: NodeOpts = { hue: 'white', label: 'Understanding', title: 'Fiqh', titleSize: 17 };
	const fatwa: NodeOpts = { hue: 'purple', label: 'Ruling given', title: '→ Fatwa', titleSize: 17 };
	const fy = M + 56;
	out += funnel([[hw / 2, y3 + hi], [rx + hw / 2, y4 + hj]], [[hw / 2, fy], [rx + hw / 2, fy]], W / 2, M, 'Produces');
	const fh = Math.max(nodeHeight(hw, fiqh), nodeHeight(hw, fatwa));
	out += node(0, fy, hw, fiqh, fh).svg + node(rx, fy, hw, fatwa, fh).svg;
	return svg(fy + fh, out);
}

/* ---------- 102: timeline on a spine ---------- */

function imamsTimeline(): string {
	const sx = 20;
	const nx = 52;
	const nw = W - nx;
	const eras: { n: number; o: NodeOpts }[] = [
		{ n: 1, o: { hue: 'pink', align: 'start', label: '500 – 600', title: 'Prophet Muhammad (peace be upon him)', meta: '569–632' } },
		{ n: 2, o: { hue: 'green', align: 'start', label: '600 – 700', title: 'Companions (Sahabas)' } },
		{
			n: 3,
			o: { hue: 'blue', align: 'start', label: '700 – 800', title: '', tags: ['Imam Abu Hanifa · 703–767', 'Imam Malik · 717–801', 'Imam Shafi · 769–820', 'Imam Ahmad ibn Hanbal · 778–855'] }
		},
		{ n: 4, o: { hue: 'purple', align: 'start', label: '800 – 900', title: '', tags: ['Imam Bukhari · 810–870', 'Imam Muslim · 817–875'] } }
	];
	let body = '';
	let nodes = '';
	body += caption(0, 12, 'Time scale (CE)', 'start');
	let y = 34;
	const spineTop = y + 22;
	let last = 0;
	for (const e of eras) {
		const h = nodeHeight(nw, e.o);
		nodes += node(nx, y, nw, e.o, h).svg;
		last = y + 22;
		body += `<line x1="${nx - 6}" y1="${y + 22}" x2="${nx}" y2="${y + 22}" stroke="${P.ink}" stroke-width="1.25"/>`;
		y += h + 22;
	}
	let marks = '';
	let yy = 34;
	for (const e of eras) {
		marks += badge(sx, yy + 22, String(e.n), e.n === 1 ? 'pink' : e.n === 2 ? 'green' : e.n === 3 ? 'blue' : 'purple');
		yy += nodeHeight(nw, e.o) + 22;
	}
	const spine = `<line x1="${sx}" y1="${spineTop}" x2="${sx}" y2="${y - 22 + 12}" stroke="${P.ink}" stroke-width="1.25" stroke-dasharray="5 4" marker-end="url(#dfa)"/>`;
	return svg(y - 22 + 14, defs + spine + body + nodes + marks);
}

/* ---------- 104: expansion and intermingling led to ijtihaad (flow) ---------- */

function expansionIjtihaad(): string {
	const hw = 168;
	const rx = W - hw;
	const a: NodeOpts = { hue: 'blue', label: '1 · Change', title: 'Territorial Expansion' };
	const b: NodeOpts = { hue: 'purple', label: '2 · Change', title: 'Intermingling of Arabs and Non-Arabs' };
	const r1: NodeOpts = { hue: 'pink', label: '3 · Result', title: 'New Problems' };
	const r2: NodeOpts = { hue: 'green', label: '4 · Result', title: 'Frequent Use of Ijtihaad' };
	let out = defs + caption(0, 12, 'Two changes', 'start');
	const ya = 30;
	const yb = 52;
	const ha = nodeHeight(hw, a);
	const hb = nodeHeight(hw, b);
	const M = Math.max(ya + ha, yb + hb) + 50;
	const ry = M + 70;
	out += funnel([[hw / 2, ya + ha], [rx + hw / 2, yb + hb]], [[hw / 2, ry], [rx + hw / 2, ry + 26]], W / 2, M, 'Together led to');
	out += caption(0, M + 40, 'The result', 'start');
	out += node(0, ya, hw, a).svg + node(rx, yb, hw, b).svg;
	out += node(0, ry, hw, r1).svg + node(rx, ry + 26, hw, r2).svg;
	return svg(Math.max(ry + nodeHeight(hw, r1), ry + 26 + nodeHeight(hw, r2)), out);
}

/* ---------- 105: the words in "Usul al Fiqh" (three, a brace, one) ---------- */

function usulTerms(): string {
	const w = 262;
	const items: NodeOpts[] = [
		{ hue: 'white', align: 'start', label: '1 · Asl', title: '', bodySize: 12.5, body: 'Asl can mean Daleel (evidence), Mustashab (default position), Rajih (correct or strongest opinion) or Qaaidah (principle).' },
		{ hue: 'purple', align: 'start', label: '2 · Usul', title: 'Usul = plural of Asl', titleSize: 14, bodySize: 12.5, body: 'Usool literally means "foundations" or "something that is base or a thing is built on it".' },
		{ hue: 'blue', align: 'start', label: '3 · Fiqh', title: '', bodySize: 12.5, body: 'Fiqh literally means "fahm" (understanding) of issues of deen whether it is about Aqeedah (Fiqh al-Akbar), Fiqh of Fitan, manners (Adaab), Tafsir, Ahkaam etc.' }
	];
	let out = defs + caption(0, 12, 'The words', 'start');
	let y = 28;
	const top = y;
	for (const o of items) {
		const h = nodeHeight(w, o);
		out += node(0, y, w, o, h).svg;
		y += h + 14;
	}
	const bot = y - 14;
	const mid = (top + bot) / 2;
	out += brace(w + 8, top, bot);
	const finalY = bot + 70;
	out += `<path d="M${w + 26},${mid} H316 V${finalY}" fill="none" stroke="${P.ink}" stroke-width="1.25" stroke-dasharray="5 4" marker-end="url(#dfa)"/>`;
	out += pill(316, bot + 35, 'Together');
	const fin: NodeOpts = { hue: 'pink', align: 'start', label: '4 · Usul al Fiqh', title: '', bodySize: 13, body: 'Understanding general evidences of Fiqh, and how to extract rulings to make full use of evidence by studying words and its implications.' };
	const fh = nodeHeight(W, fin);
	out += node(0, finalY, W, fin, fh).svg;
	return svg(finalY + fh, out);
}

/* ---------- 106 / 107: comparisons (two panels) ---------- */

function compareDiagram(l: string, lh: Hue, r: string, rh: Hue, rows: [string, string][]): string {
	const c = compare({ hue: lh, label: 'Topic', title: l }, { hue: rh, label: 'Topic', title: r }, rows);
	return svg(c.h, c.svg);
}

const fiqhVsUsul = () =>
	compareDiagram('Fiqh', 'pink', 'Usul al-Fiqh', 'purple', [
		['It is Fard (compulsory) to pray five times a day.', 'How to extract ruling from ayah of Quran that it is Fard.'],
		['Specific and detailed evidence (Adillah Tafseeliyyah)', 'General evidence (Adillah Ijmaliyyah)'],
		['It is Haram to eat pork', 'What does Haram mean, what is Mustahab, etc.'],
		['If someone passes wind it breaks their wudu', 'Amr (command) means obligation']
	]);

const usulVsQawaid = () =>
	compareDiagram('Usul al-Fiqh', 'purple', 'Qawaid al-Fiqh', 'blue', [
		['Methodology of deriving legal rulings from Quran and Hadith', 'Maxims or principles of Fiqh derived from Quran and Sunnah'],
		['Not evidence; a methodology for extraction', 'Can be used as evidence in itself'],
		['Ex: Derivation of Salah obligation from Quranic command ("Establish prayer" (Quran 2:43) - Amr (command))', 'Ex: Principle: "Certainty is not invalidated by doubt"']
	]);

/* ---------- 108: three approaches to books of Usool ul-Fiqh (a trunk with branches) ---------- */

/** One hue per manhaj, shared by 108-112. */
const MANHAJ: Record<'hadith' | 'mutakallimeen' | 'ray' | 'both', Hue> = { hadith: 'green', mutakallimeen: 'blue', ray: 'purple', both: 'pink' };

function usoolApproaches(): string {
	const m = (n: number, label: string, hue: Hue, content: string, body: string): NodeOpts => ({ hue, align: 'start', label: `${n} · ${label}`, title: content, titleSize: 14, body, bodySize: 12.5 });
	const head: NodeOpts = { hue: 'ink', label: 'Books of Usool ul-Fiqh', title: '3 Different Approaches', titleSize: 16 };
	const o = outline(
		[
			{ depth: 0, o: head },
			{
				depth: 1,
				gapBefore: 50,
				o: m(1, 'Manhaj Ahlul Hadith', MANHAJ.hadith, 'Formed independently of Fiqh.', 'No discussions on Mantiq (logic) of Greek Philosophers. Rules and guidelines to make istinbaat from Nusoos (Quran and Sunnah) giving highest preference to it.')
			},
			{
				depth: 1,
				o: m(2, 'Manhaj Mutakallimeen', MANHAJ.mutakallimeen, 'Formed independently of Fiqh.', 'Chapters and discussions on Mantiq (logic) of Greek Philosophers. If there is a contradiction, Aql has precedence over texts (Hadith).')
			},
			{
				depth: 1,
				o: m(3, 'Manhaj Ahlul Ray', MANHAJ.ray, 'Formed in the light of compiled Fiqh of Madhab of Fiqh.', 'No discussions on Mantiq (logic) of Greek Philosophers. Rules to defend the official positions of madhab.')
			},
			{
				depth: 1,
				o: m(4, 'Manhaj Mutakallimeen + Ahlur Ray', MANHAJ.both, 'Tried to club both approaches.', 'Benefits from Mantiq (logic) of Greek Philosophers. Rules based on Mutakallimeen manhaj and Fiqhi examples based on books of Ahlur Ray.')
			}
		],
		{ indent: 24, gap: 18 }
	);
	const headH = nodeHeight(W, head);
	return svg(o.h, defs + o.svg + pill(150, headH + 25, 'Written in the manhaj of'));
}

/* ---------- 109-112: books per manhaj (a spine, books on either side) ---------- */

function bookList(manhaj: string, hue: Hue, books: [string, string][]): string {
	const hw = 160;
	const sx = W / 2;
	const head: NodeOpts = { hue, label: 'Books on Usul al Fiqh', title: manhaj, titleSize: 16 };
	const headW = 260;
	const headH = nodeHeight(headW, head);
	const items = books.map(([t, a], i): NodeOpts => ({ hue: 'white', label: `${i + 1} · Book`, title: t, titleSize: 14, meta: a }));
	const hs = items.map((o) => nodeHeight(hw, o));
	const ys: number[] = [];
	let prev = headH + 30;
	items.forEach((_, i) => {
		const y = i === 0 ? prev : Math.max(ys[i - 1] + 46, i > 1 ? ys[i - 2] + hs[i - 2] + 14 : 0);
		ys.push(y);
	});
	let lines = '';
	let nodes = '';
	items.forEach((o, i) => {
		const left = i % 2 === 0;
		const x = left ? 0 : W - hw;
		const cy = ys[i] + 24;
		lines += `<line x1="${left ? hw : sx}" y1="${cy}" x2="${left ? sx : x}" y2="${cy}" stroke="${P.ink}" stroke-width="1.25" stroke-dasharray="5 4"/>` + dot(sx, cy, 5, left ? hue : 'white');
		nodes += node(x, ys[i], hw, o, hs[i]).svg;
	});
	const bottom = Math.max(...ys.map((y, i) => y + hs[i]));
	const spine = arrow(sx, headH, sx, bottom - 6, { head: false });
	return svg(bottom, defs + spine + lines + node((W - headW) / 2, 0, headW, head, headH).svg + nodes);
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

/* ---------- 113: the five categories of Hukm at-Taklifi (a scale on an axis) ---------- */

function hukmTaklifi(): string {
	const sx = 22;
	const nx = 52;
	const nw = W - nx;
	const head: NodeOpts = { hue: 'ink', label: 'Five categories', title: 'Hukm at Taklifi', titleSize: 16 };
	const cats: { label: string; hue: Hue; body: string }[] = [
		{ label: 'Fard (or Wajib)', hue: 'purple', body: 'An obligatory act whose performance is rewarded and whose nonperformance is punished.' },
		{ label: 'Mandoob', hue: 'blue', body: 'A recommended act whose performance is rewarded and whose nonperformance is not punished.' },
		{ label: 'Halal (or Mubah)', hue: 'white', body: 'A permissible act whose performance is not rewarded and whose nonperformance is not punished, however intention can make it rewardable.' },
		{ label: 'Makrooh', hue: 'green', body: 'A disliked act whose non-performance is rewarded and whose performance is not punished.' },
		{ label: 'Haraam', hue: 'pink', body: 'A prohibited act whose non-performance is rewarded and whose performance is punished.' }
	];
	const hh = nodeHeight(220, head);
	let nodes = '';
	let marks = '';
	let y = hh + 56;
	const axisTop = hh;
	cats.forEach((c, i) => {
		const o: NodeOpts = { hue: c.hue, align: 'start', label: c.label, title: '', body: c.body, bodySize: 13 };
		const h = nodeHeight(nw, o);
		nodes += node(nx, y, nw, o, h).svg;
		marks += `<line x1="${sx + 14}" y1="${y + 22}" x2="${nx}" y2="${y + 22}" stroke="${P.ink}" stroke-width="1.25"/>` + badge(sx, y + 22, String(i + 1), c.hue === 'white' ? 'white' : c.hue);
		y += h + 22;
	});
	const end = y - 22;
	const axis = arrow(sx, axisTop, sx, end + 10, { dash: true });
	return svg(end + 12, defs + axis + node(0, 0, 220, head, hh).svg + nodes + marks + pill(sx + 8 + 105, hh + 28, 'From obligatory to prohibited'));
}

/* ---------- 114: Hukm Taklifi, majority vs Imam Abu Hanifah ---------- */

function hukmMadhabs(): string {
	const rows: { cat: string; maj: string; han: string[] }[] = [
		{ cat: 'Mandatory', maj: 'Wajib', han: ['1. Mandatory (Fard)', '2. Necessary (Wajib)'] },
		{ cat: 'Preferred', maj: 'Mustahab', han: ['Mustahab'] },
		{ cat: 'Permissible', maj: 'Mubah', han: ['Mubah'] },
		{ cat: 'Forbidden', maj: 'Haram', han: ['1. Indirectly forbidden (Makrooh Tahreem)', '2. Forbidden (haram)'] },
		{ cat: 'Disliked', maj: 'Makrooh', han: ['• Makrooh Tanzih', '• Makrooh Tahreemi'] }
	];
	const cw = 150;
	const rx = W - cw;
	const head: NodeOpts = { hue: 'ink', label: 'Categories of', title: 'Hukm Taklifi', titleSize: 16 };
	const maj: NodeOpts = { hue: 'purple', title: 'Majority', titleSize: 16, meta: '(Imam Ahmad, Imam Malik, Imam Shafi‘i and others from Ashabul Hadith)' };
	const han: NodeOpts = { hue: 'pink', title: 'Imam Abu Hanifah', titleSize: 16 };
	let out = defs;
	const hw = 200;
	const hh = nodeHeight(hw, head);
	out += node((W - hw) / 2, 0, hw, head, hh).svg;
	const cy0 = hh + 22;
	const ch = Math.max(nodeHeight(cw, maj), nodeHeight(cw, han));
	out += node(0, cy0, cw, maj, ch).svg + node(rx, cy0, cw, han, ch).svg;
	let y = cy0 + ch + 30;
	for (const r of rows) {
		out += caption(W / 2, y + 4, r.cat);
		y += 18;
		const split = r.han.length > 1;
		const hs = r.han.map((t, i): NodeOpts => ({ hue: 'white', label: i === 0 ? 'Abu Hanifah' : undefined, title: t, titleSize: 13 }));
		const hhs = hs.map((o) => nodeHeight(cw, o));
		const stack = hhs.reduce((a, b) => a + b, 0) + 10 * (hs.length - 1);
		const left: NodeOpts = { hue: split ? 'purple' : 'white', label: 'Majority', title: r.maj, titleSize: 14 };
		const lh = nodeHeight(cw, left);
		const total = Math.max(stack, lh);
		const ly = y + (total - lh) / 2;
		let ry = y + (total - stack) / 2;
		let arrows = '';
		hs.forEach((o, i) => {
			arrows += hcurve(cw, ly + lh / 2, rx - 2, ry + hhs[i] / 2);
			out += node(rx, ry, cw, o, hhs[i]).svg;
			ry += hhs[i] + 10;
		});
		out += arrows + node(0, ly, cw, left, lh).svg;
		y += total + 28;
	}
	return svg(y - 28, out);
}

/* ---------- 115: divisions of Fard (a tree that grows sideways) ---------- */

function fardDivisions(): string {
	const root: NodeOpts = { hue: 'ink', label: 'Ruling', title: 'Fard', titleSize: 17 };
	const rw = 150;
	const rh = nodeHeight(rw, root);
	const bw = 130;
	const bx = 34;
	const lx = 196;
	const lw = W - lx;
	const branches: { name: string; hue: Hue; leaves: [string, string] }[] = [
		{ name: 'Time', hue: 'purple', leaves: ['1. Mutlaq', '2. Muqayyid'] },
		{ name: 'Extent', hue: 'blue', leaves: ['1. Muhaddad', '2. Ghayr Muhaddad'] },
		{ name: 'Subject', hue: 'green', leaves: ['1. Fard Ayn', '2. Fard Kifayah'] },
		{ name: 'Identification of Object', hue: 'pink', leaves: ['1. Muayyan', '2. Mukhayyar'] }
	];
	let lines = '';
	let nodes = '';
	let y = rh + 46;
	const tx = 14;
	branches.forEach((b, i) => {
		const bo: NodeOpts = { hue: b.hue, label: `${i + 1} · Division`, title: b.name, titleSize: 14 };
		const leaves = b.leaves.map((t): NodeOpts => ({ hue: 'white', title: t, titleSize: 14 }));
		const lh = leaves.map((o) => nodeHeight(lw, o));
		const stack = lh[0] + lh[1] + 10;
		const bh = nodeHeight(bw, bo);
		const rowH = Math.max(bh, stack);
		const by = y + (rowH - bh) / 2;
		const cy = by + bh / 2;
		lines += `<path d="M${tx},${rh} V${cy - 12} Q${tx},${cy} ${tx + 12},${cy} H${bx}" fill="none" stroke="${P.ink}" stroke-width="1.25" stroke-dasharray="5 4" marker-end="url(#dfa)"/>`;
		nodes += node(bx, by, bw, bo, bh).svg;
		let ly = y + (rowH - stack) / 2;
		leaves.forEach((o, k) => {
			lines += hcurve(bx + bw, cy, lx - 2, ly + lh[k] / 2);
			nodes += node(lx, ly, lw, o, lh[k]).svg;
			ly += lh[k] + 10;
		});
		y += rowH + 20;
	});
	return svg(y - 20, defs + lines + node(0, 0, rw, root, rh).svg + nodes + pill(tx + 78, rh + 24, 'Divided by'));
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
