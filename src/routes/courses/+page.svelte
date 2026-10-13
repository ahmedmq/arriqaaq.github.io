<script lang="ts">
	import { settings } from '$lib/content';
	import { SITE_URL, pageTitle } from '$lib/site';
	import Seo from '$lib/components/Seo.svelte';
	import CourseCard from '$lib/components/course/CourseCard.svelte';

	let { data } = $props();
	// Course list markup: an ItemList of the courses on this page.
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: data.courses.map((c, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Course',
				url: `${SITE_URL}/courses/${c.slug}/`,
				name: c.title,
				description: c.tagline,
				provider: { '@type': 'Organization', name: settings.title, sameAs: `${SITE_URL}/` }
			}
		}))
	};
</script>

<Seo title={pageTitle('Free Islamic Courses')} description="Free self-paced courses in Usul al-Fiqh and Mustalah Hadith with a lesson roadmap, plus Arriqaaq's live programmes in tafsir, hadith and Arabic." {jsonLd} />

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
