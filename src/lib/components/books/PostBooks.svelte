<script lang="ts">
	// On a launch post: the book(s) it announces, with the two actions. Computed from
	// content/books (a book's `post`), so the post itself is never edited.
	import { base } from '$app/paths';
	import { books, getTagById } from '$lib/content';

	// `tags` are the post's tag ids. A post tagged `book` always links to the shelf, so a new
	// launch gets the card before its book file exists; once content/books/<slug>.yaml names
	// the post, the card shows that book with Read now and Book details.
	let { slug, tags = [] }: { slug: string; tags?: string[] } = $props();
	const mine = $derived(books.filter((b) => b.post === slug));
	const isBookPost = $derived(tags.some((id) => getTagById(id)?.slug === 'book'));
</script>

{#if !mine.length && isBookPost}
	<aside class="pb pb--shelf" data-pagefind-ignore aria-label="Arriqaaq books">
		<span class="eyebrow">On our shelf</span>
		<p class="lead">Read Arriqaaq's books free, right here.</p>
		<a class="btn btn--ghost" href={`${base}/books/`}>Browse all books <span class="arrow">→</span></a>
	</aside>
{:else if mine.length}
	<aside class="pb" data-pagefind-ignore aria-label="Read this book on Arriqaaq">
		<span class="eyebrow">On our shelf</span>
		<ul>
			{#each mine as b (b.slug)}
				<li class="bk--{b.shelf}">
					<a class="cv" href={`${base}/books/${b.slug}/`} tabindex="-1" aria-hidden="true">
						{#if b.cover}<img src={base + b.cover} alt="" width="64" height={Math.round(64 / b.ratio)} loading="lazy" />{/if}
					</a>
					<div class="txt">
						<a class="t" href={`${base}/books/${b.slug}/`}>{b.title}</a>
						<span class="m">{b.pages} pages · free</span>
					</div>
					<div class="btns">
						<a class="btn btn--bk" href={`${base}/books/${b.slug}/read/`}>Read now</a>
						<a class="btn btn--ghost" href={`${base}/books/${b.slug}/`}>Book details</a>
					</div>
				</li>
			{/each}
		</ul>
	</aside>
{/if}

<style>
	.pb {
		max-width: var(--measure);
		margin: var(--s-5) auto 0;
		padding: var(--s-4) var(--s-5) var(--s-5);
		border-radius: var(--r-lg);
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.pb--shelf {
		display: grid;
		gap: var(--s-3);
		justify-items: start;
	}

	.lead {
		margin: 0;
		font-weight: 500;
	}

	ul {
		list-style: none;
		margin: var(--s-3) 0 0;
		padding: 0;
		display: grid;
		gap: var(--s-4);
	}

	li {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr) auto;
		gap: var(--s-2) var(--s-4);
		align-items: center;
	}

	.cv img {
		display: block;
		width: 64px;
		height: auto;
		border-radius: 3px;
		box-shadow: 0 0 0 1px var(--line), 0 6px 12px -6px var(--shade);
	}

	.txt {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.t {
		color: var(--ink);
		font-weight: 500;
		text-decoration: none;
		text-wrap: balance;
	}

	.m {
		font: 500 11.5px/1.4 var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--ink-3);
	}

	.btns {
		display: flex;
		gap: var(--s-2);
	}

	@media (max-width: 640px) {
		.pb {
			padding-inline: var(--s-4);
		}
		li {
			grid-template-columns: 64px minmax(0, 1fr);
		}
		.btns {
			grid-column: 1 / -1;
		}
		.btns .btn {
			flex: 1 1 0;
			padding-inline: var(--s-3);
		}
	}
</style>
