/**
 * Diagrams for batch "uf-misc". Free-form (scripts/diagram-free.ts): a numbered
 * list on a spine, a radial hub, a fan, a bow-tie, quote-to-verdict paths and
 * a two-panel comparison. Palette colours at full strength: pink, purple,
 * blue, green. W = 360. Mutlaq is blue and Muqayyad pink throughout.
 * Each key is referenced from markdown as [[SVG:<key>]].
 */
import { W, svg, type Diagram } from '../diagram-kit.js';
import { node, nodeHeight, ring, badge, tab, caption, words, curve, hcurve, arrow, pill, funnel, compare, defs, type NodeOpts, type Hue } from '../diagram-free.js';

/* ---------- Istihsan: four definitions on a spine ---------- */

function istihsanDefinitions(): string {
	const head: NodeOpts = { hue: 'ink', label: 'The question', title: 'What is Istihsan?', titleSize: 17, meta: 'four definitions · four verdicts' };
	const hw = 250;
	const hh = nodeHeight(hw, head);
	const defs4: { label: string; body: string; verdict: string; hue: Hue }[] = [
		{ label: 'Unexplainable insight', body: 'An evidence or insight that arises within the heart of a Mujtahid but is hard to articulate to others.', verdict: 'Rejected · al-Shafi‘i, Ibn Hazm', hue: 'pink' },
		{ label: 'Preference for stronger evidence', body: 'Preferring the stronger of two evidences, including moving from Qiyas al-jali to Qiyas al-khafi.', verdict: 'Accepted by most scholars', hue: 'purple' },
		{ label: 'Contextual replacement', body: 'Replacing one ruling with another more fitting to the circumstances, justified by Qur’an, Sunnah or consensus.', verdict: 'Accepted by many scholars', hue: 'blue' },
		{ label: 'Takhsis al-‘Illa', body: 'Particularising the cause: the ruling does not apply despite the cause, due to a hindrance.', verdict: 'Debated', hue: 'white' }
	];
	const sx = 18;
	const tx = 46;
	const tw = W - tx;
	let out = defs + node(0, 0, hw, head, hh).svg;
	let y = hh + 74;
	const top = hh;
	let marks = '';
	let content = '';
	out += pill(sx + 8 + 80, hh + 26, 'Scholars define it as');
	content += caption(tx, hh + 62, 'Four definitions', 'start');
	defs4.forEach((d, i) => {
		content += caption(tx, y + 10, d.label, 'start');
		const w = words(tx, y + 20, tw, d.body, { size: 14 });
		content += w.svg;
		const py = y + 20 + w.h + 20;
		content += tab(tx, py, d.verdict, d.hue);
		marks += badge(sx, y + 8, String(i + 1), d.hue);
		y = py + 34;
	});
	const end = y - 20;
	out += arrow(sx, top, sx, end, { dash: true, head: true });
	return svg(end + 2, out + content + marks);
}

/* ---------- Hukm al-Wadhi: a hub with seven satellites ---------- */

function hukmWadiTypes(): string {
	const cx = W / 2;
	const cy = 192;
	const R = 128;
	const sr = 40;
	const sats: { n: number; label?: string; title: string; hue: Hue }[] = [
		{ n: 1, label: 'Sabab', title: 'Cause', hue: 'purple' },
		{ n: 2, label: 'Shart', title: 'Condition', hue: 'purple' },
		{ n: 3, label: 'Mani‘', title: 'Impediment', hue: 'purple' },
		{ n: 4, title: 'Saheeh', hue: 'blue' },
		{ n: 5, title: 'Baatil', hue: 'blue' },
		{ n: 6, title: 'Rukhsah', hue: 'pink' },
		{ n: 7, title: 'Azeemah', hue: 'pink' }
	];
	let lines = '';
	let shapes = '';
	sats.forEach((s, k) => {
		const a = -Math.PI / 2 + (k * 2 * Math.PI) / 7;
		const x = cx + R * Math.cos(a);
		const y = cy + R * Math.sin(a);
		lines += arrow(cx, cy, x, y, { head: false });
		shapes += ring(x, y, sr, { hue: s.hue, label: s.label, title: s.title, titleSize: s.label ? 12 : 13.5 });
		shapes += badge(x + sr * 0.74, y - sr * 0.74, String(s.n), 'ink', 10);
	});
	const hub = ring(cx, cy, 70, { hue: 'ink', label: 'The categories of', title: 'Hukm al-Wadhi', titleSize: 17 });
	return svg(cy + R + sr + 4, defs + lines + hub + shapes);
}

