/**
 * Break the chain. Tap a narrator to take them out of the sanad of
 * As-Sahifa as-Sahiha, and see why the scholars said the chain is part of
 * the religion. Text: ./data/mustalah-chain.ts (shared with the no-JS fallback).
 */
import { CHAIN } from './data/mustalah-chain';
import { esc } from './lib/dom';

const HUES = ['blue', 'purple', 'green'] as const;

export function init(el: HTMLElement) {
	const gone = new Set<number>();

	el.innerHTML = `<div class="wd subject--hadith">
		<p class="wd-mono">Tap a narrator</p>
		<div class="wd-chain" data-chain></div>
		<div class="wd-status" data-status aria-live="polite"></div>
	</div>`;
	const chain = el.querySelector<HTMLElement>('[data-chain]')!;
	const status = el.querySelector<HTMLElement>('[data-status]')!;

	function draw() {
		chain.innerHTML = CHAIN.links
			.map((l, i) => {
				const out = gone.has(i);
				const next = i < CHAIN.links.length - 1;
				const broken = out || gone.has(i + 1);
				return `<button type="button" class="wd-node wd-hue--${HUES[i]}" aria-pressed="${out}" data-i="${i}">
						<strong>${out ? '?' : esc(l.name)}</strong>
						<span>${out ? 'Tap to put back' : l.role ? esc(l.role) : 'Tap to take out'}</span>
					</button>${next ? `<span class="wd-link${broken ? ' is-broken' : ''}" aria-hidden="true"></span>` : ''}`;
			})
			.join('');
		const whole = gone.size === 0;
		status.className = `wd-status ${whole ? 'wd-hue--green' : 'wd-hue--pink'}`;
		status.innerHTML = whole
			? `<p>${esc(CHAIN.caption)}</p>`
			: `<p><q>${esc(CHAIN.quote)}</q></p><p class="wd-mono">${esc(CHAIN.by)}</p>`;
	}

	const onClick = (ev: Event) => {
		const n = (ev.target as HTMLElement).closest<HTMLElement>('[data-i]');
		if (!n) return;
		const i = Number(n.dataset.i);
		if (gone.has(i)) gone.delete(i);
		else gone.add(i);
		draw();
		el.querySelector<HTMLElement>(`[data-i="${i}"]`)?.focus({ preventScroll: true });
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
