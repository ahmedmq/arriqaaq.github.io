import { posts, pages, tags, courses, books, POSTS_PER_PAGE } from '$lib/content';
import { SITE_URL } from '$lib/site';

export const prerender = true;

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function latest(list: { updated_at: string }[]): string | null {
	return list.reduce<string | null>((m, p) => (m && m > p.updated_at ? m : p.updated_at), null);
}

const abs = (u: string) => (u.startsWith('http') ? u : SITE_URL + u);

// Only canonical, indexable URLs belong here (Google: a sitemap lists the
// pages you want in search). Left out on purpose, each with a noindex:
// the author page (it repeats /articles/), topic pages with fewer than three
// articles (see tag/[slug]/+page.svelte), book reader pages and /design/.
const MIN_TAG_POSTS = 3;

export function GET() {
	const urls: { loc: string; lastmod?: string | null; images?: string[] }[] = [
		{ loc: `${SITE_URL}/`, lastmod: latest(posts) },
		{ loc: `${SITE_URL}/articles/`, lastmod: latest(posts) },
		{ loc: `${SITE_URL}/courses/` },
		{ loc: `${SITE_URL}/books/` }
	];
	for (const c of courses) {
		const lessons = new Set(c.modules.flatMap((m) => m.lessons.map((l) => l.slug)));
		urls.push({ loc: `${SITE_URL}/courses/${c.slug}/`, lastmod: latest(posts.filter((p) => lessons.has(p.slug))) });
	}
	for (const b of books) urls.push({ loc: `${SITE_URL}/books/${b.slug}/`, images: b.cover ? [abs(b.cover)] : [] });

	// Pagination — mirror src/routes/page/[n]/+page.ts exactly.
	const featuredCount = posts.filter((p) => p.featured).slice(0, 3).length;
	const totalPages = Math.ceil((posts.length - featuredCount) / POSTS_PER_PAGE);
	for (let n = 2; n <= totalPages; n++) urls.push({ loc: `${SITE_URL}/page/${n}/` });

	for (const p of [...posts, ...pages]) {
		urls.push({
			loc: `${SITE_URL}/${p.slug}/`,
			lastmod: p.updated_at,
			images: p.feature_image ? [abs(p.feature_image)] : []
		});
	}
	for (const t of tags) {
		const tagged = posts.filter((p) => p.tags.includes(t.id));
		if (tagged.length < MIN_TAG_POSTS) continue;
		urls.push({ loc: `${SITE_URL}/tag/${t.slug}/`, lastmod: latest(tagged) });
	}

	// A content page can share a path with a route (content/pages/courses.md
	// is shown inside /courses/): list each URL once.
	const seen = new Set<string>();
	const unique = urls.filter((u) => !seen.has(u.loc) && seen.add(u.loc));

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
		unique
			.map(
				(u) =>
					`<url><loc>${esc(u.loc)}</loc>${
						u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''
					}${(u.images ?? []).map((i) => `<image:image><image:loc>${esc(i)}</image:loc></image:image>`).join('')}</url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
