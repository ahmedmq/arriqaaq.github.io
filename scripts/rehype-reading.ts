/**
 * rehype plugin: prepares post HTML for the reading experience (DESIGN.md →
 * Reading). Runs at build time, so the markdown sources stay untouched.
 *
 * 1. Emojis: removed from headings, and from the start of paragraphs and
 *    list items ("📝 Overview:", "1️⃣ History…"). They read as decoration from
 *    an older template. ©, ® and ™ are kept.
 * 2. Arabic: every run of Arabic script is wrapped in <span lang="ar"
 *    dir="rtl">, so it gets the Arabic face and correct bidi inside English
 *    text. A paragraph that is mostly Arabic becomes a right-aligned verse
 *    line (class "q-ar").
 * 3. Quotes: each blockquote is classified as Qur'an, hadith or a general
 *    quote (class "quote quote--quran|hadith|plain", data-label). A quote is
 *    Qur'an or hadith only when it carries the evidence of one: a Qur'an
 *    citation or verse marks, a hadith-collection citation with a number, a
 *    leading "Narrated", or a sunnah.com link. Merely MENTIONING the Qur'an,
 *    hadith, Muslim or the Prophet (ﷺ) does not count, so a scholar's words
 *    about a hadith stay a plain quote. A trailing reference such as
 *    "(Quran 15:9)" or "[Saheeh al-Bukhari 2743]" is moved into a <cite> at
 *    the end of the quote. In a plain quote, a short closing line that only
 *    names the speaker or source ("Abdullah bin al-Mubarak", "(Majmoo
 *    al-Fatawa 20/306)") becomes the <cite> too.
 * 4. Sections: each h2 gets data-n="01", "02"… for its index marker.
 *
 * Must run BEFORE rehype-heading-ids so the contents list is emoji-free.
 */
import { visit, SKIP } from 'unist-util-visit';

// Keycaps (1️⃣) first, then pictographs with their modifiers and joiners.
const KEYCAP = /[0-9#*]️?⃣/gu;
const EMOJI = /(?:(?![©®™])\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}]|‍|️|⃣)+/gu;
const ARABIC_RUN = new RegExp(`[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\\s\u064B-\u065F\u0670\u0640\u060C\u061B\u061F.:!«»"'()\\[\\]\uFD3E\uFD3F\u06DD-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\uFD3E]`, "gu");
const ARABIC_CHAR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/u;
const LATIN_CHAR = /[A-Za-z]/;

// Qur'an evidence. A trailing reference: "(Quran 2:185)", "(The Quran 2:256)",
// "[Quran, 4: 59]", "(Surah al-Ikhlas 112:1)", a bare "Quran 2:230", or just
// "(2:255)". Trailing punctuation after it is fine.
const QURAN_REF = String.raw`(?:the\s+)?(?:al-?)?(?:qur.?[aâ]n|surah|surat)\b[^()\[\]]{0,50}?\d{1,3}\s*[:：,]\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?`;
const QURAN_TAIL = new RegExp(String.raw`(?:[(\[]\s*${QURAN_REF}[^()\[\]]{0,20}[)\]]|(?:^|[\s.,"”])${QURAN_REF})[\s,.;:。*_]*$`, 'i');
const QURAN_NUM_TAIL = /[(\[]\s*\d{1,3}\s*[:：]\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?\s*[)\]][\s,.;:。]*$/;
// A leading label: "Quran 3:185: ..." (Arabic verse or translation under it).
const QURAN_HEAD = /^\s*(?:the\s+)?(?:al-?)?(?:qur.?[aâ]n|surah)\s*,?\s*\d{1,3}\s*[:：]\s*\d{1,3}/i;

