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
 *    quote (class "quote quote--quran|hadith|plain", data-label). A trailing
 *    reference such as "(Quran 15:9)" or "[Saheeh al-Bukhari 2743]" is moved
 *    into a <cite> at the end of the quote.
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

const QURAN = /\b(qur.?[aâ]n|surah|surat|ayah|ayat)\b|﴿|\[\s*\d{1,3}\s*[:：]\s*\d{1,3}\s*\]|\(\s*\d{1,3}\s*[:：]\s*\d{1,3}\s*\)/i;
const HADITH = /\b(bukh[aā]r[iī]|muslim|tirmidh[iī]|ab[uū] d[aā]w[uū]d|abu dawood|nas[aā]['’]?[iī]|nasaee|ibn m[aā]jah|muwatta|musnad|narrated|hadith|ḥadīth|sa?h[iī]h|saheeh|sunan)\b|ﷺ/i;
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
			const kind = QURAN.test(text) ? 'quran' : HADITH.test(text) ? 'hadith' : 'plain';
			const cite = kind === 'plain' ? null : extractCitation(node);
			addClass(node, 'quote');
			addClass(node, `quote--${kind}`);
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
				node.children.push({ type: 'element', tagName: 'cite', properties: { className: ['q-cite'] }, children: [{ type: 'text', value: cite }] });
			}
			return SKIP;
		});

		wrapArabic(tree);
	};
}

export { stripEmoji };
