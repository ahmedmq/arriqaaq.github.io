import { error } from '@sveltejs/kit';
import { books, getBook } from '$lib/content';

export const prerender = true;

export function entries() {
	return books.map((b) => ({ slug: b.slug }));
}

export function load({ params }) {
	const book = getBook(params.slug);
	if (!book) throw error(404, 'Book not found');
	return { book };
}
