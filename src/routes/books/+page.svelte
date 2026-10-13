<script lang="ts">
	// The shelf: every Arriqaaq book standing on its own hanging shelf, as in
	// Ruqaya's store, drawn in line on white. Phones get two to a row.
	import { base } from '$app/paths';
	import { pageTitle } from '$lib/site';
	import type { BookShelf } from '$lib/types';
	import { SHELVES } from '$lib/books/shelves';
	import Seo from '$lib/components/Seo.svelte';
	import Book3D from '$lib/components/books/Book3D.svelte';
	import HangingShelf from '$lib/components/books/HangingShelf.svelte';

	let { data } = $props();
	let filter = $state<BookShelf | 'all'>('all');
	let ready = $state(false);
	$effect(() => {
		ready = true;
	});
	const shown = $derived(data.books.filter((b) => filter === 'all' || b.shelf === filter));
</script>

<Seo
	title={pageTitle('Free Islamic Books')}
	description="Books written and published by Arriqaaq on hadith, tafsir, history, family and for children. Every one is free to read online and share."
/>

<div class="wrap page">
	<header class="head">
		<span class="eyebrow">Arriqaaq books</span>
		<h1 class="split">Our books. <em>Free</em> <span class="mute">to read and share.</span></h1>
	</header>

	{#if ready}
		<div class="scroll-x" role="group" aria-label="Filter by subject">
			<button type="button" class="chip" aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>All books</button>
			{#each SHELVES as s}
				<button type="button" class="chip bk--{s.id}" aria-pressed={filter === s.id} onclick={() => (filter = s.id)}>{s.label}</button>
			{/each}
		</div>
	{/if}

	<ul class="grid" aria-live="polite">
		{#each shown as b (b.slug)}
			<li class="bcell bk--{b.shelf}">
				<HangingShelf>
					<a class="bk-link" href={`${base}/books/${b.slug}/`} aria-label={`${b.title}, book page`}>
						<Book3D book={b} />
					</a>
				</HangingShelf>
				<h2><a href={`${base}/books/${b.slug}/`}>{b.title}</a></h2>
				<p class="meta">{b.pages} pages · {b.year}</p>
				<div class="btn-pair">
					<a class="btn btn--bk" href={`${base}/books/${b.slug}/read/`}>Read now</a>
					<a class="btn btn--ghost" href={`${base}/books/${b.slug}/`}>Book details</a>
				</div>
			</li>
		{/each}
	</ul>

	<p class="note">Prefer paper? Some titles have a print edition on Amazon, linked from each book. Arriqaaq does not print or sell books itself.</p>
</div>

<style>
	.chip {
		text-transform: none;
	}

	.head {
		display: grid;
		gap: var(--s-4);
		padding-block: var(--s-7) var(--s-5);
	}

	.grid {
		list-style: none;
		margin: var(--s-6) 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--s-7) var(--s-5);
		align-items: start;
	}

	.bcell {
		display: grid;
		gap: var(--s-2);
		justify-items: center;
		text-align: center;
		min-width: 0;
		--bh: 270px;
		--wmax: 270px;
	}

	.bcell :global(.hshelf) {
		width: 100%;
	}

	.bcell :global(.hshelf-books) {
		min-height: calc(var(--bh) + 24px);
	}

	h2 {
		margin: var(--s-3) 0 0;
		/* Room for three lines in every cell, so a long title never moves the covers or buttons. */
		min-height: 2.5em;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		font-size: var(--fs-body);
		font-weight: 500;
		letter-spacing: -0.015em;
		line-height: 1.25;
		text-wrap: balance;
	}

	h2 a {
		color: inherit;
		text-decoration: none;
	}

	h2 a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.meta {
		margin: 0 0 var(--s-2);
		white-space: nowrap;
		font: 500 11.5px/1.4 var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--ink-3);
	}

	.btn-pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-2);
		width: 100%;
		max-width: 280px;
	}

	.btn-pair .btn {
		min-width: 0;
		padding-inline: var(--s-3);
	}

	.note {
		margin: var(--s-8) 0 var(--section);
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r);
		background: var(--surface);
		color: var(--ink-2);
		font-size: var(--fs-small);
	}

	@media (max-width: 800px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--s-6) var(--s-3);
		}
		.bcell {
			--bh: 226px;
			--wmax: 160px;
		}
		h2 {
			min-height: 3.75em;
			font-size: 0.9375rem;
		}
		.btn-pair {
			gap: 6px;
		}
		.btn-pair .btn {
			padding-inline: 6px;
			font-size: 12.5px;
			letter-spacing: -0.01em;
		}
	}
</style>
