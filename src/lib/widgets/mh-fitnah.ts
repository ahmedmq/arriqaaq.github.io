/**
 * "Name your men for us." Steps through the words of Muhammad bin Sireen,
 * one part at a time. Text: ./data/mustalah-chain.ts (shared with the no-JS
 * fallback).
 */
import { FITNAH } from './data/mustalah-chain';
import { esc } from './lib/dom';

const HUES = ['blue', 'pink', 'green'] as const;

export function init(el: HTMLElement) {
	let step = 0;
	const last = FITNAH.steps.length - 1;

	el.innerHTML = `<div class="wd subject--hadith">
		<div class="wd-step" data-card></div>
		<div class="wd-actions">
			<div class="wd-dots" data-dots aria-hidden="true"></div>
			<div class="wd-actions">
				<button type="button" class="btn btn--ghost" data-back>Back</button>
				<button type="button" class="btn btn--subject" data-next>Next</button>
			</div>
		</div>
	</div>`;
	const card = el.querySelector<HTMLElement>('[data-card]')!;
	const dots = el.querySelector<HTMLElement>('[data-dots]')!;
	const back = el.querySelector<HTMLButtonElement>('[data-back]')!;
	const next = el.querySelector<HTMLButtonElement>('[data-next]')!;

	function draw() {
		const s = FITNAH.steps[step];
		card.className = `wd-step wd-hue--${HUES[step]}`;
		card.innerHTML = `<span class="wd-mono">${esc(s.label)}</span><p>${esc(s.text)}</p><span class="wd-mono">${esc(FITNAH.by)}</span>`;
		dots.innerHTML = FITNAH.steps.map((_, i) => `<i class="${i <= step ? 'is-on' : ''}"></i>`).join('');
		back.disabled = step === 0;
		next.textContent = step === last ? 'Start again' : 'Next';
	}

	const onClick = (ev: Event) => {
		const t = ev.target as HTMLElement;
		if (t.closest('[data-back]') && step > 0) step -= 1;
		else if (t.closest('[data-next]')) step = step === last ? 0 : step + 1;
		else return;
		draw();
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
