<script lang="ts">
	// Contents box (from the arriqaaq.com/blog LSM post): mono label, numbered
	// entries. Long lists show the first six on phones with a "show all".
	import { reading } from '$lib/reading.svelte';

	type Props = { entries: { id: string; text: string }[] };
	let { entries }: Props = $props();
	const LIMIT = 6;
	let expanded = $state(false);
	const long = $derived(entries.length > LIMIT + 2);
</script>

<nav class="toc" class:is-collapsed={long && !expanded} aria-label="Contents">
	<h2 class="eyebrow">Contents · {entries.length} sections</h2>
	<ol>
		{#each entries as e, i (e.id)}
			<li class:is-extra={i >= LIMIT} class:is-current={reading.index === i}>
				<span class="n">{String(i + 1).padStart(2, '0')}</span>
				<a href={`#${e.id}`}>{e.text}</a>
			</li>
		{/each}
	</ol>
	{#if long}
		<button class="more" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
			{expanded ? 'Show fewer' : `Show all ${entries.length}`}
		</button>
	{/if}
</nav>

<style>
	.toc {
		max-width: var(--measure);
		margin: var(--s-2) auto var(--s-6);
		padding: var(--s-4) var(--s-5) var(--s-3);
		border-radius: var(--r);
		background: var(--surface);
	}

	.eyebrow {
		margin-bottom: var(--s-3);
		color: var(--subject-ink, var(--pink-ink));
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 2.1em 1fr;
		align-items: baseline;
		padding-block: 5px;
		font-size: 0.9375rem;
		line-height: 1.4;
	}

	.n {
		font: 600 0.75rem var(--font-sans);
		font-variant-numeric: tabular-nums;
		color: var(--subject-ink, var(--pink-ink));
	}

	a {
		color: var(--ink);
		text-decoration: none;
		border-radius: 3px;
		transition: background var(--dur-fast) ease;
	}

	a:hover {
		background: var(--page);
	}

	li.is-current a {
		font-weight: 600;
	}

	.is-collapsed li.is-extra {
		display: none;
	}

	.more {
		margin-top: var(--s-2);
		min-height: var(--tap);
		padding: 0;
		border: 0;
		background: none;
		font-size: var(--fs-small);
		font-weight: 500;
		color: var(--ink-2);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (min-width: 900px) {
		ol {
			columns: 2;
			column-gap: var(--s-6);
		}

		li {
			break-inside: avoid;
		}

		.is-collapsed li.is-extra {
			display: grid;
		}

		.more {
			display: none;
		}
	}
</style>
