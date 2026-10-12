<script lang="ts">
	// "On this page": a contents list that stays in the right margin on wide screens
	// while you read. The current section is marked and a thin line fills as you
	// move through the article. It sits beside the reading column (never over it)
	// and only appears when there is room; phones use the header's contents sheet.
	import { reading } from '$lib/reading.svelte';

	let list: HTMLOListElement | undefined = $state();
	$effect(() => {
		const i = reading.index;
		if (i < 0 || !list) return;
		const el = list.children[i] as HTMLElement | undefined;
		if (!el) return;
		const lo = el.offsetTop - 12;
		const hi = el.offsetTop + el.offsetHeight + 12;
		if (lo < list.scrollTop || hi > list.scrollTop + list.clientHeight) list.scrollTo({ top: lo - list.clientHeight / 3, behavior: 'smooth' });
	});
</script>

{#if reading.entries.length > 1 && reading.past}
	<nav class="rail" aria-label="On this page" style:--p={reading.progress}>
		<span class="eyebrow">On this page</span>
		<ol bind:this={list}>
			{#each reading.entries as e, i (e.id)}
				<li class:is-current={reading.index === i} class:is-done={reading.index > i}>
					<a href={`#${e.id}`} aria-current={reading.index === i ? 'location' : undefined}>
						<span class="n">{String(i + 1).padStart(2, '0')}</span>
						<span class="t">{e.text}</span>
					</a>
				</li>
			{/each}
		</ol>
		<span class="pct" aria-hidden="true">{Math.round(reading.progress * 100)}%</span>
	</nav>
{/if}

<style>
	.rail {
		display: none;
	}

	/* Only where the margin beside the 680px column can hold it. */
	@media (min-width: 1180px) {
		.rail {
			position: fixed;
			z-index: 5;
			top: calc(var(--topbar-h) + 48px);
			left: calc(50% + var(--measure) / 2 + 48px);
			width: min(250px, calc(50vw - var(--measure) / 2 - 72px));
			display: grid;
			gap: var(--s-3);
			animation: rail-in var(--dur) var(--ease-out);
		}

		ol {
			list-style: none;
			margin: 0;
			padding: 0 0 0 2px;
			position: relative;
			max-height: calc(100vh - var(--topbar-h) - 190px);
			overflow-y: auto;
			scrollbar-width: none;
		}

		ol::-webkit-scrollbar {
			display: none;
		}

		li {
			position: relative;
		}

		a {
			display: grid;
			grid-template-columns: 24px minmax(0, 1fr);
			gap: 6px;
			align-items: baseline;
			padding: 7px 0 7px 14px;
			border-left: 2px solid var(--line);
			color: var(--ink-3);
			text-decoration: none;
			font-size: 13px;
			line-height: 1.35;
			transition: color var(--dur-fast) ease, border-color var(--dur-fast) ease;
		}

		a:hover {
			color: var(--ink);
		}

		.n {
			font: 500 10.5px/1.6 var(--font-mono);
			font-variant-numeric: tabular-nums;
		}

		li.is-done a {
			border-left-color: var(--line-strong);
		}

		li.is-current a {
			border-left-color: var(--subject-ink, var(--purple-ink));
			color: var(--ink);
			font-weight: 600;
		}

		li.is-current .n {
			color: var(--subject-ink, var(--purple-ink));
		}

		.pct {
			font: 500 11.5px/1 var(--font-mono);
			letter-spacing: 0.04em;
			color: var(--ink-3);
			padding-left: 16px;
			font-variant-numeric: tabular-nums;
		}
	}

	@keyframes rail-in {
		from {
			opacity: 0;
			transform: translateX(8px);
		}
	}
</style>
