/**
 * Take a narrator out of the chain. The sanad of As-Sahifa as-Sahiha has
 * three links, drawn as in the notes: the Prophet (ﷺ), Abu Hurayrah, Hammam.
 * Each narrator has an explicit "Take out" button; the Prophet (ﷺ) is where
 * the report starts and cannot be removed. With every link in place the chain is complete; with a
 * link missing nobody can check who the report came through, which is what
 * Abdullah bin al-Mubarak meant. Text: ./data/mustalah-chain.ts (shared with
 * the no-JS fallback).
 */
import { CHAIN } from './data/mustalah-chain';
import { esc } from './lib/dom';

const HUES = ['green', 'purple', 'blue'] as const;

export function init(el: HTMLElement) {
	const out = new Set<number>();

	el.innerHTML = `<div class="wd subject--hadith">
		<p class="wd-mono">Take a narrator out of the chain</p>
		<div class="wd-chain" data-chain></div>
		<div class="wd-status" data-status aria-live="polite"></div>
	</div>`;
	const chain = el.querySelector<HTMLElement>('[data-chain]')!;
	const status = el.querySelector<HTMLElement>('[data-status]')!;

	function draw() {
		chain.innerHTML = CHAIN.links
			.map((l, i) => {
				const gone = out.has(i);
				const last = i === CHAIN.links.length - 1;
				const broken = gone || out.has(i + 1);
				const action = l.narrator
					? `<button type="button" class="btn ${gone ? 'btn--ghost' : 'btn--subject'}" data-i="${i}">${gone ? 'Put back' : 'Take out'}<span class="sr-only"> ${esc(l.name)}</span></button>`
					: '';
				return `<div class="wd-node wd-hue--${HUES[i]}${gone ? ' is-out' : ''}">
						<div><strong>${gone ? 'Missing link' : esc(l.name)}</strong><span>${gone ? 'Who was here? Nobody can say.' : esc(l.role)}</span></div>
						${action}
					</div>${last ? '' : `<span class="wd-link${broken ? ' is-broken' : ''}" aria-hidden="true"></span>`}`;
			})
			.join('');
		const whole = out.size === 0;
		status.className = `wd-status ${whole ? 'wd-hue--green' : 'wd-hue--pink'}`;
		status.innerHTML = whole
			? `<p><strong>The chain is complete.</strong> Every link is named, from the Prophet (ﷺ) down to Hammam.</p><p>${esc(CHAIN.caption)}</p>`
			: `<p><strong>A link is missing.</strong> Nobody can check who this report came through.</p><p><q>${esc(CHAIN.quote)}</q></p><p class="wd-mono">${esc(CHAIN.by)}</p>`;
	}

	const onClick = (ev: Event) => {
		const b = (ev.target as HTMLElement).closest<HTMLElement>('[data-i]');
		if (!b) return;
		const i = Number(b.dataset.i);
		if (out.has(i)) out.delete(i);
		else out.add(i);
		draw();
		el.querySelector<HTMLElement>(`[data-i="${i}"]`)?.focus({ preventScroll: true });
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
