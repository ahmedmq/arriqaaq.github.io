<script lang="ts">
	// Scholar cards. Names marked at build time (scripts/rehype-scholars.ts)
	// become tappable: a card opens with the scholar's name, death year, the
	// works the lessons mention, and the other posts on the site that mention
	// him. On phones it is a sheet from the bottom; on wider screens it opens
	// under the name. Esc, the close button or a tap outside closes it.
	// Without JavaScript the names are plain text.
	import { base } from '$app/paths';
	import { SCHOLARS, type Scholar } from '$lib/data/scholars';
	import appearances from '$lib/generated/scholars.json';

	type Props = { article: HTMLElement | undefined; html: string; slug: string };
	let { article, html, slug }: Props = $props();

	const BY_ID = new Map(SCHOLARS.map((s) => [s.id, s]));
	const APPEARS = appearances as Record<string, { slug: string; title: string }[]>;

	let open = $state<Scholar | null>(null);
	let sheet = $state(false);
	let pos = $state({ top: 0, left: 0 });
	let trigger: HTMLElement | null = null;
	let card: HTMLElement | undefined = $state();

	const others = $derived(open ? (APPEARS[open.id] ?? []).filter((p) => p.slug !== slug) : []);

	function show(el: HTMLElement) {
		const s = BY_ID.get(el.dataset.sch ?? '');
		if (!s) return;
		trigger = el;
		sheet = window.innerWidth < 640;
		if (!sheet) {
			const r = el.getBoundingClientRect();
			const w = 340;
			// Under the name, or above it when there is no room below.
			const below = window.innerHeight - r.bottom > 320;
			pos = {
				top: below ? r.bottom + 8 : Math.max(16, r.top - 8 - 320),
				left: Math.max(16, Math.min(r.left, window.innerWidth - w - 16))
			};
		}
		open = s;
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
		const names = [...article.querySelectorAll<HTMLElement>('.sch[data-sch]')];
		for (const n of names) {
			n.classList.add('is-on');
			n.setAttribute('role', 'button');
			n.setAttribute('tabindex', '0');
			n.setAttribute('aria-haspopup', 'dialog');
		}
		const onClick = (e: Event) => {
			const n = (e.target as HTMLElement).closest<HTMLElement>('.sch.is-on');
			if (n) show(n);
		};
		const onKey = (e: KeyboardEvent) => {
			const n = (e.target as HTMLElement).closest<HTMLElement>('.sch.is-on');
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
			if (card?.contains(t) || t.closest('.sch.is-on')) return;
			close();
		};
		// The desktop card is pinned to where the name was; scrolling closes it.
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
				<span class="when">
					{#if open.ah}d. {open.ah} AH{/if}{#if open.born} · born {open.born} AH{/if}
				</span>
				<strong id="sch-name">{open.name}</strong>
			</div>
			<button class="close" onclick={close} aria-label="Close">×</button>
		</div>
		<div class="body">
			{#if open.line}<p class="line">{open.line}</p>{/if}
			<span class="label">Works mentioned in the lessons</span>
			<ul>
				{#each open.works as w}<li>{w}</li>{/each}
			</ul>
			{#if others.length}
				<span class="label">Also mentioned in</span>
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

	:global(.prose .sch.is-on:hover),
	:global(.prose .sch.is-on:focus-visible) {
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
