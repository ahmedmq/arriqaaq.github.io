import { settings } from '$lib/content';

// Canonical origin, no trailing slash. Never use page.url.origin for
// canonical URLs — during prerender it is http://sveltekit-prerender.
export const SITE_URL = settings.url;

export const absUrl = (path: string) => SITE_URL + path;

// Page URLs always end with '/' (trailingSlash: 'always') — avoids GH Pages 301s.
export const postUrl = (slug: string) => `${SITE_URL}/${slug}/`;

/** Public source repository: where readers report issues or suggest fixes. */
export const REPO_URL = 'https://github.com/arriqaaq/arriqaaq.github.io';
export const ISSUES_URL = `${REPO_URL}/issues/new`;
/** Edit link for a post or page source file on GitHub. */
export const editUrl = (slug: string, type: 'post' | 'page') =>
	`${REPO_URL}/edit/main/content/${type === 'post' ? 'posts' : 'pages'}/${slug}.md`;
