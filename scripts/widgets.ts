/**
 * Interactive widget registry, referenced from markdown as `[[WIDGET:name]]`
 * on its own line. Each entry: { g: legacy global name (unused), t: title
 * shown as the figure caption, s: one-line description, f: optional
 * no-JavaScript fallback }.
 *
 * To add a widget (DESIGN.md → "Rich posts"):
 * 1. Register it here:  'tajweed-madd': { g: '', t: 'Hear the madd lengths', s: '…' }
 * 2. Create src/lib/widgets/tajweed-madd.ts exporting
 *      export function init(el: HTMLElement): void | (() => void)
 *    It owns the DOM inside `el`. Use the design tokens and shared classes
 *    (.tabs, .segmented, .chip, .btn) so it matches the site. Return a
 *    cleanup function if it adds listeners.
 * 3. Put [[WIDGET:tajweed-madd]] on its own line in the post.
 * The parser emits the mount point and records the widget on the post; the
 * WidgetHydrator component loads and initialises it in the browser, and
 * only on posts that use it.
 *
 * Fallback (`f`): returns plain HTML that is written inside the mount point
 * at build time. Readers without JavaScript see it, and the widget replaces
 * it when it starts. Keep the data in one module under src/lib/widgets/data/
 * so the widget and its fallback can never disagree.
 */
import { CATS, TIMELINE, FAMILIES, GROUPS, QUIZ, type GroupKey } from '../src/lib/widgets/data/mustalah-history.js';
import { CHAIN, FITNAH } from '../src/lib/widgets/data/mustalah-chain.js';

export type WidgetMeta = { g: string; t: string; s: string; f?: () => string };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const timelineFallback = () =>
	`<div class="wd-static"><ol>${TIMELINE.map(
		(e) =>
			`<li><strong>${esc(e.work)}</strong> <span>${esc(e.who)} · ${esc(e.when)} · ${esc(CATS[e.cat].label)}</span><br>${esc(e.note)}</li>`
	).join('')}</ol></div>`;

const worksFallback = () =>
	`<div class="wd-static">${FAMILIES.map(
		(f) =>
			`<h4>${esc(f.title)}</h4><p>${esc(f.blurb)}</p>${(Object.keys(f.groups) as GroupKey[])
				.map(
					(g) =>
						`<h5>${esc(GROUPS[g].label)}</h5><ul>${f.groups[g]!.map(
							(w) =>
								`<li><strong>${esc(w.title)}</strong> by ${esc(w.by)}${w.when ? ` (${esc(w.when)})` : ''}${w.note ? `. ${esc(w.note)}` : ''}</li>`
						).join('')}</ul>`
				)
				.join('')}`
	).join('')}</div>`;

const chainFallback = () =>
	`<div class="wd-static"><p>${esc(CHAIN.links.map((l) => l.name).join(' → '))}</p><p>${esc(CHAIN.caption)}</p><p>“${esc(CHAIN.quote)}” ${esc(CHAIN.by)}</p></div>`;

const fitnahFallback = () =>
	`<div class="wd-static"><ol>${FITNAH.steps.map((s) => `<li>${esc(s.text)}</li>`).join('')}</ol><p>${esc(FITNAH.by)}</p></div>`;

const quizFallback = () =>
	`<div class="wd-static"><ol>${QUIZ.map(
		(q) =>
			`<li>${esc(q.q)} (${q.options.map(esc).join(' / ')})<details><summary>Answer</summary>${esc(q.options[q.answer])}. ${esc(q.why)}</details></li>`
	).join('')}</ol></div>`;

export const widgets: Record<string, WidgetMeta> = {
	'mh-timeline': {
		g: '',
		t: 'The story of the science on one time axis',
		s: 'Every work as a dot on a time axis. Step, play or scrub through the history.',
		f: timelineFallback
	},
	'mh-works': {
		g: '',
		t: 'The books that grew around the books',
		s: 'Abridgments, explanations, critical notes and poems around each foundational text.',
		f: worksFallback
	},
	'isnad-chain': {
		g: '',
		t: 'Break the chain',
		s: 'Tap a narrator to take them out of the chain.',
		f: chainFallback
	},
	'mh-fitnah': {
		g: '',
		t: 'When the turmoil occurred',
		s: 'Step through what Muhammad bin Sireen said about asking for the chain.',
		f: fitnahFallback
	},
	'mh-quiz-1': {
		g: '',
		t: 'Check what you have learned',
		s: 'Eight questions on the history of the science.',
		f: quizFallback
	}
};
