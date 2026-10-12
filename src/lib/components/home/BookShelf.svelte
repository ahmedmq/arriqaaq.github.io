<script lang="ts">
	// Landing page row: the books, standing, one tap from their pages. Swipes on phones.
	import { base } from '$app/paths';
	import { books } from '$lib/content';
	import Book3D from '$lib/components/books/Book3D.svelte';
</script>

<section class="section" aria-labelledby="books-h">
	<div class="wrap">
		<div class="head">
			<div class="section-head">
				<span class="eyebrow">Arriqaaq books</span>
				<h2 class="split" id="books-h">Our books, <em>free to read.</em></h2>
			</div>
			<a class="btn btn--ghost" href={`${base}/books/`}>All books <span class="arrow">→</span></a>
		</div>
		<ul class="strip">
			{#each books as b (b.slug)}
				<li class="bk--{b.shelf}">
					<a class="bk-link" href={`${base}/books/${b.slug}/`} aria-label={`${b.title}, book details`}><Book3D book={b} /></a>
					<a class="name" href={`${base}/books/${b.slug}/`}>{b.title}</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: var(--s-4);
		margin-bottom: var(--s-5);
	}

	.head .section-head {
		margin-bottom: 0;
	}

	.strip {
		list-style: none;
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--s-3) var(--gutter) var(--s-4);
		display: flex;
		align-items: flex-end;
		gap: var(--s-5);
		overflow-x: auto;
		scrollbar-width: none;
		scroll-snap-type: x proximity;
		/* A book is never wider than its slot, so neighbours cannot touch. */
		--bh: 230px;
		--wmax: 160px;
	}

	.strip::-webkit-scrollbar {
		display: none;
	}

	li {
		flex: none;
		display: grid;
		gap: var(--s-3);
		justify-items: center;
		width: 200px;
		scroll-snap-align: start;
	}

	.name {
		color: var(--ink);
		font-size: var(--fs-small);
		line-height: 1.3;
		text-align: center;
		text-decoration: none;
		text-wrap: balance;
		min-height: 2.6em;
	}

	@media (max-width: 640px) {
		.strip {
			--bh: 190px;
			--wmax: 124px;
			gap: var(--s-4);
		}
		li {
			width: 150px;
		}
	}
</style>