/* ---------- Sources of Ijtihad: a fan ---------- */

function ijtihadSourcesMap(): string {
	const names = ['Qiyas', 'Istihsan', 'Istishaab', 'Istislah', 'Urf', 'Qawl al-Sahabi', 'Sadd al-Zaraai', 'Amal Ahl al-Madina'];
	const ph = 40;
	const gap = 10;
	const total = names.length * ph + (names.length - 1) * gap;
	const rcx = 52;
	const rcy = total / 2;
	const px = 150;
	const pw = W - px;
	let lines = '';
	let shapes = '';
	names.forEach((n, i) => {
		const y = i * (ph + gap);
		lines += hcurve(rcx + 48, rcy, px, y + ph / 2);
		shapes += node(px, y, pw, { hue: 'white', title: n, titleSize: 15, r: 20 }, ph).svg;
		shapes += badge(px + 20, y + ph / 2, String(i + 1), i % 2 === 0 ? 'pink' : 'purple', 12);
	});
	return svg(total, defs + lines + ring(rcx, rcy, 50, { hue: 'purple', label: 'Sources of', title: 'Ijtihad', titleSize: 17 }) + shapes);
}

/* ---------- Qiyas: a bow-tie around the effective cause ---------- */

function qiyasFlowchart(): string {
	const hw = 160;
	const rx = W - hw;
	let out = defs;
	out += caption(0, 10, 'The question', 'start');
	out += words(0, 22, W, 'What is Qiyas?', { size: 22, weight: 600 }).svg;
	const asl: NodeOpts = { hue: 'purple', label: '1 · Original case', title: 'Al-Asl', titleSize: 17 };
	const hukm: NodeOpts = { hue: 'white', label: '2 · Ruling', title: 'Al-Hukm', titleSize: 17 };
	const y1 = 76;
	const h1 = Math.max(nodeHeight(hw, asl), nodeHeight(hw, hukm));
	out += node(0, y1, hw, asl, h1).svg + node(rx, y1 + 16, hw, hukm, h1).svg;
	const M = y1 + 16 + h1 + 46;
	const illah: NodeOpts = { hue: 'pink', label: '3 · Effective cause', title: 'Al-Illah', titleSize: 19 };
	const iw = 220;
	const ih = nodeHeight(iw, illah);
	const iy = M + 56;
	out += funnel([[hw / 2, y1 + h1], [rx + hw / 2, y1 + 16 + h1]], [[W / 2, iy]], W / 2, M, 'Deductive reasoning');
	out += node((W - iw) / 2, iy, iw, illah, ih).svg;
	const M2 = iy + ih + 46;
	const far: NodeOpts = { hue: 'blue', label: '4 · New case', title: 'Al-Far', titleSize: 17 };
	const hukm2: NodeOpts = { hue: 'white', label: '5 · Ruling', title: 'Al-Hukm', titleSize: 17 };
	const y2 = M2 + 56;
	const h2 = Math.max(nodeHeight(hw, far), nodeHeight(hw, hukm2));
	out += funnel([[W / 2, iy + ih]], [[hw / 2, y2], [rx + hw / 2, y2 + 16]], W / 2, M2, 'Analogical reasoning');
	out += node(0, y2, hw, far, h2).svg + node(rx, y2 + 16, hw, hukm2, h2).svg;
	return svg(y2 + 16 + h2, out);
}

/* ---------- Mutlaq and Muqayyad: a quote, and the verdict it leads to ---------- */

/** Split a trailing "(Quran 5:3)" style citation off a quote. */
function cite(quote: string): { body: string; meta?: string } {
	const m = quote.match(/^(.*?)\s*\(((?:Quran|Saheeh)[^)]*)\)\s*$/s);
	return m ? { body: m[1], meta: m[2] } : { body: quote };
}

const QW = 312;

