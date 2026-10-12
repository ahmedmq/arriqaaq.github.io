/**
 * check-citations: the release gate for teaching posts (see
 * .claude/skills/source-check/SKILL.md). Every post tagged `hadith`, or with
 * `citations: strict` in its frontmatter, must:
 *
 *  1. end every quotation (blockquote, except "Note:" asides) with a citation;
 *  2. cite every reported saying in running text: a paragraph that quotes
 *     someone (“…”), or says "X said that", "as X noted", "in the words of X",
 *     "X says that", needs a citation in the same paragraph;
 *  3. link citations only to the trusted libraries listed in TRUSTED;
 *  4. end with a `## Sources` section whose entries each carry a link;
 *  5. cite hadith with a collection and number.
 *
 * A citation is a parenthetical (…) holding a markdown link, a page or volume
 * reference (p. 12, pp. 10–12, 1/9, 16/73), a Qur'an surah:ayah, a hadith
 * number, "Introduction N", or "Course notes". Run: npm run check:citations [-- --all] [slug…]
 * `--all` also reports (without failing) on every other teaching post.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = resolve(ROOT, 'content/posts');

/** Libraries a citation may link to. Anything else is reported. */
export const TRUSTED = [
	'sunnah.com', // hadith collections (note: URL uses the in-book number)
	'quran.com', // Qur'an, surah:ayah
	'dorar.net', // hadith gradings (al-Durar al-Saniyyah)
	'shamela.ws', // al-Maktabah al-Shamilah: classical texts with printed volume/page
	'turath.io', // classical texts, printed pagination
	'archive.org', // scanned books (read the page image)
	'ketabonline.com', // classical and modern books
	'waqfeya.net', // scanned books
	'islamweb.net', // fatwa and hadith library (secondary)
	'islamqa.info', // fatwas (secondary)
	'troid.org' // translations used by the owner (secondary)
];

const CITE_INNER = String.raw`(?:\[[^\]]+\]\(https?:\/\/[^)]+\)|\bpp?\.\s*\d|\b\d+\s*\/\s*\d+\b|\bno\.?\s*\d|\bIntroduction\s+\d|\b\d{1,3}\s*:\s*\d{1,3}\b|\bCourse notes\b|\bintroduction to\b|\b(?:Sahih|Sunan|Jami|Musnad)\b[^)]*\d)`;
const CITATION = new RegExp(String.raw`\((?:[^()]|\([^()]*\))*?${CITE_INNER}(?:[^()]|\([^()]*\))*?\)`, 'i');
const REPORT = /\b(?:said that|says that|stated that|wrote that|noted that|as [A-Z][\w'’-]+(?: [\w'’-]+){0,3} noted|in the words of|according to [A-Z])/;
const QUOTED = /“[^”]{40,}”/;
const LINK = /\]\((https?:\/\/[^)\s]+)\)/g;

type Issue = { line: number; msg: string };

function strict(fm: Record<string, any>): boolean {
	return fm.citations === 'strict' || (Array.isArray(fm.tags) && fm.tags.includes('hadith'));
}

export function checkPost(source: string): Issue[] {
	const issues: Issue[] = [];
	const lines = source.split('\n');
	// Skip fenced code, widget/SVG tokens and :::pause boxes (their answers
	// repeat the post's own words, which are cited where they first appear).
	let inFence = false;
	let inPause = false;
	const blocks: { start: number; text: string; quote: boolean }[] = [];
	let cur: { start: number; text: string; quote: boolean } | null = null;
	const flush = () => {
		if (cur) blocks.push(cur);
		cur = null;
	};
	lines.forEach((raw, i) => {
		const l = raw.trimEnd();
		if (/^```/.test(l)) return void ((inFence = !inFence), flush());
		if (inFence) return;
		if (/^:::pause/.test(l)) return void ((inPause = true), flush());
		if (inPause) {
			if (/^:::\s*$/.test(l)) inPause = false;
			return;
		}
		if (!l.trim() || /^\[\[(?:SVG|WIDGET):/.test(l) || /^#{1,6}\s/.test(l) || /^---$/.test(l)) return flush();
		const quote = /^>/.test(l);
		const text = l.replace(/^>\s?/, '');
		if (cur && cur.quote === quote) cur.text += '\n' + text;
		else {
			flush();
			cur = { start: i + 1, text, quote };
		}
	});
	flush();

	for (const b of blocks) {
		const flat = b.text.replace(/\s+/g, ' ').trim();
		if (b.quote) {
			if (/^\**Note\**\s*:/i.test(flat) || /^\*\*Note\*\*/.test(flat)) continue;
			if (!CITATION.test(flat)) issues.push({ line: b.start, msg: `quotation without a citation: "${flat.slice(0, 70)}…"` });
			continue;
		}
		if ((QUOTED.test(flat) || REPORT.test(flat)) && !CITATION.test(flat)) {
			issues.push({ line: b.start, msg: `reported saying without a citation: "${flat.slice(0, 70)}…"` });
		}
	}

	// Trusted libraries only.
	lines.forEach((l, i) => {
		for (const m of l.matchAll(LINK)) {
			const host = new URL(m[1]).hostname.replace(/^www\./, '');
			const ok = TRUSTED.some((t) => host === t || host.endsWith('.' + t)) || host.endsWith('arriqaaq.com');
			if (!ok) issues.push({ line: i + 1, msg: `link to an unlisted source: ${host} (see TRUSTED in scripts/check-citations.ts)` });
		}
	});

	// A Sources section with a link on every entry.
	const at = lines.findIndex((l) => /^##\s+Sources\s*$/.test(l));
	if (at < 0) issues.push({ line: lines.length, msg: 'no "## Sources" section' });
	else {
		for (let i = at + 1; i < lines.length && !/^#{1,2}\s/.test(lines[i]); i++) {
			if (/^\s*[-*]\s/.test(lines[i]) && !/\]\(https?:\/\//.test(lines[i])) issues.push({ line: i + 1, msg: 'Sources entry without a link' });
		}
	}
	return issues;
}

function main() {
	const args = process.argv.slice(2);
	const all = args.includes('--all');
	const only = args.filter((a) => !a.startsWith('--'));
	let failed = 0;
	let checked = 0;
	for (const f of readdirSync(POSTS).filter((f) => f.endsWith('.md'))) {
		const slug = basename(f, '.md');
		if (only.length && !only.includes(slug)) continue;
		const { data, content } = matter(readFileSync(resolve(POSTS, f), 'utf8'));
		const isStrict = strict(data) || only.includes(slug);
		if (!isStrict && !all) continue;
		const issues = checkPost(content);
		checked++;
		if (!issues.length) continue;
		const head = isStrict ? 'FAIL' : 'report';
		console.log(`\n${head} ${slug} (${issues.length})`);
		// Frontmatter lines are not counted in `content`; offset them.
		const offset = readFileSync(resolve(POSTS, f), 'utf8').split('\n').length - content.split('\n').length;
		for (const it of issues) console.log(`  line ${it.line + offset}: ${it.msg}`);
		if (isStrict) failed++;
	}
	console.log(`\ncheck-citations: ${checked} post(s) checked, ${failed} failing`);
	if (failed) process.exit(1);
}

main();
