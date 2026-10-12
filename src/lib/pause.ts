/**
 * `use:pauses` enhances the "Pause and check" boxes (:::pause) inside an
 * article. Opening an answer offers "I knew it" and "Not yet"; the number
 * turns green or pink and the box header counts what you have checked. The
 * marks are remembered in this browser only, so a returning reader sees
 * which questions to look at again. Without JavaScript the boxes are plain
 * <details> and still work.
 */
type Mark = 'knew' | 'notyet';

function load(key: string): Record<string, Mark> {
	try {
		return JSON.parse(localStorage.getItem(key) ?? '{}') ?? {};
	} catch {
		return {};
	}
}

function save(key: string, marks: Record<string, Mark>) {
	try {
		localStorage.setItem(key, JSON.stringify(marks));
	} catch {
		/* private mode or storage blocked: marks last for this visit only */
	}
}

function enhance(node: HTMLElement): () => void {
	const key = `pause:${location.pathname}`;
	const marks = load(key);
	const cleanups: (() => void)[] = [];

	node.querySelectorAll<HTMLElement>('.pause').forEach((box, b) => {
		const count = box.querySelector<HTMLElement>('.pause-count');
		const items = [...box.querySelectorAll<HTMLLIElement>('.pause-q')];
		const answerable = items.filter((li) => li.querySelector('details'));
		const total = answerable.length;

		const refresh = () => {
			if (!count || !total) return;
			const done = answerable.filter((li) => li.dataset.mark).length;
			const again = answerable.filter((li) => li.dataset.mark === 'notyet').length;
			count.textContent = done
				? `${done} of ${total} checked${again ? ` · ${again} to revisit` : ''}`
				: `${items.length} question${items.length === 1 ? '' : 's'}`;
		};

		const apply = (li: HTMLLIElement, id: string, mark: Mark | undefined) => {
			li.classList.toggle('is-knew', mark === 'knew');
			li.classList.toggle('is-notyet', mark === 'notyet');
			if (mark) li.dataset.mark = mark;
			else delete li.dataset.mark;
			li.querySelectorAll<HTMLButtonElement>('.pause-rate button').forEach((btn) => {
				const on = btn.dataset.mark === mark;
				btn.setAttribute('aria-pressed', String(on));
				btn.classList.toggle('is-dim', !!mark && !on);
			});
			if (mark) marks[id] = mark;
			else delete marks[id];
			save(key, marks);
			refresh();
		};

		answerable.forEach((li, i) => {
			const id = `${b}.${i}`;
			const details = li.querySelector('details')!;
			const cta = details.querySelector<HTMLElement>('.pause-cta');
			const answer = details.querySelector<HTMLElement>('.pause-a');

			const rate = document.createElement('div');
			rate.className = 'pause-rate';
			rate.innerHTML =
				'<button type="button" class="knew" data-mark="knew" aria-pressed="false">I knew it</button>' +
				'<button type="button" class="notyet" data-mark="notyet" aria-pressed="false">Not yet</button>';
			answer?.after(rate);
			const onRate = (e: Event) => {
				const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
				if (!btn) return;
				const m = btn.dataset.mark as Mark;
				apply(li, id, li.dataset.mark === m ? undefined : m);
			};
			rate.addEventListener('click', onRate);

			const onToggle = () => {
				if (cta) cta.textContent = details.open ? 'Hide answer' : 'Show answer';
			};
			details.addEventListener('toggle', onToggle);

			if (marks[id]) apply(li, id, marks[id]);
			cleanups.push(() => {
				rate.removeEventListener('click', onRate);
				details.removeEventListener('toggle', onToggle);
				rate.remove();
			});
		});
		refresh();
	});

	return () => cleanups.forEach((c) => c());
}

/** Pass the article HTML so the boxes are set up again when it changes. */
export function pauses(node: HTMLElement, _html?: string) {
	let stop = enhance(node);
	return {
		update() {
			stop();
			queueMicrotask(() => (stop = enhance(node)));
		},
		destroy: () => stop()
	};
}
