import { posts } from '$lib/content';

export const prerender = true;

export function load() {
	return { posts: posts.slice(0, 40) };
}
