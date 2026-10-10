/**
 * Diagrams for batch "uf-misc". Built with scripts/diagram-kit.ts and following
 * DESIGN.md → Imagery (palette only, portrait-first at W = 360).
 * Each key is referenced from markdown as [[SVG:<key>]].
 */
import { W, GAP, svg, stack, block, row, chip, connector, group, responsive, type BlockOpts, type Diagram, type Section } from '../diagram-kit.js';

/**
 * REFERENCE DIAGRAM for the diagram language (DESIGN.md → Diagram language).
 * Layer-stack layout: a context block naming the question, a chip on the
 * connector, then one cohesive slab of four blocks 8px apart. Accepted
 * definitions are purple (darker = more widely accepted); the rejected one is
 * lavender with its label and verdict in pink (accent); the debated one stays
 * plain lavender. Verdicts are meta lines.
 */
function istihsanDefinitions(): string {
	// Responsive: the question and the chip are the head; each definition is a
	// section (two columns on desktop). The group label opens the first one.
	const head: Section = (y0) => {
		const b = block(0, y0, W, { tone: 'light', label: 'The question', content: 'What is Istihsan?', meta: 'four definitions · four verdicts' });
		const y = y0 + b.h;
		// Connector runs through the section gap so it still meets the group label.
		const out = b.svg + connector(W / 2, y, W / 2, y + 62) + chip(W / 2, y + 16, 'Scholars define it as').svg;
		return { svg: out, h: b.h + 62 + 4 - 16 };
	};
	const defs: BlockOpts[] = [
		{ tone: 'light', accent: true, n: 1, label: 'Unexplainable insight', body: 'An evidence or insight that arises within the heart of a Mujtahid but is hard to articulate to others.', meta: 'Rejected · al-Shafi‘i, Ibn Hazm' },
		{ tone: 'p0', n: 2, label: 'Preference for stronger evidence', body: 'Preferring the stronger of two evidences, including moving from Qiyas al-jali to Qiyas al-khafi.', meta: 'Accepted by most scholars' },
		{ tone: 'p2', n: 3, label: 'Contextual replacement', body: 'Replacing one ruling with another more fitting to the circumstances, justified by Qur’an, Sunnah or consensus.', meta: 'Accepted by many scholars' },
		{ tone: 'light', n: 4, label: 'Takhsis al-‘Illa', body: 'Particularising the cause: the ruling does not apply despite the cause, due to a hindrance.', meta: 'Debated' }
	];
	const sections = defs.map((d, i): Section => (y) => {
		if (i > 0) return block(0, y, W, d);
		const g = group(0, y, 'Four definitions');
		const b = block(0, y + 26, W, d);
		return { svg: g.svg + b.svg, h: 26 + b.h };
	});
	return responsive(sections, { head });
}

/** Stack blocks top to bottom with GAP, from y. Returns { svg, h }. */
function slab(y0: number, parts: ((y: number) => { svg: string; h: number })[]) {
	const r = stack(y0, GAP, parts);
	return { svg: r.svg, h: r.y - y0 };
}

const full = (o: BlockOpts) => (y: number) => block(0, y, W, o);
const pair = (a: BlockOpts, b: BlockOpts) => (y: number) => row(0, y, W, [a, b]);

/**
 * Mind map as one slab: the centre concept is a full-width p0 block, the
 * branches a tight grid of blocks directly beneath it (no trunk lines).
 */
function hukmWadiTypes(): string {
	const r = slab(0, [
		full({ tone: 'p0', label: 'The categories of', content: 'Hukm al-Wadhi' }),
		(y) =>
			row(0, y, W, [
				{ tone: 'p1', n: 1, label: 'Sabab', content: 'Cause' },
				{ tone: 'p1', n: 2, label: 'Shart', content: 'Condition' },
				{ tone: 'p1', n: 3, label: 'Mani‘', content: 'Impediment' }
			]),
		pair({ tone: 'p2', n: 4, content: 'Saheeh' }, { tone: 'p2', n: 5, content: 'Baatil' }),
		pair({ tone: 'light', n: 6, content: 'Rukhsah' }, { tone: 'light', n: 7, content: 'Azeemah' })
	]);
	return svg(r.h, r.svg);
}

function ijtihadSourcesMap(): string {
	const names = ['Qiyas', 'Istihsan', 'Istishaab', 'Istislah', 'Urf', 'Qawl al-Sahabi', 'Sadd al-Zaraai', 'Amal Ahl al-Madina'];
	const parts = [full({ tone: 'p0', label: 'Sources of', content: 'Ijtihad' })];
	for (let i = 0; i < names.length; i += 2) parts.push(pair({ tone: 'light', n: i + 1, content: names[i] }, { tone: 'light', n: i + 2, content: names[i + 1] }));
	const r = slab(0, parts);
	return svg(r.h, r.svg);
}