/** A quote, then a dashed curve to its verdict; returns { svg, h }. */
function quoteVerdict(y: number, label: string, text: string, verdict: string, hue: Hue, o: { cardLabel?: string } = {}) {
	const q: NodeOpts = { hue: 'white', align: 'start', label: o.cardLabel, title: '', bodySize: 13, ...cite(text) };
	const qh = nodeHeight(QW, q);
	const v: NodeOpts = { hue, align: 'start', label, title: verdict, titleSize: 14 };
	const vh = nodeHeight(QW, v);
	const vy = y + qh + 30;
	let out = curve(70, y + qh, 110, vy);
	out += node(0, y, QW, { ...q, tab: o.cardLabel ? undefined : { text: label, hue } }, qh).svg;
	out += node(W - QW, vy, QW, v, vh).svg;
	return { svg: out, h: vy + vh - y };
}

function mutlaqInheritanceAyah(): string {
	const r = quoteVerdict(8, 'Mutlaq', 'after the fulfilment of bequests (Wasiyyah) and debts (Quran 4:11)', 'Wasiyyah in this ayah is Mutlaq. It can be any share.', 'blue', { cardLabel: 'Ayah of inheritance' });
	return svg(r.h + 8, defs + r.svg);
}

function muqayyadBequestHadith(): string {
	const r = quoteVerdict(
		8,
		'Muqayyad',
		'Narrated Ibn Abbas: I recommend that people reduce the proportion of what they bequeath by will to the fourth (of the whole legacy), for Allah’s Messenger ﷺ said, “One-third, yet even one third is too much.” (Saheeh al-Bukhari 2743)',
		'Muqayyad (restricted) to one-third.',
		'pink',
		{ cardLabel: 'Hadith' }
	);
	return svg(r.h + 8, defs + r.svg);
}

type Case = {
	n: number;
	title: string;
	mutlaq: { quote: string; verdict: string };
	muqayyad: { quote: string; verdict: string };
	thus?: string;
	rule: string;
	twoUp?: boolean; // compare the two texts side by side (short texts only)
};

function mutlaqCase(c: Case): string {
	let out = defs + caption(0, 10, `Case ${c.n}`, 'start');
	const t = words(0, 20, W, c.title, { size: 17, weight: 600 });
	out += t.svg;
	let y = 20 + t.h + 22;
	if (c.twoUp) {
		const cmp = compare(
			{ hue: 'blue', title: 'Mutlaq' },
			{ hue: 'pink', title: 'Muqayyad' },
			[
				[cite(c.mutlaq.quote).body + (cite(c.mutlaq.quote).meta ? ` (${cite(c.mutlaq.quote).meta})` : ''), cite(c.muqayyad.quote).body + (cite(c.muqayyad.quote).meta ? ` (${cite(c.muqayyad.quote).meta})` : '')],
				[c.mutlaq.verdict, c.muqayyad.verdict]
			],
			{ y0: y }
		);
		out += cmp.svg;
		y += cmp.h + 22;
	} else {
		const a = quoteVerdict(y, 'Mutlaq', c.mutlaq.quote, c.mutlaq.verdict, 'blue');
		out += a.svg;
		y += a.h + 30;
		const b = quoteVerdict(y, 'Muqayyad', c.muqayyad.quote, c.muqayyad.verdict, 'pink');
		out += b.svg;
		y += b.h + 22;
	}
	if (c.thus) {
		const th = words(0, y, W, c.thus, { size: 13.5 });
		out += th.svg;
		y += th.h + 8;
	}
	const rule: NodeOpts = { hue: 'purple', align: 'start', label: 'Rule', title: c.rule, titleSize: 15 };
	const rh = nodeHeight(W, rule);
	out += arrow(W / 2, y, W / 2, y + 26);
	y += 26;
	out += node(0, y, W, rule, rh).svg;
	return svg(y + rh, out);
}

const handElbows = 'O believers! When you rise up for prayer, wash your faces and your hands up to the elbows (Quran 5:6)';

