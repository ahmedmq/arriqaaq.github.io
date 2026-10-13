<script lang="ts">
	// Scholar and term cards. Names and terms marked at build time
	// (scripts/rehype-scholars.ts) become tappable. A scholar card shows the
	// name, death year, the works the lessons mention and the other posts that
	// mention him; a term card shows the course's meaning for it, the lesson
	// that explains it and the other lessons that use it. On phones it is a
	// sheet from the bottom; on wider screens it opens under the word. Esc, the
	// close button or a tap outside closes it. Without JavaScript the words are
	// plain text.
	import { base } from '$app/paths';
	import { SCHOLARS, type Scholar } from '$lib/data/scholars';
	import { TERMS, type Term } from '$lib/data/glossary';
	import { track } from '$lib/analytics';
	import { coursePlace } from '$lib/content';
	import appearances from '$lib/generated/scholars.json';
	import termAppearances from '$lib/generated/terms.json';

	type Props = { article: HTMLElement | undefined; html: string; slug: string };
	let { article, html, slug }: Props = $props();

	type Open = { kind: 'sch'; s: Scholar } | { kind: 'term'; t: Term };
	type Appears = Record<string, { slug: string; title: string }[]>;
	const SCHOLAR_BY_ID = new Map(SCHOLARS.map((s) => [s.id, s]));
	const TERM_BY_ID = new Map(TERMS.map((t) => [t.id, t]));
	const APPEARS = appearances as Appears;
	const TERM_APPEARS = termAppearances as Appears;
	const SEL = '.sch.is-on, .trm.is-on';

	let open = $state<Open | null>(null);
	let sheet = $state(false);
	let pos = $state({ top: 0, left: 0 });
	let trigger: HTMLElement | null = null;
	let card: HTMLElement | undefined = $state();

	const others = $derived(
		!open ? [] : ((open.kind === 'sch' ? APPEARS[open.s.id] : TERM_APPEARS[open.t.id]) ?? []).filter((p) => p.slug !== slug)
	);
	// The lesson that explains the term, when it is not this one.
	const explainedIn = $derived.by(() => {
		if (open?.kind !== 'term' || open.t.later || open.t.lesson === slug) return undefined;
		return coursePlace(open.t.lesson)?.lesson;
	});

	function show(el: HTMLElement) {
		const s = SCHOLAR_BY_ID.get(el.dataset.sch ?? '');
		const t = TERM_BY_ID.get(el.dataset.term ?? '');
		if (!s && !t) return;
		trigger = el;
		sheet = window.innerWidth < 640;
		if (!sheet) {
			const r = el.getBoundingClientRect();
			const w = 340;
			// Under the word, or above it when there is no room below.
			const below = window.innerHeight - r.bottom > 320;
			pos = {
				top: below ? r.bottom + 8 : Math.max(16, r.top - 8 - 320),
				left: Math.max(16, Math.min(r.left, window.innerWidth - w - 16))
			};
		}
		open = s ? { kind: 'sch', s } : { kind: 'term', t: t! };
		track('select_content', { content_type: s ? 'scholar' : 'term', content_id: s ? s.id : t!.id });
		queueMicrotask(() => card?.querySelector<HTMLElement>('.close')?.focus({ preventScroll: true }));
	}

	function close() {
		open = null;
		trigger?.focus({ preventScroll: true });
		trigger = null;
	}

	$effect(() => {
		if (!article) return;
		void html; // set up again when the article changes
		const words = [...article.querySelectorAll<HTMLElement>('.sch[data-sch], .trm[data-term]')];
		for (const n of words) {
			n.classList.add('is-on');
			n.setAttribute('role', 'button');
			n.setAttribute('tabindex', '0');
			n.setAttribute('aria-haspopup', 'dialog');
		}
		const onClick = (e: Event) => {
			const n = (e.target as HTMLElement).closest<HTMLElement>(SEL);
			if (n) show(n);
		};
		const onKey = (e: KeyboardEvent) => {
			const n = (e.target as HTMLElement).closest<HTMLElement>(SEL);
			if (n && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				show(n);
			}
		};
		const el = article;
		el.addEventListener('click', onClick);
		el.addEventListener('keydown', onKey);
		return () => {
			el.removeEventListener('click', onClick);
			el.removeEventListener('keydown', onKey);
		};
	});

	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
		const onDown = (e: PointerEvent) => {
			const t = e.target as HTMLElement;
			if (card?.contains(t) || t.closest(SEL)) return;
			close();
		};
		// The desktop card is pinned to where the word was; scrolling closes it.
		const onScroll = () => !sheet && close();
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onDown);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

