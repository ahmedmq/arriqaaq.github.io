import { settings } from '$lib/content';

// Canonical origin, no trailing slash. Never use page.url.origin for
// canonical URLs — during prerender it is http://sveltekit-prerender.
export const SITE_URL = settings.url;

export const absUrl = (path: string) => SITE_URL + path;

// Page URLs always end with '/' (trailingSlash: 'always') — avoids GH Pages 301s.
export const postUrl = (slug: string) => `${SITE_URL}/${slug}/`;

/** Branded 1200x630 share card, the og:image for pages without their own image. */
export const DEFAULT_OG_IMAGE = '/og/default.png';

/** Public source repository: where readers report issues or suggest fixes. */
export const REPO_URL = 'https://github.com/arriqaaq/arriqaaq.github.io';
export const ISSUES_URL = `${REPO_URL}/issues/new`;
/** Edit link for a post or page source file on GitHub. */
export const editUrl = (slug: string, type: 'post' | 'page') =>
	`${REPO_URL}/edit/main/content/${type === 'post' ? 'posts' : 'pages'}/${slug}.md`;

/**
 * Page <title>: "Topic — Arriqaaq" when that fits in the ~60 characters
 * Google shows, otherwise the topic alone so the useful words are not cut.
 */
export const pageTitle = (t: string) => {
	const full = `${t} — ${settings.title}`;
	return full.length <= 60 ? full : t;
};

export type Crumb = { name: string; path: string };

/** schema.org BreadcrumbList for a trail of site paths (Home is added first). */
export const breadcrumbLd = (trail: Crumb[]) => ({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((c, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: c.name,
		item: absUrl(c.path)
	}))
});

/**
 * Arriqaaq: the publisher, and the author of the teaching posts. Shared by
 * every page's structured data so search engines see one identity, described
 * on /about/ and linked to its own profiles.
 */
export const ORGANIZATION_LD = {
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: settings.title,
	url: `${SITE_URL}/`,
	description: settings.description,
	logo: { '@type': 'ImageObject', url: absUrl(settings.logo ?? DEFAULT_OG_IMAGE) },
	sameAs: settings.navigation.map((n) => n.url).filter((u) => /instagram\.com|github\.com/.test(u)),
	mainEntityOfPage: `${SITE_URL}/about/`
};
