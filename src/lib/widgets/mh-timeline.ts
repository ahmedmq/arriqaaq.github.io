/**
 * The story of the science, scrolled. Every work sits on one vertical line,
 * in order, grouped by period, with a marker each time the century changes.
 * Reading down the page drives it: the line takes each period's colour as
 * you pass, the work at the reading point lights up, and a small bar pinned
 * to the top of the widget shows where you are in the whole story. The
 * chips jump straight to a period. Nothing to press to make it move.
 * Data: ./data/mustalah-history.ts (shared with the no-JS fallback).
 */
import { CATS, TIMELINE, type Cat } from './data/mustalah-history';
import { esc } from './lib/dom';

const CAT_ORDER = Object.keys(CATS) as Cat[];
const century = (ah: number) => Math.floor(ah / 100) * 100;

export function init(el: HTMLElement) {
	let rows = '';
	let lastCat: Cat | null = null;
	let lastC = -1;
	TIMELINE.forEach((e, i) => {
		const hue = CATS[e.cat].hue;
		if (e.cat !== lastCat) {
			rows += `<li class="ws-era wd-hue--${hue}" data-era="${e.cat}"><span>${esc(CATS[e.cat].label)}</span></li>`;
			lastCat = e.cat;
		}
		if (e.ah !== undefined && century(e.ah) !== lastC) {
			lastC = century(e.ah);
			rows += `<li class="ws-cent wd-hue--${hue}" aria-hidden="true"><span>${lastC}s AH</span></li>`;
		}
		rows += `<li class="ws-item wd-hue--${hue}" data-i="${i}">
			<span class="ws-dot" aria-hidden="true"></span>
			<div class="ws-card">
				<span class="wd-mono">${esc(e.when)}</span>
				<strong>${esc(e.work)}</strong>
				<span class="ws-who">${esc(e.who)}</span>
				<p>${esc(e.note)}</p>
			</div>
		</li>`;
	});

	el.innerHTML = `
	<div class="wd ws subject--hadith">
		<div class="ws-pin">
			<div class="scroll-x" role="group" aria-label="Jump to a period">${CAT_ORDER.map(
				(c) => `<button type="button" class="chip chip--subject wd-hue--${CATS[c].hue}" data-jump="${c}">${esc(CATS[c].label)}</button>`
			).join('')}</div>
			<div class="ws-bar" aria-hidden="true">${TIMELINE.map((e) => `<span class="wd-hue--${CATS[e.cat].hue}"></span>`).join('')}</div>
			<p class="ws-now wd-mono" aria-live="polite">Scroll down to walk through it</p>
		</div>
		<ol class="ws-line">${rows}</ol>
	</div>`;

	const root = el.querySelector<HTMLElement>('.ws')!;
	const line = el.querySelector<HTMLElement>('.ws-line')!;
	const now = el.querySelector<HTMLElement>('.ws-now')!;
	const items = [...el.querySelectorAll<HTMLElement>('.ws-item')];
	const all = [...line.children] as HTMLElement[];
	const segs = [...el.querySelectorAll<HTMLElement>('.ws-bar span')];
	let current = -2;
	let raf = 0;

	const update = () => {
		raf = 0;
		const mid = window.innerHeight * 0.55;
		let idx = -1;
		for (let k = 0; k < items.length; k++) {
			if (items[k].getBoundingClientRect().top + 14 < mid) idx = k;
			else break;
		}
		if (idx === current) return;
		current = idx;
		// Everything above the reading point takes its period's colour.
		const upto = idx < 0 ? -1 : all.indexOf(items[idx]);
		all.forEach((li, k) => li.classList.toggle('is-lit', k <= upto));
		items.forEach((it, k) => it.classList.toggle('is-now', k === idx));
		segs.forEach((s, k) => s.classList.toggle('is-on', k <= idx));
		if (idx >= 0) {
			const e = TIMELINE[idx];
			now.textContent = `${idx + 1} of ${TIMELINE.length} · ${e.when} · ${e.who}`;
		} else now.textContent = 'Scroll down to walk through it';
	};
	const queue = () => (raf ||= requestAnimationFrame(update));

	const onClick = (ev: Event) => {
		const chip = (ev.target as HTMLElement).closest<HTMLElement>('[data-jump]');
		if (!chip) return;
		const era = root.querySelector<HTMLElement>(`[data-era="${chip.dataset.jump}"]`);
		let target: Element | null | undefined = era?.nextElementSibling;
		while (target && !target.classList.contains('ws-item')) target = target.nextElementSibling;
		if (!target) return;
		const y = target.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55 + 20;
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
	};

	el.addEventListener('click', onClick);
	window.addEventListener('scroll', queue, { passive: true });
	window.addEventListener('resize', queue);
	update();

	return () => {
		el.removeEventListener('click', onClick);
		window.removeEventListener('scroll', queue);
		window.removeEventListener('resize', queue);
		cancelAnimationFrame(raf);
	};
}