{#if open}
	<div
		class="sch-card"
		class:is-sheet={sheet}
		style:top={sheet ? null : `${pos.top}px`}
		style:left={sheet ? null : `${pos.left}px`}
		role="dialog"
		aria-modal={sheet}
		aria-labelledby="sch-name"
		bind:this={card}
	>
		<div class="head">
			<div>
				{#if open.kind === 'sch'}
					<span class="when">
						{#if open.s.ah}d. {open.s.ah} AH{/if}{#if open.s.born} · born {open.s.born} AH{/if}
					</span>
					<strong id="sch-name">{open.s.name}</strong>
				{:else}
					<span class="when">Term</span>
					<strong id="sch-name">{open.t.term}</strong>
				{/if}
			</div>
			<button class="close" onclick={close} aria-label="Close">×</button>
		</div>
		<div class="body">
			{#if open.kind === 'sch'}
				{#if open.s.line}<p class="line">{open.s.line}</p>{/if}
				<span class="label">Works mentioned in the lessons</span>
				<ul>
					{#each open.s.works as w}<li>{w}</li>{/each}
				</ul>
			{:else}
				{#if open.t.meaning}<p class="meaning">{open.t.meaning}</p>{/if}
				{#if open.t.later}
					<p class="line">It gets its own lesson later in the course.</p>
				{:else if explainedIn}
					<span class="label">Explained in</span>
					<ul class="links"><li><a href={`${base}/${explainedIn.slug}/`}>Lesson {explainedIn.n}, {explainedIn.title}</a></li></ul>
				{/if}
			{/if}
			{#if others.length}
				<span class="label">{open.kind === 'sch' ? 'Also mentioned in' : 'Also used in'}</span>
				<ul class="links">
					{#each others as p (p.slug)}<li><a href={`${base}/${p.slug}/`}>{p.title}</a></li>{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.prose .sch.is-on) {
		text-decoration: underline dotted var(--subject, var(--purple));
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
		cursor: pointer;
		border-radius: 3px;
	}

	/* Terms: a dotted grey underline, so they read apart from scholars. */
	:global(.prose .trm.is-on) {
		text-decoration: underline dotted var(--ink-3);
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
		cursor: pointer;
		border-radius: 3px;
	}

	:global(.prose .sch.is-on:hover),
	:global(.prose .sch.is-on:focus-visible),
	:global(.prose .trm.is-on:hover),
	:global(.prose .trm.is-on:focus-visible) {
		color: var(--subject-ink, var(--purple-ink));
		outline: none;
	}

	.sch-card {
		position: fixed;
		z-index: 91;
		width: min(340px, calc(100vw - 32px));
		border-radius: var(--r);
		background: var(--page);
		box-shadow: 0 0 0 1px var(--line-strong);
		overflow: hidden;
		animation: pop var(--dur-fast) ease;
	}

	.sch-card.is-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		width: auto;
		max-height: 75vh;
		overflow-y: auto;
		border-radius: var(--r) var(--r) 0 0;
		box-shadow: 0 0 0 1px var(--line-strong);
		padding-bottom: env(safe-area-inset-bottom);
		animation-name: rise;
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--s-3);
		padding: var(--s-3) var(--s-4);
		background: var(--subject, var(--purple));
		color: var(--on-colour);
	}

	.when {
		display: block;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	strong {
		display: block;
		font-size: 1.0625rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.close {
		flex: none;
		width: 36px;
		height: 36px;
		margin: -4px -8px 0 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--on-colour);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
	}

	.body {
		display: grid;
		gap: var(--s-2);
		padding: var(--s-3) var(--s-4) var(--s-4);
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.line {
		margin: 0;
		color: var(--ink-2);
	}

	.meaning {
		margin: 0;
		font-size: 1.0625rem;
		font-weight: 500;
		color: var(--ink);
	}

	.label {
		margin-top: var(--s-1);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--subject-ink, var(--purple-ink));
	}

	ul {
		margin: 0;
		padding-left: 1.1em;
	}

	.links a {
		color: var(--ink);
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}

	@keyframes rise {
		from {
			transform: translateY(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sch-card {
			animation: none;
		}
	}
</style>
