/**
 * Course progress lives in this browser's localStorage only: a set of lesson
 * slugs marked complete. Every access is guarded because storage can throw
 * (private mode, blocked site data) and the page must still render.
 */
const KEY = 'arriqaaq:done:v1';

function read(): Set<string> {
	try {
		const raw = localStorage.getItem(KEY);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
}

function write(set: Set<string>) {
	try {
		localStorage.setItem(KEY, JSON.stringify([...set]));
		window.dispatchEvent(new CustomEvent('arriqaaq:progress'));
	} catch {
		/* storage unavailable: progress simply is not remembered */
	}
}

export function doneSet(): Set<string> {
	return typeof window === 'undefined' ? new Set() : read();
}

export function isDone(slug: string): boolean {
	return doneSet().has(slug);
}

export function setDone(slug: string, done: boolean) {
	const s = read();
	if (done) s.add(slug);
	else s.delete(slug);
	write(s);
}

/** Subscribe to progress changes (this tab and other tabs). Returns unsubscribe. */
export function onProgress(fn: () => void): () => void {
	const storage = (e: StorageEvent) => e.key === KEY && fn();
	window.addEventListener('arriqaaq:progress', fn);
	window.addEventListener('storage', storage);
	return () => {
		window.removeEventListener('arriqaaq:progress', fn);
		window.removeEventListener('storage', storage);
	};
}
