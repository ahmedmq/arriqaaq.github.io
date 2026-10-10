<script lang="ts">
	import { base } from '$app/paths';
	import { settings, courses, tags, getTagById } from '$lib/content';
	import { SITE_URL, DEFAULT_OG_IMAGE } from '$lib/site';
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import Manifesto from '$lib/components/home/Manifesto.svelte';
	import SubjectCards from '$lib/components/home/SubjectCards.svelte';
	import ChapterCarousel from '$lib/components/home/ChapterCarousel.svelte';
	import CourseCard from '$lib/components/course/CourseCard.svelte';
	import PostRow from '$lib/components/ui/PostRow.svelte';
	import Newsletter from '$lib/components/Newsletter.svelte';
	import { reveal } from '$lib/actions';

	let { data } = $props();

	// Filter chips: the most common primary tags among recent posts.
	const tagCounts = new Map<string, number>();
	for (const p of data.posts) if (p.primary_tag) tagCounts.set(p.primary_tag, (tagCounts.get(p.primary_tag) ?? 0) + 1);
	const filters = [...tagCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([id]) => getTagById(id)!)
		.filter(Boolean);

	let active = $state<string | null>(null);
	const shown = $derived(data.posts.filter((p) => !active || p.primary_tag === active).slice(0, 6));

	const sameAs = settings.navigation.map((n) => n.url).filter((u) => /instagram\.com|github\.com/.test(u));
	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: settings.title,
			url: `${SITE_URL}/`,
			description: settings.description,
			inLanguage: 'en'
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: settings.title,
			url: `${SITE_URL}/`,
			description: settings.description,
			logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
			image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
			sameAs
		}
	];
</script>

<Seo {jsonLd} markdownAlt />

<Hero />
<Manifesto />
<SubjectCards />

<section class="section" aria-labelledby="route-h">
	<div class="wrap">
		<div class="section-head">
			<span class="eyebrow">Follow a route</span>
			<h2 class="split" id="route-h">Learn Usul al-Fiqh, <em>step by step.</em></h2>
		</div>
		<div use:reveal data-reveal>
			{#each courses as c}
				<CourseCard course={c} />
			{/each}
		</div>
	</div>
</section>

<section class="section latest" aria-labelledby="latest-h">
	<div class="wrap">
		<div class="latest-head">
			<div class="section-head">
				<span class="eyebrow">From the desk</span>
				<h2 class="split" id="latest-h">New from <em>Arriqaaq.</em></h2>
			</div>
			<a class="btn btn--ghost" href={`${base}/articles/`}>All articles <span class="arrow">→</span></a>
		</div>
		<div class="scroll-x filters" role="toolbar" aria-label="Filter by topic">
			<button class="chip" aria-pressed={active === null} onclick={() => (active = null)}>All</button>
			{#each filters as t}
				<button class="chip" aria-pressed={active === t.id} onclick={() => (active = t.id)}>{t.name}</button>
			{/each}
		</div>
		<div class="list">
			{#each shown as p (p.id)}
				<PostRow post={p} />
			{/each}
		</div>
	</div>
</section>

<section class="section topics-band" aria-labelledby="topics-h">
	<div class="wrap">
		<div class="section-head">
			<span class="eyebrow">Browse by topic</span>
			<h2 class="split" id="topics-h">Explore by <em>topic.</em></h2>
		</div>
		<ul class="topic-list">
			{#each [...tags].filter((t) => t.post_count > 0).sort((a, b) => b.post_count - a.post_count || a.name.localeCompare(b.name)) as t (t.id)}
				<li>
					<a href={`${base}/tag/${t.slug}/`}>
						<span>{t.name}</span>
						<span class="n">{t.post_count}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<ChapterCarousel />

<section class="section news" aria-labelledby="news-h">
	<div class="wrap">
		<div class="news-card">
			<div class="section-head section-head--center">
				<span class="eyebrow">Newsletter</span>
				<h2 class="split" id="news-h">New lessons, <em>in your inbox.</em></h2>
			</div>
			<Newsletter />
		</div>
	</div>
</section>

<style>
	.latest-head {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: var(--s-4);
		margin-bottom: var(--s-5);
	}

	.latest-head .section-head {
		margin-bottom: 0;
	}

	.filters {
		margin-bottom: var(--s-4);
	}

	.list {
		border-bottom: 1px solid var(--line);
	}

	.topics-band {
		padding-top: 0;
	}

	/* All topics as a tidy grid of rows (the original "Browse by discipline"). */
	.topic-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 var(--s-4);
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--line);
	}

	.topic-list a {
		text-transform: capitalize;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--s-2);
		min-height: var(--tap);
		padding-block: 12px;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		font-weight: 500;
		transition: color var(--dur-fast) ease;
	}

	.topic-list a:hover {
		color: var(--purple-ink);
	}

	.topic-list .n {
		font-size: var(--fs-xs);
		font-variant-numeric: tabular-nums;
		color: var(--ink-3);
	}

	@media (min-width: 720px) {
		.topic-list {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 0 var(--s-6);
		}
	}

	@media (min-width: 1040px) {
		.topic-list {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.news {
		padding-bottom: 0;
	}

	.news-card {
		padding: var(--s-7) var(--s-5);
		border-radius: var(--r-lg);
		background: var(--surface);
	}

	.news-card .section-head {
		margin-bottom: var(--s-4);
	}
</style>