// Hadith evidence. A collection AND a number: "(Sahih al-Bukhari 4362)",
// "Sunan Abu Dawood 2076", "(Muslim 135, 442; Ahmad 2/76)"; or a collection
// alone as the whole reference: "(Bukhari and Muslim)"; or a grade label:
// "(Authentic Hadith: ...)". A statement of a Companion or a scholar quoting
// "Sunan al-Kubra 2/10" is NOT a hadith.
const COLLECTION = String.raw`(?:bukh[aā]+r[iī]|muslim|(?:abu|abi|ab[uū])\s+d[aā]+w[uūo]+d|(?:at-?|al-?)?tirmidh[iī]|trimidhi|(?:an-?|al-?)?nas[aā]+['’]?[iī]|nasaee|ibn\s+m[aā]+jah|musnad\s+ahmad|muwatta)`;
const HADITH_NUM_TAIL = new RegExp(String.raw`(?:[(\[][^()\[\]]{0,30}\b${COLLECTION}\b[^()\[\]]{0,50}\d[^()\[\]]{0,50}[)\]]|\b(?:sahih|saheeh|sunan|jami.?)\s+(?:al-|at-|an-)?${COLLECTION}\b\s*,?\s*(?:no\.?\s*)?\d[\d,;:\s()\-–]*(?:[,;]?\s*(?:authentic|sahih|saheeh|hasan|da.?if)\b)?)[\s.*_]*$`, 'i');
const HADITH_ONLY_TAIL = new RegExp(String.raw`[(\[]\s*(?:narrated|reported|related|recorded)?\s*(?:by\s+)?(?:(?:sahih|saheeh)\s+)?(?:al-)?${COLLECTION}(?:\s*(?:,|and|&|;)\s*(?:(?:sahih|saheeh)\s+)?(?:al-)?${COLLECTION})*\s*[)\]][\s.*_]*$`, 'i');
const HADITH_GRADE_TAIL = /[(\[]\s*(?:authentic|sahih|saheeh|hasan|da.?if)\s+hadith/i;
// A leading "Narrated ..." or "It was narrated ...".
const HADITH_HEAD = /^\s*(?:it was\s+)?(?:narrated|reported)\b/i;
// An aside box written as a quote: "Note: ...", "It's important to note ...".
const NOTE_HEAD = /^\s*(?:note\s*[:：]|(?:it'?s|it is)\s+(?:important|worth)\s+(?:to\s+)?not(?:e|ing))/i;

function hasSunnahLink(node: any): boolean {
	let found = false;
	visit(node, 'element', (n: any) => {
		if (n.tagName === 'a' && /sunnah\.com/.test(String(n.properties?.href ?? ''))) found = true;
	});
	return found;
}

function classifyQuote(node: any, text: string): 'quran' | 'hadith' | 'note' | 'plain' {
	const t = text.replace(/\s+/g, ' ').trim();
	if (NOTE_HEAD.test(t)) return 'note';
	// Look at the end of the whole quote and of each paragraph (a verse may be
	// followed by the author's explanation).
	const paras = node.children.filter((c: any) => c.type === 'element' && c.tagName === 'p').map((p: any) => textOf(p).replace(/\s+/g, ' ').trim());
	const tails = [t.slice(-170), ...paras.map((p: string) => p.slice(-170))];
	// A reference to the Introduction (Muqaddimah) of a collection, such as
	// "Sahih Muslim, Introduction 32", cites a scholar's statement narrated
	// there, not a hadith, so it is not hadith evidence.
	const introRef = tails.some((x: string) => /\b(?:introduction|muqaddimah)\b/i.test(x));
	const hadithEvidence = !introRef && (HADITH_HEAD.test(t) || hasSunnahLink(node) || tails.some((x: string) => HADITH_NUM_TAIL.test(x) || HADITH_ONLY_TAIL.test(x) || HADITH_GRADE_TAIL.test(x)));
	const quranEvidence = /﴿/.test(t) || QURAN_HEAD.test(t) || tails.some((x: string) => QURAN_TAIL.test(x) || QURAN_NUM_TAIL.test(x));
	if (quranEvidence && !hadithEvidence) return 'quran';
	if (hadithEvidence) return 'hadith';
	return 'plain';
}

const CITATION =
	/\s*[(\[]\s*((?:quran|qur.?[aâ]n|surah|surat|saheeh|sahih|sunan|jami|musnad|muwatta|bukhari|muslim|tirmidhi|abu dawud|abu dawood|nasa|nasaee|ibn majah|al-bukhari)[^()[\]]{0,90}?)\s*[)\]]\s*[.。]?\s*$/i;

const SKIP_TAGS = new Set(['code', 'pre', 'svg', 'script', 'style', 'figure', 'math']);

function textOf(node: any): string {
	if (node.type === 'text') return node.value;
	if (!Array.isArray(node.children)) return '';
	return node.children.map(textOf).join('');
}

function stripEmoji(s: string): string {
	return s.replace(KEYCAP, '').replace(EMOJI, '');
}

/** Remove emojis (and the space after them) from the first text in `node`. */
function stripLeadingEmoji(node: any): void {
	let done = false;
	visit(node, 'text', (t: any) => {
		if (done) return SKIP;
		if (!t.value.trim()) return;
		t.value = stripEmoji(t.value).replace(/^\s+/, '');
		done = true;
		return SKIP;
	});
}

/** Wrap Arabic runs inside text nodes in <span lang="ar" dir="rtl">. */
function wrapArabic(parent: any): void {
	if (!Array.isArray(parent.children)) return;
	const out: any[] = [];
	for (const child of parent.children) {
		if (child.type === 'element') {
			if (SKIP_TAGS.has(child.tagName) || child.properties?.lang === 'ar') {
				out.push(child);
				continue;
			}
			wrapArabic(child);
			out.push(child);
			continue;
		}
		if (child.type !== 'text' || !ARABIC_CHAR.test(child.value)) {
			out.push(child);
			continue;
		}
		let last = 0;
		const v: string = child.value;
		for (const m of v.matchAll(ARABIC_RUN)) {
			const i = m.index ?? 0;
			if (i > last) out.push({ type: 'text', value: v.slice(last, i) });
			out.push({ type: 'element', tagName: 'span', properties: { lang: 'ar', dir: 'rtl' }, children: [{ type: 'text', value: m[0] }] });
			last = i + m[0].length;
		}
		if (last < v.length) out.push({ type: 'text', value: v.slice(last) });
	}
	parent.children = out;
}

/** A paragraph is a verse line when nearly all its letters are Arabic. */
function isMostlyArabic(node: any): boolean {
	const t = textOf(node);
	const ar = (t.match(new RegExp(ARABIC_CHAR, 'gu')) ?? []).length;
	const la = (t.match(/[A-Za-z]/g) ?? []).length;
	return ar > 3 && ar >= la * 4;
}

/**
 * Imported quotes often put the Arabic verse and its translation in ONE
 * paragraph separated by <br>. Split such a paragraph into line spans: an
 * Arabic line becomes span.q-ar (block, right-aligned verse), the rest
 * span.q-tr. Paragraphs without an Arabic line are left alone.
 */
function splitVerseLines(p: any): void {
	const groups: any[][] = [[]];
	for (const ch of p.children) {
		if (ch.type === 'element' && ch.tagName === 'br') groups.push([]);
		else groups[groups.length - 1].push(ch);
	}
	if (groups.length < 2) return;
	const isAr = (g: any[]) => isMostlyArabic({ type: 'element', children: g });
	if (!groups.some(isAr)) return;
	p.children = groups
		.filter((g) => g.some((n) => textOf(n).trim()))
		.map((g) =>
			isAr(g)
				? { type: 'element', tagName: 'span', properties: { className: ['q-ar'], lang: 'ar', dir: 'rtl' }, children: g }
				: { type: 'element', tagName: 'span', properties: { className: ['q-tr'] }, children: g }
		);
}

function addClass(node: any, cls: string): void {
	const c = node.properties.className;
	node.properties.className = Array.isArray(c) ? [...c, cls] : c ? [c, cls] : [cls];
}

/** Move a trailing "(Quran 15:9)"-style reference into a <cite>. */
function extractCitation(bq: any): string | null {
	const paras = bq.children.filter((c: any) => c.type === 'element');
	const last = paras[paras.length - 1];
	if (!last) return null;
	// A whole paragraph that is only a reference.
	const whole = textOf(last).trim();
	if (whole.length < 90 && /^[(\[]?.{0,90}[)\]]?$/.test(whole) && CITATION.test(' ' + (whole.startsWith('(') || whole.startsWith('[') ? whole : `(${whole})`)) && !LATIN_CHAR.test(whole.replace(CITATION, ''))) {
		const m = (' ' + (whole.startsWith('(') || whole.startsWith('[') ? whole : `(${whole})`)).match(CITATION);
		if (m) {
			bq.children.splice(bq.children.indexOf(last), 1);
			return m[1].trim();
		}
	}
	// Otherwise a trailing parenthetical in the last text node.
	let found: string | null = null;
	const texts: any[] = [];
	visit(last, 'text', (t: any) => {
		texts.push(t);
	});
	for (let i = texts.length - 1; i >= 0; i--) {
		if (!texts[i].value.trim()) continue;
		const m = texts[i].value.match(CITATION);
		if (m) {
			texts[i].value = texts[i].value.slice(0, m.index).replace(/[\s,–-]+$/, '');
			found = m[1].trim();
		}
		break;
	}
	return found;
}


/**
 * Plain quotes: when the last paragraph is only a short attribution (no
 * sentence of its own), take it out and return its text for the <cite>.
 * "Abdullah bin al-Mubarak", "— Imam al-Shafi'i", "(Majmoo al-Fatawa 20/306)".
 */
function extractAttribution(node: any): any[] | null {
	const ps = node.children.filter((c: any) => c.type === 'element' && c.tagName === 'p');
	if (ps.length < 2) return null;
	const last = ps[ps.length - 1];
	const raw = textOf(last).replace(/\s+/g, ' ').trim();
	if (!raw || raw.length > 110) return null;
	const wrapped = /^[(\[].*[)\]]\.?$/.test(raw);
	const dashed = /^[—–-]\s*\S/.test(raw);
	const sentence = /[.!?:”"’']$/.test(raw);
	if (!(wrapped || dashed || !sentence)) return null;
	node.children = node.children.filter((c: any) => c !== last);
	// Keep the paragraph's nodes (a citation may carry a link to the book);
	// only strip a leading dash and the wrapping brackets from its text.
	const kids = JSON.parse(JSON.stringify(last.children));
	const texts: any[] = [];
	visit({ type: 'root', children: kids }, 'text', (t: any) => {
		if (t.value.trim()) texts.push(t);
	});
	const firstText = texts[0];
	if (firstText) firstText.value = firstText.value.replace(/^\s*[—–-]\s*/, '').replace(/^\s*[(\[]\s*/, '');
	const lastText = texts[texts.length - 1];
	if (lastText) lastText.value = lastText.value.replace(/\s*[)\]]\.?\s*$/, '');
	return kids.filter((c: any) => c.type !== 'text' || c.value !== '');
}

export default function rehypeReading() {
	return (tree: any) => {
		let h2 = 0;
		visit(tree, 'element', (node: any) => {
			const tag = node.tagName;
			if (/^h[1-6]$/.test(tag)) {
				visit(node, 'text', (t: any) => {
					t.value = stripEmoji(t.value);
				});
				// Trim leading/trailing whitespace left behind by removed emojis.
				const first = node.children.find((c: any) => c.type === 'text');
				if (first) first.value = first.value.replace(/^\s+/, '');
				if (tag === 'h2') node.properties['dataN'] = String(++h2).padStart(2, '0');
				return;
			}
			if (tag === 'p' || tag === 'li') stripLeadingEmoji(node);
		});

		visit(tree, 'element', (node: any) => {
			if (node.tagName !== 'blockquote') return;
			const text = textOf(node);
			const kind = classifyQuote(node, text);
			const cite = kind === 'note' ? null : kind === 'plain' ? extractAttribution(node) : extractCitation(node);
			addClass(node, 'quote');
			addClass(node, `quote--${kind}`);
			// A short plain quote (a saying, one or two sentences) is set as a pull-quote.
			if (kind === 'plain' && text.replace(/\s+/g, ' ').trim().length <= 300) addClass(node, 'quote--pull');
			node.properties['dataLabel'] = kind === 'quran' ? 'Qur’an' : kind === 'hadith' ? 'Hadith' : '';
			for (const c of node.children) {
				if (c.type !== 'element' || c.tagName !== 'p') continue;
				if (isMostlyArabic(c)) {
					addClass(c, 'q-ar');
					c.properties.lang = 'ar';
					c.properties.dir = 'rtl';
				} else {
					splitVerseLines(c);
				}
			}
			if (cite) {
				const children = typeof cite === 'string' ? [{ type: 'text', value: cite }] : cite;
				node.children.push({ type: 'element', tagName: 'cite', properties: { className: ['q-cite'] }, children });
			}
			return SKIP;
		});

		wrapArabic(tree);
	};
}

export { stripEmoji };
