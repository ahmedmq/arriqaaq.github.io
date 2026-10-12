/**
 * Shared reading state for the article page. The post page writes it as the
 * reader scrolls; the site header reads `section` to show where you are
 * (the OpenAI sticky section label).
 */
export const reading = $state({
	section: '',
	index: -1,
	total: 0,
	past: false,
	/** 0..1 through the article */
	progress: 0,
	/** the article's sections, in order (same order as `index`) */
	entries: [] as { id: string; text: string }[],
	/** the phone contents sheet */
	sheet: false
});

export function resetReading() {
	reading.section = '';
	reading.index = -1;
	reading.total = 0;
	reading.past = false;
	reading.progress = 0;
	reading.entries = [];
	reading.sheet = false;
}