const mutlaqCases: Case[] = [
	{
		n: 1,
		title: 'Ruling is same and cause (sabab) is same',
		mutlaq: {
			quote: 'Prohibited to you are dead animals, blood, the flesh of swine, and those upon which (a name) other than that of Allah has been invoked (Quran 5:3)',
			verdict: '“Blood” is used as Mutlaq in this case'
		},
		muqayyad: {
			quote: 'Say, ⌜O Prophet,⌝ “I do not find in what has been revealed to me anything forbidden to eat except dead animal, running blood, swine—which is impure—or a sinful offering in the name of any other than Allah. (Quran 6:145)',
			verdict: '“Blood” is used as Muqayyad in this case as “running blood”.'
		},
		thus: 'Thus, it does not refer to liver or spleen which has blood nor does it refer to blood that is attached to flesh.',
		rule: 'Muqayyad will take precedence over Mutlaq'
	},
	{
		n: 2,
		title: 'Ruling is different and cause (sabab) is different',
		mutlaq: {
			quote: 'As for male and female thieves, cut off their hands for what they have done (Quran 5:38)',
			verdict: '“Hand” is used as Mutlaq in this case'
		},
		muqayyad: { quote: handElbows, verdict: '“Hand” is used as Muqayyad in this case as “to the elbows”.' },
		thus: 'Thus, ruling and cause is different',
		rule: 'Mutlaq will not be substituted with Muqayyad',
		twoUp: true
	},
	{
		n: 3,
		title: 'Ruling is different and cause (sabab) is same',
		mutlaq: {
			quote: 'But if you are ill or on a journey or one of you comes from the place of relieving himself or you have contacted women and do not find water, then seek clean earth and wipe over your faces and hands with it. (Quran 5:6)',
			verdict: '“Hand” is used as Mutlaq in this case'
		},
		muqayyad: { quote: handElbows, verdict: '“Hand” is used as Muqayyad in this case as “to the elbows”.' },
		thus: 'Thus, ruling is different (Wudhoo and Tayammum) and cause is same (Taharah)',
		rule: 'Mutlaq will take its place and Muqayyad will take its place'
	},
	{
		n: 4,
		title: 'Ruling is same and cause (sabab) is different',
		mutlaq: {
			quote: 'In the ayah about Zihar, “then [there must be] the freeing of a slave” (Quran 58:3)',
			verdict: '“slave” is used as Mutlaq in this case'
		},
		muqayyad: {
			quote: 'It is not lawful for a believer to kill another except by mistake. And whoever kills a believer unintentionally must free a believing slave and pay blood-money to the victim’s family—unless they waive it charitably. (Quran 4:92)',
			verdict: '“slave” is used as Muqayyad in this case as “believing slave”.'
		},
		rule: 'Jumhoor (majority) position: Muqayyad will take place of Mutlaq'
	}
];

export const diagrams: Record<string, Diagram> = {
	'istihsan-definitions': { title: 'The four definitions of Istihsan', type: 'svg', body: istihsanDefinitions() },
	'hukm-wadi-types': { title: 'The categories of Hukm al-Wadhi', type: 'svg', body: hukmWadiTypes() },
	'ijtihad-sources-map': { title: 'Sources of Ijtihad', type: 'svg', body: ijtihadSourcesMap() },
	'qiyas-flowchart': { title: 'The structure of Qiyas', type: 'svg', body: qiyasFlowchart() },
	'mutlaq-inheritance-ayah': { title: 'Mutlaq: Wasiyyah in the ayah of inheritance', type: 'svg', body: mutlaqInheritanceAyah() },
	'muqayyad-bequest-hadith': { title: 'Muqayyad: the bequest restricted to one-third', type: 'svg', body: muqayyadBequestHadith() },
	'mutlaq-case-1': { title: 'Case 1: same ruling, same cause', type: 'svg', body: mutlaqCase(mutlaqCases[0]) },
	'mutlaq-case-2': { title: 'Case 2: different ruling, different cause', type: 'svg', body: mutlaqCase(mutlaqCases[1]) },
	'mutlaq-case-3': { title: 'Case 3: different ruling, same cause', type: 'svg', body: mutlaqCase(mutlaqCases[2]) },
	'mutlaq-case-4': { title: 'Case 4: same ruling, different cause', type: 'svg', body: mutlaqCase(mutlaqCases[3]) }
};
