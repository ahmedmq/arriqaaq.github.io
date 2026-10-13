<script lang="ts">
	// Article header (OpenAI template): centred date and topic, big title,
	// dek, then an author/share row. Lessons get a course banner on top.
	import { track } from '$lib/analytics';
	import { base } from '$app/paths';
	import type { CoursePlace, Post } from '$lib/types';
	import { getTagById, getAuthorById } from '$lib/content';
	import { doneSet, onProgress } from '$lib/progress';

	type Props = { post: Post; place: CoursePlace | null };
	let { post, place }: Props = $props();

	const tag = $derived(post.primary_tag ? getTagById(post.primary_tag) : null);
	const author = $derived(post.primary_author ? getAuthorById(post.primary_author) : null);
	const date = $derived(
		new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
	);
	const minutes = $derived(Math.max(1, Math.round((post.words || post.reading_time * 200) / 200)));
	const lessons = $derived(place ? place.course.modules.flatMap((m) => m.lessons) : []);

	let done = $state<Set<string>>(new Set());
	$effect(() => {
		const sync = () => (done = doneSet());
		sync();
		return onProgress(sync);
	});

	let copied = $state(false);
	async function share() {
		const url = location.href;
		try {
			if (navigator.share) {
				await navigator.share({ title: post.title, url });
				track('share', { method: 'share_sheet', content_type: 'article', item_id: post.slug });
			} else {
				await navigator.clipboard.writeText(url);
				track('share', { method: 'copy_link', content_type: 'article', item_id: post.slug });
				copied = true;
				setTimeout(() => (copied = false), 1800);
			}
		} catch {
			/* share sheet dismissed */
		}
	}
</script>

<header class="article-header">
	{#if place}
		<a class="course-banner" href={`${base}/courses/${place.course.slug}/`}>
			<span class="cb-top">
				<span class="chip chip--subject">Course</span>
				<span class="cb-title">{place.course.title}</span>
				<span class="cb-n">Lesson {place.lesson.n} of {place.course.lesson_count}</span>
			</span>
			<span class="cb-track" aria-hidden="true">
				{#each lessons as l}
					<i class:is-here={l.slug === post.slug} class:is-done={done.has(l.slug)}></i>
				{/each}
			</span>
			<span class="cb-module">Step: {place.module.title} <span aria-hidden="true">· View roadmap →</span></span>
		</a>
	{/if}

	<div class="meta">
		<time datetime={post.published_at.slice(0, 10)}>{date}</time>
		{#if tag}<a href={`${base}/tag/${tag.slug}/`}>{tag.name}</a>{/if}
		<span>{minutes} min read</span>
	</div>

	<h1>{place ? place.lesson.title : post.title}</h1>
	{#if place}
		<p class="dek">{post.custom_excerpt ?? place.course.tagline}</p>
	{:else if post.custom_excerpt}
		<p class="dek">{post.custom_excerpt}</p>
	{/if}

	<div class="byline">
		{#if author}<span class="who">By {author.name}</span>{/if}
		<span class="stats">{(post.words ?? 0).toLocaleString('en-US')} words</span>
		<button class="share" onclick={share} aria-live="polite">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14 21 3M21 3h-6M21 3v6M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
			{copied ? 'Link copied' : 'Share'}
		</button>
	</div>
</header>

<style>
	.article-header {
		display: grid;
		justify-items: center;
		gap: var(--s-4);
		max-width: calc(var(--measure) + 2 * var(--gutter));
		margin-inline: auto;
		padding: var(--s-7) var(--gutter) var(--s-5);
		text-align: center;
	}

	.course-banner {
		display: grid;
		gap: var(--s-3);
		width: 100%;
		margin-bottom: var(--s-3);
		padding: var(--s-4);
		border-radius: var(--r);
		background: var(--surface);
		text-align: left;
		text-decoration: none;
		transition: box-shadow var(--dur) ease;
	}

	.course-banner:hover {
		box-shadow: var(--shadow-1);
	}

	.cb-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		font-size: var(--fs-small);
	}

	.cb-top .chip {
		background: var(--page);
	}

	.cb-title {
		font-weight: 500;
	}

	.cb-n {
		margin-left: auto;
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 11px;
		color: var(--ink-2);
	}

	.cb-track {
		display: flex;
		gap: 3px;
	}

	.cb-track i {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: rgba(13, 12, 19, 0.1);
	}

	.cb-track i.is-done {
		background: var(--ink);
	}

	.cb-track i.is-here {
		background: var(--subject);
		transform: scaleY(1.5);
	}

	.cb-module {
		font-size: var(--fs-xs);
		color: var(--ink-2);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-1) var(--s-4);
		font-size: var(--fs-small);
		font-weight: 500;
		color: var(--ink-3);
	}

	.meta a {
		color: var(--ink-3);
		text-decoration: none;
	}

	.meta a:hover {
		color: var(--ink);
	}

	h1 {
		font-size: var(--fs-h1);
		line-height: 1.12;
		letter-spacing: -0.03em;
		max-width: 20ch;
	}

	.dek {
		max-width: 36rem;
		font-size: var(--fs-lead);
		line-height: 1.5;
		color: var(--ink-2);
	}

	.byline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--s-2) var(--s-4);
		width: 100%;
		margin-top: var(--s-3);
		padding-top: var(--s-4);
		border-top: 1px solid var(--line);
		font-size: var(--fs-small);
		color: var(--ink-3);
	}

	.who {
		color: var(--ink);
		font-weight: 500;
	}

	.share {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		padding: 6px 12px;
		border: 0;
		border-radius: var(--r-pill);
		background: var(--surface);
		font-size: var(--fs-small);
		font-weight: 500;
	}

	.share svg {
		width: 15px;
		height: 15px;
	}

	.share:hover {
		background: var(--surface-2);
	}
</style>
