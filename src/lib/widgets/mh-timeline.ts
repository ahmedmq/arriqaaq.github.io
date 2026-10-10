/**
 * The story of the science, as a graph. Every work is a dot on a time axis
 * (death year, AH), one lane per period, each period in its own palette
 * colour. Step through them, press Play, or drag the scrubber: the playhead
 * moves along the axis and the card shows that work. Filter by period with
 * the chips, or open the full list. Data: ./data/mustalah-history.ts (shared
 * with the no-JS fallback).
 */
import { CATS, TIMELINE, type Cat, type Entry } from './data/mustalah-history';
import { esc } from './lib/dom';

const VBW = 340;
const PAD = 14;
const LANE = 26;
const TOP = 6;
const MAX_AH = 1400;
const CAT_ORDER = Object.keys(CATS) as Cat[];
const HUE_VAR: Record<string, string> = {
	green: 'var(--green)',
	purple: 'var(--purple)',
	blue: 'var(--blue)',
	pink: 'var(--pink)'
};

const xOf = (e: Entry) => PAD + ((e.ah ?? 0) / MAX_AH) * (VBW - PAD * 2);

/** Dot positions: one lane per period; close neighbours step up and down. */
function layout() {
	const lastX: Record<string, number> = {};
	const flip: Record<string, number> = {};
	return TIMELINE.map((e) => {
		const lane = CAT_ORDER.indexOf(e.cat);
		const x = xOf(e);
		let dy = 0;
		if (lastX[e.cat] !== undefined && Math.abs(x - lastX[e.cat]) < 11) {
			flip[e.cat] = -(flip[e.cat] ?? -1);
			dy = flip[e.cat] * 6;
		} else flip[e.cat] = -1;
		lastX[e.cat] = x;
		return { e, x, y: TOP + lane * LANE + LANE / 2 + dy };
	});
}

