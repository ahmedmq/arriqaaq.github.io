/**
 * Put the story in order. Six milestones from the lesson arrive shuffled;
 * the reader taps them into the order they think is right, then checks.
 * Each one then drops onto a ruler drawn to true scale (one pixel per a
 * fixed number of years), green where the guess was right and pink where
 * it was not, so the real gaps between them become visible. Guessing first
 * and then seeing the answer is what makes it stick. Data:
 * ./data/mustalah-history.ts (MILESTONES, in the right order).
 */
import { MILESTONES } from './data/mustalah-history';
import { esc, reducedMotion } from './lib/dom';

const HUES = ['pink', 'purple', 'blue', 'green', 'pink', 'purple'];

function shuffled(): number[] {
	const n = MILESTONES.map((_, i) => i);
	// Shuffle until no milestone is already in its right place.
	for (let tries = 0; tries < 50; tries++) {
		for (let i = n.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[n[i], n[j]] = [n[j], n[i]];
		}
		if (n.every((v, i) => v !== i)) break;
	}
	return n;
}

export function init(el: HTMLElement) {
	let pool = shuffled();
	let picked: number[] = [];
	let checked = false;

	el.innerHTML = `<div class="wd wo subject--hadith" data-root></div>`;
	const root = el.querySelector<HTMLElement>('[data-root]')!;

	const card = (m: number, extra = '') => {
		const s = MILESTONES[m];
		return `<span class="wo-work">${esc(s.work)}</span><span class="wo-who">${esc(s.who)}</span>${extra}`;
	};

	function ruler(): string {
		const lo = 200;
		const hi = 860;
		const PX = 0.8; // px per year
		const h = Math.round((hi - lo) * PX) + 24;
		const y = (ah: number) => 12 + (ah - lo) * PX;
		let s = `<div class="wo-ruler" style="height:${h}px">`;
		for (let c = 200; c <= 800; c += 100) {
			s += `<span class="wo-tick" style="top:${y(c)}px">${c} AH</span>`;
		}
		MILESTONES.forEach((m, i) => {
			const ok = picked[i] === i;
			s += `<div class="wo-mark wd-hue--${ok ? 'green' : 'pink'}" style="top:${y(m.ah)}px; --d:${i * 120}ms">
				<span class="wo-pin"></span>
				<span class="wo-lbl"><b>d. ${m.ah} AH</b> · ${esc(m.work)}, ${esc(m.who)}</span>
			</div>`;
		});
		return s + '</div>';
	}

	function draw() {
		const right = picked.filter((m, i) => m === i).length;
		if (checked) {
			root.innerHTML = `
			<p class="wd-mono" aria-live="polite">You placed ${right} of ${MILESTONES.length} correctly</p>
			<ol class="wo-slots">${MILESTONES.map((_, i) => {
				const m = picked[i];
				const ok = m === i;
				return `<li class="wo-slot is-filled wd-hue--${ok ? 'green' : 'pink'}"><span class="wo-n">${i + 1}</span><span class="wo-body">${card(m, ok ? '' : `<span class="wo-fix">Belongs at ${m + 1}</span>`)}</span></li>`;
			}).join('')}</ol>
			<p class="wo-lead">Now on a ruler drawn to scale. Look at the gaps between them.</p>
			${ruler()}
			<div class="wo-actions"><button type="button" class="btn btn--subject" data-again>Try again</button></div>`;
			if (!reducedMotion()) requestAnimationFrame(() => root.querySelector('.wo-ruler')?.classList.add('is-in'));
			else root.querySelector('.wo-ruler')?.classList.add('is-in');
			return;
		}
		root.innerHTML = `
			<p class="wd-mono" aria-live="polite">${picked.length < MILESTONES.length ? `Tap the one that came ${picked.length ? 'next' : 'first'}` : 'All placed. Check your order'}</p>
			<ol class="wo-slots">${MILESTONES.map((_, i) => {
				const m = picked[i];
				return m === undefined
					? `<li class="wo-slot"><span class="wo-n">${i + 1}</span><span class="wo-empty">${i === picked.length ? 'Tap a card below' : ''}</span></li>`
					: `<li class="wo-slot is-filled wd-hue--${HUES[i]}"><span class="wo-n">${i + 1}</span><button type="button" class="wo-body" data-un="${i}" aria-label="Take ${esc(MILESTONES[m].work)} out">${card(m)}<span class="wo-x" aria-hidden="true">×</span></button></li>`;
			}).join('')}</ol>
			${pool.length ? `<div class="wo-pool">${pool.map((m) => `<button type="button" class="wo-card" data-pick="${m}">${card(m)}</button>`).join('')}</div>` : ''}
			<div class="wo-actions">
				<button type="button" class="btn btn--subject" data-check ${picked.length < MILESTONES.length ? 'disabled' : ''}>Check my order</button>
				${picked.length ? '<button type="button" class="btn btn--ghost" data-reset>Start over</button>' : ''}
			</div>`;
	}

	const onClick = (ev: Event) => {
		const t = ev.target as HTMLElement;
		const pick = t.closest<HTMLElement>('[data-pick]');
		if (pick) {
			const m = Number(pick.dataset.pick);
			pool = pool.filter((x) => x !== m);
			picked.push(m);
			return draw();
		}
		const un = t.closest<HTMLElement>('[data-un]');
		if (un) {
			const i = Number(un.dataset.un);
			// Taking one out frees it and everything after it keeps its place.
			pool.push(picked[i]);
			picked.splice(i, 1);
			return draw();
		}
		if (t.closest('[data-check]')) {
			checked = true;
			draw();
			root.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
			return;
		}
		if (t.closest('[data-reset]') || t.closest('[data-again]')) {
			pool = shuffled();
			picked = [];
			checked = false;
			return draw();
		}
	};
	el.addEventListener('click', onClick);
	draw();
	return () => el.removeEventListener('click', onClick);
}
