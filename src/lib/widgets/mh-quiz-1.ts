/**
 * Check what you have learned: eight questions on Part 1. Right answers turn
 * green, wrong ones pink, and every answer is followed by the line from the
 * lesson that explains it. Data: ./data/mustalah-history.ts.
 */
import { QUIZ } from './data/mustalah-history';
import { esc } from './lib/dom';

export function init(el: HTMLElement) {
	let i = 0;
	let score = 0;
	let picked = -1;

	el.innerHTML = `<div class="wd subject--hadith" data-root></div>`;
	const root = el.querySelector<HTMLElement>('[data-root]')!;

	function draw() {
		if (i >= QUIZ.length) {
			root.innerHTML = `<div class="wd-score">
				<span class="wd-mono">Your score</span>
				<strong>${score}/${QUIZ.length}</strong>
				<button type="button" class="btn btn--subject" data-again>Try again</button>
			</div>`;
			return;
		}
		const q = QUIZ[i];
		const answered = picked >= 0;
		root.innerHTML = `<div class="wd-q">
			<span class="wd-mono">Question ${i + 1} of ${QUIZ.length}</span>
			<h4>${esc(q.q)}</h4>
			<div class="wd-opts">${q.options
				.map((o, k) => {
					const cls = !answered ? '' : k === q.answer ? ' is-right' : k === picked ? ' is-wrong' : '';
					return `<button type="button" class="wd-opt${cls}" data-o="${k}" ${answered ? 'disabled' : ''}>${esc(o)}</button>`;
				})
				.join('')}</div>
			${answered ? `<div class="wd-why wd-hue--${picked === q.answer ? 'green' : 'pink'}" aria-live="polite"><p>${esc(q.why)}</p></div>
			<div class="wd-actions"><span class="wd-mono">${score} correct so far</span><button type="button" class="btn btn--subject" data-next>${i === QUIZ.length - 1 ? 'See your score' : 'Next question'}</button></div>` : ''}
		</div>`;
	}

	const onClick = (ev: Event) => {
		const t = ev.target as HTMLElement;
		const o = t.closest<HTMLElement>('[data-o]');
		if (o && picked < 0) {
			picked = Number(o.dataset.o);
			if (picked === QUIZ[i].answer) score += 1;
			draw();
			root.querySelector<HTMLElement>('[data-next]')?.focus({ preventScroll: true });
		} else if (t.closest('[data-next]')) {
			i += 1;
			picked = -1;
			draw();
		} else if (t.closest('[data-again]')) {
			i = 0;
			score = 0;
			picked = -1;
			draw();
		}
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