/**
 * Flow: the Asl and its Hukm (two-up) lead by deductive reasoning to the
 * effective cause (p0), which leads by analogical reasoning to the Far and
 * its Hukm (two-up). Chips on the connectors name the two directions.
 */
function qiyasFlowchart(): string {
	let out = '';
	let y = 0;
	const head = block(0, y, W, { tone: 'light', label: 'The question', content: 'What is Qiyas?' });
	out += head.svg;
	y += head.h + GAP;
	const top = row(0, y, W, [
		{ tone: 'p1', n: 1, label: 'Original case', content: 'Al-Asl' },
		{ tone: 'light', n: 2, label: 'Ruling', content: 'Al-Hukm' }
	]);
	out += top.svg;
	y += top.h;
	out += connector(W / 2, y, W / 2, y + 62);
	out += chip(W / 2, y + 16, 'Deductive reasoning').svg;
	y += 62 + 4;
	const illah = block(0, y, W, { tone: 'p0', n: 3, label: 'Effective cause', content: 'Al-Illah' });
	out += illah.svg;
	y += illah.h;
	out += connector(W / 2, y, W / 2, y + 62);
	out += chip(W / 2, y + 16, 'Analogical reasoning').svg;
	y += 62 + 4;
	const bottom = row(0, y, W, [
		{ tone: 'p2', n: 4, label: 'New case', content: 'Al-Far' },
		{ tone: 'light', n: 5, label: 'Ruling', content: 'Al-Hukm' }
	]);
	out += bottom.svg;
	y += bottom.h;
	return svg(y, out);
}

/** Split a trailing "(Quran 5:3)" style citation off a quote. */
function cite(quote: string): { body: string; meta?: string } {
	const m = quote.match(/^(.*?)\s*\(((?:Quran|Saheeh)[^)]*)\)\s*$/s);
	return m ? { body: m[1], meta: m[2] } : { body: quote };
}

/** Lavender quote block (pink label/citation for muqayyad), then its p1 verdict. */
function quote(label: string, text: string, muqayyad = false): BlockOpts {
	return { tone: 'light', accent: muqayyad, label, ...cite(text) };
}
const verdict = (content: string, label = 'Verdict'): BlockOpts => ({ tone: 'p1', label, content });

function mutlaqInheritanceAyah(): string {
	const r = slab(0, [
		full(quote('Ayah of inheritance', 'after the fulfilment of bequests (Wasiyyah) and debts (Quran 4:11)')),
		full(verdict('Wasiyyah in this ayah is Mutlaq. It can be any share.', 'Mutlaq'))
	]);
	return svg(r.h, r.svg);
}

function muqayyadBequestHadith(): string {
	const r = slab(0, [
		full(
			quote(
				'Hadith',
				'Narrated Ibn Abbas: I recommend that people reduce the proportion of what they bequeath by will to the fourth (of the whole legacy), for Allah’s Messenger ﷺ said, “One-third, yet even one third is too much.” (Saheeh al-Bukhari 2743)',
				true
			)
		),
		full(verdict('Muqayyad (restricted) to one-third.', 'Muqayyad'))
	]);
	return svg(r.h, r.svg);
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

/**
 * Layer stack: the case on top (lavender), each text as a lavender quote
 * block followed by its p1 verdict, the "Thus" note in lavender, and the
 * rule as the p0 focus at the bottom.
 */
function mutlaqCase(c: Case): string {
	const parts: ((y: number) => { svg: string; h: number })[] = [full({ tone: 'light', label: `Case ${c.n}`, content: c.title })];
	const qa = quote('Mutlaq', c.mutlaq.quote);
	const qb = quote('Muqayyad', c.muqayyad.quote, true);
	if (c.twoUp) {
		parts.push(pair(qa, qb), pair(verdict(c.mutlaq.verdict), verdict(c.muqayyad.verdict)));
	} else {
		parts.push(full(qa), full(verdict(c.mutlaq.verdict)), full(qb), full(verdict(c.muqayyad.verdict)));
	}
	if (c.thus) parts.push(full({ tone: 'light', body: c.thus }));
	parts.push(full({ tone: 'p0', label: 'Rule', content: c.rule }));
	const r = slab(0, parts);
	if (c.twoUp || r.h <= 700) return svg(r.h, r.svg);
	// Too tall for one desktop column: the case is the head, the Mutlaq text
	// and its verdict one section, the Muqayyad text, verdict, note and rule
	// the other (two columns on desktop).
	const sec = (ps: typeof parts): Section => (y) => slab(y, ps);
	return responsive([sec(parts.slice(1, 3)), sec(parts.slice(3))], { head: parts[0] });
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