export function init(el: HTMLElement) {
	const dots = layout();
	let filter: Cat | 'all' = 'all';
	let at = 0; // index into TIMELINE of the work being shown
	let timer = 0;
	let listOpen = false;

	const inFilter = (i: number) => filter === 'all' || TIMELINE[i].cat === filter;
	const order = () => TIMELINE.map((_, i) => i).filter(inFilter);

	el.innerHTML = `
	<div class="wd subject--hadith">
		<div class="scroll-x" role="group" aria-label="Filter by period" data-chips></div>
		<div class="wd-plot" data-plot></div>
		<div class="wd-now" data-now aria-live="polite"></div>
		<div class="wd-ctl">
			<button type="button" class="btn btn--ghost" data-back aria-label="Previous work">Back</button>
			<button type="button" class="btn btn--subject" data-play>Play</button>
			<button type="button" class="btn btn--ghost" data-next aria-label="Next work">Next</button>
			<input class="wd-range" type="range" min="0" value="0" step="1" aria-label="Scrub through the works" data-range />
		</div>
		<button type="button" class="chip" data-list aria-expanded="false">Show the full list</button>
		<ol class="wd-tl" data-listbox hidden></ol>
	</div>`;

	const $ = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
	const chips = $('[data-chips]');
	const plot = $('[data-plot]');
	const now = $('[data-now]');
	const range = $<HTMLInputElement>('[data-range]');
	const playBtn = $<HTMLButtonElement>('[data-play]');
	const listBtn = $<HTMLButtonElement>('[data-list]');
	const listBox = $('[data-listbox]');

	chips.innerHTML =
		`<button type="button" class="chip" aria-pressed="true" data-cat="all">All</button>` +
		CAT_ORDER.map(
			(c) =>
				`<button type="button" class="chip chip--subject wd-hue--${CATS[c].hue}" aria-pressed="false" data-cat="${c}">${esc(CATS[c].label)}</button>`
		).join('');

	function drawPlot() {
		const h = TOP + CAT_ORDER.length * LANE + 22;
		const ord = order();
		const pos = ord.indexOf(at);
		let s = `<svg viewBox="0 0 ${VBW} ${h}" role="img" aria-label="Works on a time axis from the Sahabah to the 14th century AH">`;
		// lane guides and axis
		CAT_ORDER.forEach((c, k) => {
			const y = TOP + k * LANE + LANE / 2;
			s += `<line x1="${PAD}" y1="${y}" x2="${VBW - PAD}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
		});
		const axisY = TOP + CAT_ORDER.length * LANE + 4;
		s += `<line x1="${PAD}" y1="${axisY}" x2="${VBW - PAD}" y2="${axisY}" stroke="var(--ink)" stroke-width="1.25"/>`;
		for (let a = 0; a <= MAX_AH; a += 200) {
			const x = PAD + (a / MAX_AH) * (VBW - PAD * 2);
			s += `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 4}" stroke="var(--ink)" stroke-width="1.25"/>`;
			const label = a === 0 ? 'AH' : String(a);
			const anchor = a === 0 ? 'start' : a === MAX_AH ? 'end' : 'middle';
			s += `<text x="${a === 0 ? PAD : x}" y="${axisY + 16}" text-anchor="${anchor}" font-family="var(--font-mono)" font-size="9.5" fill="var(--ink-3)">${label}</text>`;
		}
		// playhead
		const cur = dots[at];
		s += `<line x1="${cur.x}" y1="${TOP}" x2="${cur.x}" y2="${axisY}" stroke="var(--ink)" stroke-width="1.25" stroke-dasharray="4 3"/>`;
		// dots
		dots.forEach((d, i) => {
			const on = inFilter(i);
			const seen = on && ord.indexOf(i) <= pos;
			const col = HUE_VAR[CATS[d.e.cat].hue];
			const r = i === at ? 8 : 5.5;
			s += `<g data-dot="${i}" ${on ? 'tabindex="-1"' : ''} style="cursor:${on ? 'pointer' : 'default'}"><circle cx="${d.x}" cy="${d.y}" r="13" fill="transparent"/>
				<circle cx="${d.x}" cy="${d.y}" r="${r}" fill="${seen ? col : 'var(--page)'}" stroke="${on ? (i === at ? 'var(--ink)' : col) : 'var(--line-strong)'}" stroke-width="${i === at ? 2.5 : 1.75}"/></g>`;
		});
		plot.innerHTML = s + '</svg>';
	}

	function drawNow() {
		const e = TIMELINE[at];
		const ord = order();
		now.className = `wd-now wd-hue--${CATS[e.cat].hue}`;
		now.innerHTML = `<span class="wd-mono">${esc(e.when)} · ${esc(CATS[e.cat].label)}</span>
			<strong>${esc(e.work)}</strong>
			<span class="wd-who">${esc(e.who)}</span>
			<p>${esc(e.note)}</p>
			<span class="wd-mono wd-pos">${ord.indexOf(at) + 1} of ${ord.length}</span>`;
		range.max = String(ord.length - 1);
		range.value = String(ord.indexOf(at));
	}

	function drawList() {
		listBox.innerHTML = TIMELINE.map((e, i) =>
			!inFilter(i)
				? ''
				: `<li class="wd-hue--${CATS[e.cat].hue}"><button type="button" class="wd-item" data-go="${i}" aria-current="${i === at}">
					<span class="wd-mono">${esc(e.when)} · ${esc(CATS[e.cat].label)}</span>
					<strong>${esc(e.work)}</strong>
					<span class="wd-who">${esc(e.who)}</span>
				</button></li>`
		).join('');
		listBox.hidden = !listOpen;
		listBtn.setAttribute('aria-expanded', String(listOpen));
		listBtn.textContent = listOpen ? 'Hide the full list' : 'Show the full list';
	}

	function draw() {
		chips.querySelectorAll<HTMLElement>('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === filter)));
		drawPlot();
		drawNow();
		drawList();
	}

	function go(i: number) {
		at = i;
		draw();
	}

	function step(dir: number) {
		const ord = order();
		const p = ord.indexOf(at);
		const n = Math.min(ord.length - 1, Math.max(0, p + dir));
		go(ord[n]);
	}

	function stop() {
		window.clearInterval(timer);
		timer = 0;
		playBtn.textContent = 'Play';
	}

	function play() {
		const ord = order();
		if (ord.indexOf(at) >= ord.length - 1) go(ord[0]);
		playBtn.textContent = 'Pause';
		timer = window.setInterval(() => {
			const o = order();
			const p = o.indexOf(at);
			if (p >= o.length - 1) return stop();
			go(o[p + 1]);
		}, 2200);
	}

	const onClick = (ev: Event) => {
		const t = ev.target as HTMLElement;
		const chip = t.closest<HTMLElement>('[data-cat]');
		if (chip) {
			stop();
			filter = chip.dataset.cat as Cat | 'all';
			if (!inFilter(at)) at = order()[0];
			draw();
			return;
		}
		if (t.closest('[data-play]')) return timer ? stop() : play();
		if (t.closest('[data-back]')) return stop(), step(-1);
		if (t.closest('[data-next]')) return stop(), step(1);
		if (t.closest('[data-list]')) {
			listOpen = !listOpen;
			return drawList();
		}
		const dot = t.closest<SVGElement>('[data-dot]');
		if (dot) {
			const i = Number(dot.dataset.dot);
			if (inFilter(i)) return stop(), go(i);
			return;
		}
		const row = t.closest<HTMLElement>('[data-go]');
		if (row) return stop(), go(Number(row.dataset.go));
	};
	const onInput = () => {
		stop();
		go(order()[Number(range.value)]);
	};
	el.addEventListener('click', onClick);
	range.addEventListener('input', onInput);
	draw();

	return () => {
		stop();
		el.removeEventListener('click', onClick);
		range.removeEventListener('input', onInput);
	};
}
