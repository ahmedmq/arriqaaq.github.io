<script lang="ts">
	import { settings } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import CourseCard from '$lib/components/course/CourseCard.svelte';

	let { data } = $props();
</script>

<Seo title={`Courses — ${settings.title}`} description="Self-paced courses with a roadmap, plus Arriqaaq's live programmes." />

<div class="wrap">
	<header class="head">
		<span class="eyebrow">Courses</span>
		<h1 class="split">Pick a course. <em>Follow the route.</em></h1>
	</header>

	<div class="list">
		{#each data.courses as c (c.slug)}
			<CourseCard course={c} />
		{/each}
	</div>

	{#if data.programmes}
		<section class="programmes" aria-labelledby="prog-h">
			<div class="section-head">
				<span class="eyebrow">Programmes</span>
				<h2 class="split" id="prog-h">Live <em>programmes.</em></h2>
			</div>
			<div class="prose">{@html data.programmes.html}</div>
		</section>
	{/if}
</div>

<style>
	.head {
		display: grid;
		gap: var(--s-4);
		padding-block: var(--s-7) var(--s-6);
	}

	.list {
		display: grid;
		gap: var(--s-5);
	}

	.programmes {
		margin-top: var(--section);
	}

	.programmes .prose > :global(*) {
		margin-inline: 0;
	}
</style>
