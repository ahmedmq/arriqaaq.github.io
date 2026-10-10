<script lang="ts">
	// Shared archive layout: header (eyebrow, title, lede, count) and a list
	// of PostRows. Used by /articles/, tag, author and paginated pages.
	import type { Post } from '$lib/types';
	import type { Snippet } from 'svelte';
	import PostRow from './PostRow.svelte';

	type Props = {
		eyebrow: string;
		title: string;
		lede?: string | null;
		posts: Post[];
		subject?: string;
		toolbar?: Snippet;
		footer?: Snippet;
	};
	let { eyebrow, title, lede = null, posts, subject = 'general', toolbar, footer }: Props = $props();
</script>

<div class="archive wrap subject--{subject}">
	<header class="head">
		<span class="eyebrow eyebrow--dot">{eyebrow}</span>
		<h1>{title}</h1>
		{#if lede}<p>{lede}</p>{/if}
	</header>
	{#if toolbar}<div class="toolbar">{@render toolbar()}</div>{/if}
	<p class="count">{posts.length} article{posts.length === 1 ? '' : 's'}</p>
	<div class="list">
		{#each posts as p (p.id)}
			<PostRow post={p} />
		{/each}
	</div>
	{#if footer}{@render footer()}{/if}
</div>

<style>
	.archive > * {
		max-width: 960px;
	}

	.head {
		display: grid;
		gap: var(--s-3);
		padding-block: var(--s-7) var(--s-5);
	}

	h1 {
		font-size: var(--fs-h1);
		letter-spacing: -0.03em;
	}

	.head p {
		font-size: var(--fs-lead);
		color: var(--ink-2);
		line-height: 1.5;
	}

	.toolbar {
		margin-bottom: var(--s-4);
	}

	.count {
		margin-bottom: var(--s-2);
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-3);
	}

	.list {
		border-bottom: 1px solid var(--line);
	}
</style>
