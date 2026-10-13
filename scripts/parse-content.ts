/**
 * Reads content/posts/*.md, content/pages/*.md, content/tags.yaml,
 * content/authors.yaml, content/settings.yaml — runs each markdown body
 * through a unified pipeline (frontmatter strip, directive→hast, raw HTML
 * passthrough, stringify) — emits typed JSON into src/lib/generated/ that
 * matches the shape the existing route loaders expect.
 *
 * Replaces scripts/parse-ghost.ts.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { all as allLanguages } from 'lowlight';
import rehypeStringify from 'rehype-stringify';
import remarkGhostCards from './remark-ghost-cards.js';
import remarkEmbedTokens, { createEmbedState, type EmbedState } from './remark-embed-tokens.js';
import rehypeHeadingIds, { createHeadingState, type TocEntry } from './rehype-heading-ids.js';
import rehypeReading, { stripEmoji } from './rehype-reading.js';
import rehypeScholars from './rehype-scholars.js';
import { SCHOLARS, scholarPattern, matchedScholar } from '../src/lib/data/scholars.js';
import { parse as parseHtml } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_DIR = resolve(ROOT, 'content/posts');
const PAGES_DIR = resolve(ROOT, 'content/pages');
const TAGS_FILE = resolve(ROOT, 'content/tags.yaml');
const AUTHORS_FILE = resolve(ROOT, 'content/authors.yaml');
const SETTINGS_FILE = resolve(ROOT, 'content/settings.yaml');
const COURSES_DIR = resolve(ROOT, 'content/courses');
const BOOKS_DIR = resolve(ROOT, 'content/books');
const OUT_DIR = resolve(ROOT, 'src/lib/generated');

const RESERVED_SLUGS = new Set([
	'tag',
	'author',
	'page',
	'rss',
	'sitemap.xml',
	'rss.xml',
	'llms.txt',
	'llms-full.txt'
]);

type ParsedPost = {
	id: string;
	uuid: string;
	type: 'post' | 'page';
	slug: string;
	title: string;
	html: string;
	plaintext: string;
	feature_image: string | null;
	custom_excerpt: string | null;
	published_at: string;
	updated_at: string;
	reading_time: number;
	featured: boolean;
	visibility: string;
	show_title_and_feature_image: boolean;
	custom_template: string | null;
	tags: string[];
	primary_tag: string | null;
	authors: string[];
	primary_author: string | null;
	toc: TocEntry[];
	words: number;
	diagram_count: number;
	widgets: string[];
	/** Meta description: frontmatter `description`, else derived (seoDescription). */
	description: string;
	/** <title> text: frontmatter `seo_title`, else derived (seoTitle). */
	seo_title: string;
	/** Old slugs (frontmatter `redirect_from`) that 301 to this one. */
	aliases: string[];
};

function createProcessor(embedState: EmbedState, headingState: { toc: TocEntry[] }, scholars = false) {
	return unified()
		.use(remarkParse)
		.use(remarkDirective)
		.use(remarkGhostCards)
		.use(remarkEmbedTokens, embedState)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeHighlight, { languages: allLanguages, detect: false })
		.use(rehypeReading)
		.use(rehypeScholars, { enabled: scholars })
		.use(rehypeHeadingIds, headingState)
		.use(rehypeStringify, { allowDangerousHtml: true });
}

function readingTime(text: string): number {
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 265));
}

function deterministicId(slug: string): string {
	const h = createHash('sha1').update(slug).digest('hex');
	return h.slice(0, 24);
}

function deterministicUuid(slug: string): string {
	const h = createHash('sha1').update('uuid:' + slug).digest('hex');
	return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-');
}

