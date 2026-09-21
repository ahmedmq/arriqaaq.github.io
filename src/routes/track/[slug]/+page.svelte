<script lang="ts">
	import { base } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import TrackJourney from '$lib/components/TrackJourney.svelte';
	import { onMount } from 'svelte';
	let { data } = $props();
	let completed = $state<number[]>([]);
	const storageKey = $derived(`arriqaaq:track:${data.track.slug}:completed`);
	onMount(() => {
		try { completed = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { completed = []; }
	});
	function toggleLesson(n: number) {
		completed = completed.includes(n) ? completed.filter((value) => value !== n) : [...completed, n].sort((a, b) => a - b);
		localStorage.setItem(storageKey, JSON.stringify(completed));
	}
</script>

<Seo title={`${data.track.title} — Learning path`} description={data.track.description} />

<article class="learning-path" style:--track-color={data.track.color} style:--track-accent={data.track.accent}>
	<header class="path-hero">
		<div class="path-hero-copy">
			<a class="garden-kicker" href={`${base}/#journeys`}>← All learning paths</a>
			<p class="path-label">{data.track.eyebrow}</p>
			<h1>{data.track.title}</h1>
			<p>{data.track.description}</p>
			{#if data.track.posts[0]}<a class="btn btn--primary" href={`${base}/${data.track.posts[0].slug}/`}>Begin lesson 1</a>{/if}
		</div>
		<div class="path-hero-art" aria-hidden="true"></div>
	</header>
	<TrackJourney track={data.track} {completed} />

	<section class="path-lessons" aria-labelledby="lessons-title">
		<div class="path-lessons-intro"><span class="garden-kicker">Your route</span><h2 id="lessons-title">{data.track.posts.length} lessons, in order</h2><p>Read from the beginning or return to the place you need. The sequence is editorially defined, not sorted by publication date.</p></div>
		<ol class="lesson-list">
			{#each data.track.posts as post, i}
				<li id={`lesson-${i + 1}`} class:is-complete={completed.includes(i + 1)}>
					<a href={`${base}/${post.slug}/`}>
						<span class="lesson-marker"><span>{String(i + 1).padStart(2, '0')}</span></span>
						<span class="lesson-copy"><small>Lesson {i + 1} · {post.reading_time} min</small><strong>{post.title.replace(/Usul-Al-Fiqh Made Easy \(Part \d+\)\s*-?\s*/i, '')}</strong>{#if post.custom_excerpt}<span>{post.custom_excerpt}</span>{/if}</span>
						<span class="lesson-arrow" aria-hidden="true">↗</span>
					</a>
					<button class="lesson-check" onclick={() => toggleLesson(i + 1)} aria-label={completed.includes(i + 1) ? `Mark lesson ${i + 1} incomplete` : `Mark lesson ${i + 1} complete`}>
						<span aria-hidden="true">{completed.includes(i + 1) ? '✓' : '○'}</span>{completed.includes(i + 1) ? 'Gathered' : 'Mark complete'}
					</button>
				</li>
			{/each}
		</ol>
	</section>
</article>
