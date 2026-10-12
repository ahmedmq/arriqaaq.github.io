<script lang="ts">
	// A book as a real 3D object: cover, spine in the shelf colour, page block.
	// Size comes from CSS (--bh, --wmax); shape from the cover ratio and the page
	// count. With `leaf`, the cover swings open onto the first pages (book page).
	import { base } from '$app/paths';
	import type { Book } from '$lib/types';

	type Props = { book: Book; leaf?: boolean; open?: boolean; class?: string };
	let { book, leaf = false, open = false, class: cls = '' }: Props = $props();

	const src = (s: string) => `url(${base}${s})`;
	// When the PDF's first page is the cover, the opened spread starts at page 2.
	const first = $derived(book.cover_is_page_one ? 1 : 0);
	const canOpen = $derived(leaf && book.previews.length > first + 1);
	const surname = $derived(book.authors[0].split(' ').slice(-1)[0]);
</script>

{#snippet cover()}
	{#if book.cover}
		<div class="b3-face b3-front" style:background-image={src(book.cover)}></div>
	{:else}
		<div class="b3-face b3-front">
			<div class="typecover"><small>Arriqaaq</small><b>{book.title}</b><small>{surname}</small></div>
		</div>
	{/if}
{/snippet}

<div class="b3 bk--{book.shelf} {cls}" class:open style:--ratio={book.ratio} style:--pages={book.pages ?? 100} aria-hidden="true">
	<div class="b3-obj">
		{#if canOpen}
			<div class="b3-face b3-first" style:background-image={src(book.previews[first + 1].src)}></div>
			<div class="b3-face b3-leaf">
				{@render cover()}
				<div class="leaf-in" style:background-image={src(book.previews[first].src)}></div>
			</div>
		{:else}
			{@render cover()}
		{/if}
		<div class="b3-face b3-back"></div>
		<div class="b3-face b3-spine"><span>{book.title}</span></div>
		<div class="b3-face b3-pages"></div>
		<div class="b3-face b3-top"></div>
	</div>
</div>
