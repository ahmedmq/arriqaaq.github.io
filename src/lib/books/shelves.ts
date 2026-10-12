import type { BookShelf } from '$lib/types';

/** Shelf labels, in the order the filter chips show them. */
export const SHELVES: { id: BookShelf; label: string }[] = [
	{ id: 'hadith', label: 'Hadith' },
	{ id: 'tafsir', label: 'Tafsir' },
	{ id: 'family', label: 'Marriage and family' },
	{ id: 'history', label: 'History' },
	{ id: 'children', label: 'Children' }
];

export const shelfLabel = (id: BookShelf) => SHELVES.find((s) => s.id === id)!.label;
