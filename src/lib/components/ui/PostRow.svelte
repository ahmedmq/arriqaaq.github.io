<script lang="ts">
	// One row in a list of articles (the Anthropic / OpenAI news-list pattern):
	// white, no thumbnail. Topic and date on a quiet line, then the title.
	// Course lessons show their course and lesson number.
	import { base } from '$app/paths';
	import type { Post } from '$lib/types';
	import { coursePlace, accentForPost, getTagById } from '$lib/content';
	import PixelCover from './PixelCover.svelte';

	type Props = { post: Post };
	let { post }: Props = $props();

	const place = $derived(coursePlace(post.slug));
	const subject = $derived(accentForPost(post.slug));
	const tag = $derived(post.primary_tag ? getTagById(post.primary_tag) : null);
	const title = $derived(place ? place.lesson.title : post.title);
	const minutes = $derived(Math.max(1, Math.round((post.words || post.reading_time * 200) / 200)));
	const date = $derived(
		new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
	);
</script>

<a class="row subject--{subject}" href={`${base}/${post.slug}/`}>
	<span class="thumb"><PixelCover seed={post.slug} {subject} cols={6} rows={6} ratio={1} /></span>
	<span class="kicker">
		{#if place}
			<span class="topic">{place.course.title} · Lesson {place.lesson.n}</span>
		{:else if tag}
			<span class="topic">{tag.name}</span>
		{/if}
		<span class="date">{date}</span>
	</span>
	<span class="title">{title}</span>
	{#if post.custom_excerpt && !place}<span class="excerpt">{post.custom_excerpt}</span>{/if}
	<span class="meta">{minutes} min read</span>
</a>

<style>
	/* Pixel thumb on the left (arriqaaqlabs), text on the right. */
	.row {
		display: grid;
		grid-template-columns: 72px 1fr;
		column-gap: var(--s-4);
		row-gap: 6px;
		align-items: start;
		padding-block: var(--s-5);
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.thumb {
		grid-row: 1 / span 4;
		display: block;
		width: 72px;
		aspect-ratio: 1;
		border-radius: var(--r-sm);
		overflow: hidden;
	}

	.kicker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-1) var(--s-4);
		font-size: var(--fs-xs);
		font-weight: 500;
	}

	.topic {
		color: var(--subject-ink);
	}

	.date {
		color: var(--ink-3);
	}

	.title {
		font-size: 1.125rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.02em;
		text-wrap: balance;
		transition: color var(--dur-fast) ease;
	}

	.excerpt {
		color: var(--ink-2);
		font-size: var(--fs-small);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.meta {
		font-size: var(--fs-xs);
		color: var(--ink-3);
	}

	.row:hover .title {
		color: var(--subject-ink);
	}

	@media (min-width: 720px) {
		.row {
			grid-template-columns: 112px 1fr;
			column-gap: var(--s-5);
		}

		.thumb {
			width: 112px;
		}

		.title {
			font-size: 1.3125rem;
		}
	}
</style>
