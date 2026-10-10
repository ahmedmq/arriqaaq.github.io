/**
 * The books that grew around the books. One tab per foundational text; the
 * chips filter its abridgments, explanations, critical notes and poems.
 * Data: ./data/mustalah-history.ts (shared with the no-JS fallback).
 */
import { FAMILIES, GROUPS, type GroupKey } from './data/mustalah-history';
import { esc } from './lib/dom';

export function init(el: HTMLElement) {
	let tab = 0;
	let group: GroupKey | 'all' = 'all';

	el.innerHTML = `
	<div class="wd subject--hadith">
		<div class="tabs" role="tablist" aria-label="Choose a text" data-tabs></div>
		<div class="wd-panel" data-panel></div>
	</div>`;

	const tabs = el.querySelector<HTMLElement>('[data-tabs]')!;
	const panel = el.querySelector<HTMLElement>('[data-panel]')!;

	tabs.innerHTML = FAMILIES.map(
		(f, i) => `<button type="button" role="tab" class="tab" aria-selected="${i === tab}" data-tab="${i}">${esc(f.tab)}</button>`
	).join('');

	function draw() {
		const fam = FAMILIES[tab];
		const keys = Object.keys(fam.groups) as GroupKey[];
		if (group !== 'all' && !keys.includes(group)) group = 'all';
		const total = keys.reduce((n, k) => n + fam.groups[k]!.length, 0);
		const chips =
			keys.length > 1
				? `<div class="scroll-x" role="group" aria-label="Filter by kind">
					<button type="button" class="chip" aria-pressed="${group === 'all'}" data-group="all">All <span class="wd-n">${total}</span></button>
					${keys
						.map(
							(k) =>
								`<button type="button" class="chip chip--subject wd-hue--${GROUPS[k].hue}" aria-pressed="${group === k}" data-group="${k}">${esc(GROUPS[k].label)} <span class="wd-n">${fam.groups[k]!.length}</span></button>`
						)
						.join('')}
				</div>`
				: '';
		const sections = keys
			.filter((k) => group === 'all' || group === k)
			.map(
				(k) => `<section class="wd-group wd-hue--${GROUPS[k].hue}">
					<span class="wd-mono"><i class="wd-sq"></i>${esc(GROUPS[k].label)}</span>
					<ul class="wd-works">${fam.groups[k]!
						.map(
							(w) => `<li>
								<strong>${esc(w.title)}</strong>
								<span class="wd-who">${esc(w.by)}${w.when ? ` · ${esc(w.when)}` : ''}</span>
								${w.note ? `<span class="wd-note">${esc(w.note)}</span>` : ''}
							</li>`
						)
						.join('')}</ul>
				</section>`
			)
			.join('');
		panel.innerHTML = `<h4>${esc(fam.title)}</h4><p>${esc(fam.blurb)}</p>${chips}${sections}`;
		tabs.querySelectorAll<HTMLElement>('.tab').forEach((t, i) => t.setAttribute('aria-selected', String(i === tab)));
	}

	const onClick = (ev: Event) => {
		const t = ev.target as HTMLElement;
		const tb = t.closest<HTMLElement>('[data-tab]');
		if (tb) {
			tab = Number(tb.dataset.tab);
			group = 'all';
			draw();
			return;
		}
		const g = t.closest<HTMLElement>('[data-group]');
		if (g) {
			group = g.dataset.group as GroupKey | 'all';
			draw();
		}
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
