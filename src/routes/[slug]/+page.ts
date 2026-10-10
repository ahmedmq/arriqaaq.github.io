import { error } from '@sveltejs/kit';
import { posts, pages, getPost, getPage, getTagById, relatedPosts, adjacentPosts } from '$lib/content';

export const prerender = true;

export function entries() {
	// /courses/ has its own route (src/routes/courses), which embeds that page.
	return [...posts, ...pages].filter((p) => p.slug !== 'courses').map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const post = getPost(params.slug) ?? getPage(params.slug);
	if (!post) throw error(404, 'Not found');

	const primaryTag = post.primary_tag ? getTagById(post.primary_tag) : null;
	const related = post.type === "post" ? relatedPosts(post, 4) : [];
	const { prev, next } = post.type === 'post' ? adjacentPosts(post) : { prev: null, next: null };

	return {
		post,
		html: post.html,
		related,
		prev,
		next,
		breadcrumb: post.type === 'post' ? (primaryTag?.name ?? '') : post.title
	};
}
