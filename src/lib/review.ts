/**
 * Come-back review. Every "Not yet" a reader marks in a Pause and check box
 * is kept here with its question, answer and lesson, so the next lesson and
 * the course page can ask it again later: questions come back instead of
 * being read once and forgotten. Lives in this browser's localStorage only,
 * guarded like $lib/progress because storage can throw.
 */
const KEY = 'arriqaaq:review:v1';

export type ReviewItem = {
	id: string; // `${slug}#${box}.${question}`
	slug: string;
	title: string; // lesson title
	q: string; // question HTML (from the post)
	a: string; // answer HTML (from the post)
	at: number; // when it was marked
};

function read(): ReviewItem[] {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as ReviewItem[]) : [];
	} catch {
		return [];
	}
}

function write(items: ReviewItem[]) {
	try {
		localStorage.setItem(KEY, JSON.stringify(items));
		window.dispatchEvent(new CustomEvent('arriqaaq:review'));
	} catch {
		/* storage unavailable: nothing to come back to */
	}
}

export function reviewItems(): ReviewItem[] {
	return typeof window === 'undefined' ? [] : read();
}

export function addReview(item: ReviewItem) {
	write([...read().filter((x) => x.id !== item.id), item]);
}

export function removeReview(id: string) {
	write(read().filter((x) => x.id !== id));
}

/** Subscribe to changes (this tab and other tabs). Returns unsubscribe. */
export function onReview(fn: () => void): () => void {
	const storage = (e: StorageEvent) => e.key === KEY && fn();
	window.addEventListener('arriqaaq:review', fn);
	window.addEventListener('storage', storage);
	return () => {
		window.removeEventListener('arriqaaq:review', fn);
		window.removeEventListener('storage', storage);
	};
}
