import { books } from '$lib/content';

export const prerender = true;

export function load() {
	return { books };
}
