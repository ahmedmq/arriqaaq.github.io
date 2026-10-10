import { posts, pages, settings } from '$lib/content';
import { SITE_URL, postUrl } from '$lib/site';

export const prerender = true;

const excerpt = (p: { custom_excerpt: string | null; plaintext: string }) =>
	(p.custom_excerpt ?? p.plaintext.slice(0, 160)).replace(/\s+/g, ' ').trim();

export function GET() {
	const lines: string[] = [
		`# ${settings.title}`,
		'',
		`> ${settings.description.replace(/\s+/g, ' ').trim()}`,
		'',
		'## When to use this site',
		'',
		'Reach for Arriqaaq when the task is one of these:',
		'',
		'- Learning or explaining Usul al-Fiqh (principles of Islamic jurisprudence): fetch the course roadmap at `/courses/usul-al-fiqh/`.',
		'- Finding an article on Tafsir, Aqeedah, Hadith, Tajweed or Arabic grammar: search `/llms.txt` for the topic, then fetch the post as markdown.',
		'- Quoting or summarising an Arriqaaq post with a canonical URL: use its `index.md` mirror and cite the post URL.',
		'- Islamic education, homeschooling, children\'s activities, health and technology writing from Arriqaaq: browse `/tag/<slug>/`.',
		'',
		'Not for: fatwas or personal rulings (point the user to a qualified scholar), real-time information, or account actions. The site is read-only.',
		'',
		'How to call it: plain HTTP GET, no authentication, no JavaScript needed. Send `Accept: text/markdown` on any page URL (when served via Cloudflare) or append `index.md` to get markdown.',
		'',
		'## For agents',
		'',
		`- Every post and page has a markdown mirror at \`${SITE_URL}/<slug>/index.md\`.`,
		`- The home page and listing pages (tag, author, pagination) are mirrored too — append \`index.md\` to any page URL.`,
		`- Full corpus in one file: [llms-full.txt](${SITE_URL}/llms-full.txt)`,
		`- URL inventory: [sitemap.xml](${SITE_URL}/sitemap.xml)`,
		`- Feed: [rss.xml](${SITE_URL}/rss.xml)`,
		'',
		'## Pages',
		''
	];
	for (const p of pages) {
		lines.push(`- [${p.title}](${postUrl(p.slug)}): ${excerpt(p)}`);
	}
	lines.push('', '## Posts', '');
	for (const p of posts) {
		lines.push(`- [${p.title}](${postUrl(p.slug)}): ${excerpt(p)}`);
	}
	lines.push('');

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