function htmlToPlaintext(html: string): string {
	return html
		.replace(/<style[^>]*>.*?<\/style>/gis, '')
		.replace(/<script[^>]*>.*?<\/script>/gis, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[a-z#0-9]+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function countWords(html: string): number {
	return html
		.replace(/<pre[\s\S]*?<\/pre>/g, ' ')
		.replace(/<div class="wd-static">[\s\S]*?<\/div>/g, ' ') // no-JS fallbacks of widgets repeat the widget's data
		.replace(/<svg[\s\S]*?<\/svg>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[a-z#0-9]+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.split(' ')
		.filter(Boolean).length;
}

// Strict leftover scan — only our token shapes, so legacy bracket prose never trips it.
const LEFTOVER = /\[\[(?:SVG|WIDGET):[a-z0-9-]+\]\]|::(?:bookmark|image|embed|gallery|callout|toggle)\{/g;

/**
 * Leaf directives (::bookmark{…}) must sit on one line, but some imported
 * posts wrap a long attribute value across lines. Join a directive's lines
 * until its closing brace so it parses instead of rendering as raw text.
 */
/** Old Ghost image URLs on our own domain → the local /images/ copies. */
function localiseGhostImages(md: string): string {
	return md.replace(/https?:\/\/(?:www\.)?arriqaaq\.com\/content\/images\/(?:size\/w\d+(?:h\d+)?\/)?/g, '/images/');
}

function joinDirectiveLines(md: string): string {
	return md.replace(/^(::[a-z]+\{)([^}]*)\}/gm, (_m, head: string, attrs: string) => `${head}${attrs.replace(/\s*\n\s*/g, ' ')}}`);
}

type ParsedFile = {
	fm: any;
	source: string;
	html: string;
	plaintext: string;
	toc: TocEntry[];
	words: number;
	diagram_count: number;
	widgets: string[];
	embedErrors: string[];
};

async function parseFile(file: string): Promise<ParsedFile> {
	const raw = readFileSync(file, 'utf8');
	const parsed = matter(raw);
	const embedState = createEmbedState();
	const headingState = createHeadingState();
	const processor = createProcessor(embedState, headingState, ((parsed.data.tags ?? []) as string[]).includes('hadith'));
	const tree = await processor.run(processor.parse(localiseGhostImages(joinDirectiveLines(parsed.content))));
	const html = processor.stringify(tree as any).toString();
	const plaintext = htmlToPlaintext(html);
	const leftovers = html.match(LEFTOVER) ?? [];
	return {
		fm: parsed.data,
		source: parsed.content,
		html,
		plaintext,
		toc: headingState.toc,
		words: countWords(html),
		diagram_count: embedState.usedSvgs.length,
		widgets: embedState.mounts.map((m) => m.name),
		embedErrors: [...embedState.errors, ...leftovers]
	};
}

async function readMdDir(dir: string): Promise<({ slug: string } & ParsedFile)[]> {
	if (!existsSync(dir)) return [];
	const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
	const out = [];
	for (const f of files) {
		const slug = basename(f, '.md');
		if (RESERVED_SLUGS.has(slug)) {
			console.warn(`SKIP reserved slug: "${slug}"`);
			continue;
		}
		const r = await parseFile(resolve(dir, f));
		out.push({ slug, ...r });
	}
	return out;
}

function loadYaml<T = any>(file: string, fallback: T): T {
	if (!existsSync(file)) return fallback;
	return (yaml.load(readFileSync(file, 'utf8')) as T) ?? fallback;
}

function deriveExcerpt(plaintext: string, max = 200): string | null {
	if (!plaintext) return null;
	const trimmed = plaintext.trim();
	if (trimmed.length <= max) return trimmed;
	return trimmed.slice(0, max).replace(/\s+\S*$/, '').trim() + '…';
}

/**
 * Meta description, 70–160 characters where possible. Google rewrites weak
 * snippets, and a description cut mid-word or pulled from a bookmark card
 * reads badly in results. Prefers the frontmatter `description`, then a long
 * enough `excerpt`, then the first real paragraphs of the body.
 */
function seoDescription(fm: any, html: string, max = 160): string {
	const clean = (s: string) => stripEmoji(String(s)).replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
	const cut = (s: string) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, '').replace(/[\s,;:–-]+$/, '') + '…');
	// Join sentences, adding a full stop only where the first has no closing punctuation.
	const join = (a: string, b: string) => (a ? `${/[.!?…:"”)]$/.test(a) ? a : a + '.'} ${b}` : b);
	if (fm.description) return cut(clean(fm.description));
	const excerpt = fm.excerpt ? clean(fm.excerpt) : '';
	if (excerpt.length >= 70) return cut(excerpt);
	const root = parseHtml(html);
	root.querySelectorAll('figure, aside, nav, svg, pre, table, blockquote, details, [class*="kg-"], [class*="wd-"], [class*="pause"]').forEach((n) => n.remove());
	let text = '';
	for (const p of root.querySelectorAll('p')) {
		const t = clean(p.text);
		// Skip short lines and the opening basmala, which every series part shares.
		if (t.length < 40 || /^In the Name of Allah\b/i.test(t)) continue;
		text = join(text, t);
		if (text.length >= 110) break;
	}
	if (excerpt && text && !text.startsWith(excerpt)) text = join(excerpt, text);
	return cut(text || excerpt);
}

/**
 * <title> text. Series posts lead with the topic ("What is Istihsan? |
 * Usul al-Fiqh Part 11") because Google shows about 60 characters and the
 * topic is what people search for. The page's own h1 is unchanged.
 */
function seoTitle(fm: any, title: string): string {
	if (fm.seo_title) return stripEmoji(String(fm.seo_title)).trim();
	const t = title.replace(/^["“]+|["”]+$/g, '').replace(/\s+/g, ' ').trim();
	const m = t.match(/^(Usul[- ]Al[- ]Fiqh|Mustalah Hadith) Made Easy\s*\(Part (\d+)\)\s*[-–:]?\s*(.+)$/i);
	if (m) {
		const series = /^usul/i.test(m[1]) ? 'Usul al-Fiqh' : 'Mustalah Hadith';
		return `${m[3]} | ${series} Part ${m[2]}`;
	}
	return t;
}

async function main() {
	mkdirSync(OUT_DIR, { recursive: true });

	const tagsRaw = loadYaml<Record<string, any>>(TAGS_FILE, {});
	const authorsRaw = loadYaml<Record<string, any>>(AUTHORS_FILE, {});
	const settingsRaw = loadYaml<any>(SETTINGS_FILE, {});
	const siteUrl = String(settingsRaw.url ?? 'https://arriqaaq.com').replace(/\/+$/, '');

	const tags = Object.entries(tagsRaw).map(([slug, t]: [string, any]) => ({
		id: deterministicId('tag:' + slug),
		slug,
		name: t.name,
		description: t.description ?? null,
		feature_image: t.feature_image ?? null,
		post_count: 0
	}));
	const tagBySlug = new Map(tags.map((t) => [t.slug, t]));

	const authors = Object.entries(authorsRaw).map(([slug, a]: [string, any]) => ({
		id: deterministicId('author:' + slug),
		slug,
		name: a.name,
		bio: a.bio ?? null,
		profile_image: a.profile_image ?? null,
		cover_image: a.cover_image ?? null,
		website: a.website ?? null,
		twitter: a.twitter ?? null
	}));
	const authorBySlug = new Map(authors.map((a) => [a.slug, a]));

	const postFiles = await readMdDir(POSTS_DIR);
	const pageFiles = await readMdDir(PAGES_DIR);

	function buildPost(rec: { slug: string } & ParsedFile): ParsedPost {
		const fm = rec.fm;
		const tagSlugs: string[] = (fm.tags ?? []).filter((s: string) => tagBySlug.has(s));
		const authorSlugs: string[] = (fm.authors ?? []).filter((s: string) => authorBySlug.has(s));
		for (const ts of tagSlugs) tagBySlug.get(ts)!.post_count++;

		const tagIds = tagSlugs.map((s) => tagBySlug.get(s)!.id);
		const authorIds = authorSlugs.map((s) => authorBySlug.get(s)!.id);

		return {
			id: deterministicId('post:' + rec.slug),
			uuid: deterministicUuid(rec.slug),
			type: (fm.type as 'post' | 'page') ?? 'post',
			slug: rec.slug,
			title: stripEmoji(String(fm.title ?? '')).replace(/^[\s:–-]+|\s+$/g, ''),
			html: rec.html,
			plaintext: rec.plaintext,
			feature_image: fm.feature_image ?? null,
			custom_excerpt: fm.excerpt ?? null,
			published_at: typeof fm.published === 'string' ? fm.published : new Date(fm.published).toISOString(),
			updated_at:
				typeof fm.updated === 'string'
					? fm.updated
					: fm.updated
						? new Date(fm.updated).toISOString()
						: typeof fm.published === 'string'
							? fm.published
							: new Date(fm.published).toISOString(),
			reading_time: typeof fm.reading_time === 'number' ? fm.reading_time : readingTime(rec.plaintext),
			featured: !!fm.featured,
			visibility: fm.visibility ?? 'public',
			show_title_and_feature_image: fm.show_title_and_feature_image !== false,
			custom_template: fm.custom_template ?? null,
			tags: tagIds,
			primary_tag: tagIds[0] ?? null,
			authors: authorIds,
			primary_author: authorIds[0] ?? null,
			toc: rec.toc,
			words: rec.words,
			diagram_count: rec.diagram_count,
			widgets: rec.widgets,
			description: seoDescription(fm, rec.html),
			seo_title: seoTitle(fm, stripEmoji(String(fm.title ?? '')).replace(/^[\s:–-]+|\s+$/g, '')),
			aliases: ((fm.redirect_from ?? []) as string[]).map((a) => String(a).replace(/^\/+|\/+$/g, ''))
		};
	}

	// Fail the build loudly on unresolved/unknown [[SVG:…]]/[[WIDGET:…]] tokens.
	const embedFailures = [...postFiles, ...pageFiles]
		.filter((r) => r.embedErrors.length > 0)
		.map((r) => `  ${r.slug}: ${r.embedErrors.join(', ')}`);
	if (embedFailures.length > 0) {
		console.error('Unresolved embed tokens:\n' + embedFailures.join('\n'));
		process.exit(1);
	}

	const posts = postFiles.map(buildPost).sort((a, b) =>
		a.published_at < b.published_at ? 1 : -1
	);
	const pages = pageFiles.map(buildPost).sort((a, b) =>
		a.published_at < b.published_at ? 1 : -1
	);

	const tagsOut = tags.filter((t) => t.post_count > 0).sort((a, b) => b.post_count - a.post_count);

	const postBySlugMap = new Map(posts.map((p) => [p.slug, p]));
	const pageBySlugMap = new Map(pages.map((p) => [p.slug, p]));

	// Markdown mirrors: raw frontmatter-stripped source with a small metadata
	// header, keyed by slug. Emitted as its own JSON so only build-time
	// endpoints import it — never the client bundle.
	const markdown: Record<string, string> = {};
	for (const rec of [...postFiles, ...pageFiles]) {
		const doc = postBySlugMap.get(rec.slug) ?? pageBySlugMap.get(rec.slug);
		if (!doc) continue;
		const tagNames = ((rec.fm.tags ?? []) as string[])
			.map((s) => tagBySlug.get(s)?.name)
			.filter(Boolean);
		const authorName = rec.fm.authors?.[0]
			? (authorBySlug.get(rec.fm.authors[0])?.name ?? null)
			: null;
		const header = [
			'---',
			`title: ${JSON.stringify(doc.title)}`,
			`canonical: ${siteUrl}/${doc.slug}/`,
			`published: ${doc.published_at}`,
			`updated: ${doc.updated_at}`,
			tagNames.length ? `tags: [${tagNames.map((n) => JSON.stringify(n)).join(', ')}]` : null,
			authorName ? `author: ${JSON.stringify(authorName)}` : null,
			'---'
		].filter(Boolean);
		markdown[doc.slug] = `${header.join('\n')}\n\n# ${doc.title}\n\n${rec.source.trim()}\n`;
	}

	const settings = {
		title: settingsRaw.title ?? 'Site',
		url: siteUrl,
		description: settingsRaw.description ?? '',
		logo: settingsRaw.logo ?? null,
		icon: settingsRaw.icon ?? null,
		cover_image: settingsRaw.cover_image ?? null,
		navigation: settingsRaw.navigation ?? [],
		secondary_navigation: settingsRaw.secondary_navigation ?? []
	};

	// Courses: an ordered route over existing posts (content/courses/*.yaml).
	// Every lesson slug must resolve to a post, or the build fails.
	const SUBJECTS = new Set(['tajweed', 'nahw', 'aqeedah', 'hadith', 'fiqh', 'tafsir', 'general']);
	const postBySlugOut = new Map(posts.map((p: any) => [p.slug, p]));
	const courseErrors: string[] = [];
	const courses = (existsSync(COURSES_DIR) ? readdirSync(COURSES_DIR) : [])
		.filter((f) => /\.ya?ml$/.test(f))
		.sort()
		.map((f) => {
			const c: any = yaml.load(readFileSync(resolve(COURSES_DIR, f), 'utf8'));
			if (!SUBJECTS.has(c.subject)) courseErrors.push(`${f}: unknown subject "${c.subject}"`);
			let n = 0;
			const modules = (c.modules ?? []).map((m: any) => ({
				title: m.title,
				blurb: m.blurb ?? null,
				lessons: (m.lessons ?? []).map((l: any) => {
					const post: any = postBySlugOut.get(l.slug);
					if (!post) courseErrors.push(`${f}: lesson "${l.slug}" has no post`);
					n += 1;
					return {
						n,
						slug: l.slug,
						title: l.title ?? post?.title ?? l.slug,
						excerpt: post?.custom_excerpt ?? null,
						minutes: Math.max(1, Math.round((post?.words ?? 0) / 200))
					};
				})
			}));
			return {
				slug: c.slug,
				title: c.title,
				arabic: c.arabic ?? null,
				subject: c.subject,
				code: c.code ?? null,
				tagline: c.tagline ?? '',
				outcome: c.outcome ?? '',
				level: c.level ?? null,
				lesson_count: n,
				minutes: modules.reduce(
					(t: number, m: any) => t + m.lessons.reduce((u: number, l: any) => u + l.minutes, 0),
					0
				),
				modules
			};
		});
	if (courseErrors.length) {
		throw new Error('Course manifest errors:\n  ' + courseErrors.join('\n  '));
	}


	// Books: one YAML per book (content/books/*.yaml, schema in DESIGN.md → Books).
	// Cover and preview images are rendered ahead of time by `npm run books:render`
	// and recorded in content/books/media.json; this step only validates and joins.
	const SHELVES = new Set(['hadith', 'tafsir', 'family', 'history', 'children']);
	const mediaPath = resolve(BOOKS_DIR, 'media.json');
	const bookMedia: Record<string, any> = existsSync(mediaPath) ? JSON.parse(readFileSync(mediaPath, 'utf8')) : {};
	const bookErrors: string[] = [];
	const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, '');
	const books = (existsSync(BOOKS_DIR) ? readdirSync(BOOKS_DIR) : [])
		.filter((f) => /\.ya?ml$/.test(f))
		.sort()
		.map((f) => {
			const b: any = yaml.load(readFileSync(resolve(BOOKS_DIR, f), 'utf8'));
			const post: any = postBySlugOut.get(b.post);
			if (!post) bookErrors.push(`${f}: post "${b.post}" does not exist`);
			if (!SHELVES.has(b.shelf)) bookErrors.push(`${f}: unknown shelf "${b.shelf}"`);
			const m = bookMedia[b.slug];
			if (!m) bookErrors.push(`${f}: no entry in media.json, run npm run books:render`);
			const hosted = (p: string) => existsSync(resolve(ROOT, 'static' + p));
			// Every book is read on the site, from its own PDF in static/books/.
			const pdfs = (b.editions ?? [{ lang: null, pdf: b.pdf }]).map((e: any) => {
				if (!e.pdf || !hosted(e.pdf)) bookErrors.push(`${f}: ${e.pdf ?? 'no pdf'} is not in static/`);
				return { lang: e.lang ?? null, ar: !!e.ar, href: e.pdf };
			});
			const external = b.read ? { label: /academia\.edu$/.test(hostOf(b.read)) ? 'Also on Academia' : 'Also online', href: b.read } : null;
			for (const n of b.preview ?? []) if (m?.pdf && !m.previews.includes(n)) bookErrors.push(`${f}: preview page ${n} not rendered`);
			return {
				slug: b.slug,
				title: b.title,
				line: b.line,
				authors: b.authors,
				illustrator: b.illustrator ?? null,
				shelf: b.shelf,
				year: b.year,
				year_note: b.year_note ?? null,
				extra: b.extra ?? null,
				pages: m?.pages ?? b.pages ?? null,
				cover: m?.cover ?? null,
				ratio: m?.ratio ?? 0.667,
				page_ratio: m?.page_ratio ?? m?.ratio ?? 0.707,
				pdfs,
				external,
				print: b.print ?? null,
				previews: (m?.previews ?? []).map((n: number) => ({ n, src: `/images/books/${b.slug}/p-${n}.jpg` })),
				cover_is_page_one: b.page_one_is_cover ?? (!b.cover?.image && (b.cover_page ?? 1) === 1 && !!m?.pdf),
				quote: b.quote ?? null,
				quote_cite: b.quote_cite ?? null,
				inside: b.inside ?? [],
				post: b.post,
				post_title: post?.title?.replace(/^[^A-Za-z]+/, '') ?? b.post
			};
		});
	if (bookErrors.length) throw new Error('Book manifest errors:\n  ' + bookErrors.join('\n  '));
	writeFileSync(resolve(OUT_DIR, 'books.json'), JSON.stringify(books, null, '\t'));

	writeFileSync(resolve(OUT_DIR, 'courses.json'), JSON.stringify(courses, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'posts.json'), JSON.stringify(posts, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'pages.json'), JSON.stringify(pages, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'tags.json'), JSON.stringify(tagsOut, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'authors.json'), JSON.stringify(authors, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'settings.json'), JSON.stringify(settings, null, '\t'));
	// Scholar cards: for each scholar, the posts that mention him by name.
	const scholarPosts: Record<string, { slug: string; title: string }[]> = Object.fromEntries(SCHOLARS.map((sc) => [sc.id, []]));
	for (const post of posts) {
		const ids = new Set<string>();
		for (const m of post.plaintext.matchAll(scholarPattern())) {
			const sc = matchedScholar(m);
			if (sc) ids.add(sc.id);
		}
		for (const id of ids) scholarPosts[id].push({ slug: post.slug, title: post.title });
	}
	writeFileSync(resolve(OUT_DIR, 'scholars.json'), JSON.stringify(scholarPosts, null, '\t'));
	writeFileSync(resolve(OUT_DIR, 'markdown.json'), JSON.stringify(markdown, null, '\t'));

	// Redirects: every old slug (frontmatter `redirect_from`) → its post. Used
	// by functions/_middleware.js (a real 301 on Cloudflare Pages, where
	// _redirects does not run for Function-routed requests) and by
	// scripts/write-redirects.ts (static fallback pages for any other host).
	const redirects: Record<string, string> = {};
	const live = new Set([...posts, ...pages].map((p) => p.slug));
	for (const p of [...posts, ...pages]) {
		for (const a of p.aliases) {
			if (live.has(a)) throw new Error(`redirect_from "${a}" on ${p.slug} is a live slug`);
			if (redirects[a]) throw new Error(`redirect_from "${a}" is claimed twice`);
			redirects[a] = p.slug;
		}
	}
	writeFileSync(resolve(OUT_DIR, 'redirects.json'), JSON.stringify(redirects, null, '\t'));
	writeFileSync(
		resolve(ROOT, 'functions/lib/redirects.js'),
		'// Generated by scripts/parse-content.ts from frontmatter `redirect_from`. Do not edit.\n' +
			`export const REDIRECTS = ${JSON.stringify(redirects, null, '\t')};\n`
	);

	console.log(
		`Parsed: ${posts.length} posts, ${pages.length} pages, ${tagsOut.length} tags, ${authors.length} authors, ${courses.length} courses, ${books.length} books`
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
