<script lang="ts">
	import { settings, getTagById, getAuthorById } from '$lib/content';
	import { SITE_URL, postUrl, editUrl, ISSUES_URL } from '$lib/site';
	import Seo from '$lib/components/Seo.svelte';
	import ArticleHeader from '$lib/components/reading/ArticleHeader.svelte';
	import Toc from '$lib/components/reading/Toc.svelte';
	import FlowerVine from '$lib/components/reading/FlowerVine.svelte';
	import SectionPill from '$lib/components/reading/SectionPill.svelte';
	import LessonNav from '$lib/components/reading/LessonNav.svelte';
	import WidgetHydrator from '$lib/components/reading/WidgetHydrator.svelte';
	import PostRow from '$lib/components/ui/PostRow.svelte';
	import Newsletter from '$lib/components/Newsletter.svelte';
	import Giscus from '$lib/components/Giscus.svelte';
	import { coursePlace, subjectForPost } from '$lib/content';
	import { reveal } from '$lib/actions';
	import { pauses } from '$lib/pause';

	let { data } = $props();
	const isPost = $derived(data.post.type === 'post');
	const place = $derived(isPost ? coursePlace(data.post.slug) : null);
	const subject = $derived(subjectForPost(data.post));
	let article: HTMLElement | undefined = $state();
	const seoDescription = $derived(
		(data.post.custom_excerpt ?? data.post.plaintext.slice(0, 200)).replace(/\s+/g, ' ').trim()
	);
	const author = $derived(
		data.post.primary_author ? (getAuthorById(data.post.primary_author) ?? null) : null
	);
	const jsonLd = $derived(
		isPost
			? {
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: data.post.title,
					description: seoDescription,
					datePublished: data.post.published_at,
					dateModified: data.post.updated_at,
					wordCount: data.post.words,
					url: postUrl(data.post.slug),
					mainEntityOfPage: postUrl(data.post.slug),
					publisher: {
						'@type': 'Organization',
						name: settings.title,
						url: `${SITE_URL}/`,
						...(settings.logo
							? {
									logo: {
										'@type': 'ImageObject',
										url: settings.logo.startsWith('http')
											? settings.logo
											: SITE_URL + settings.logo
									}
								}
							: {})
					},
					...(data.post.feature_image
						? {
								image: data.post.feature_image.startsWith('http')
									? data.post.feature_image
									: SITE_URL + data.post.feature_image
							}
						: {}),
					...(author
						? {
								author: {
									'@type': 'Person',
									name: author.name,
									url: `${SITE_URL}/author/${author.slug}/`
								}
							}
						: {})
				}
			: null
	);
</script>

<Seo
	title={`${data.post.title} — ${settings.title}`}
	description={seoDescription}
	image={data.post.feature_image}
	type={isPost ? 'article' : 'website'}
	publishedAt={isPost ? data.post.published_at : null}
	updatedAt={isPost ? data.post.updated_at : null}
	markdownAlt
	{jsonLd}
/>

<div class="subject--{subject}">
	{#if data.post.widgets?.length}
		<WidgetHydrator />
	{/if}
	{#if isPost}
		<FlowerVine {article} />
		<SectionPill {article} {place} />
	{/if}

	<article bind:this={article} data-pagefind-body>
		{#if isPost}
			<ArticleHeader post={data.post} {place} />
		{:else}
			<header class="page-header wrap wrap--measure">
				<h1>{data.post.title}</h1>
			</header>
		{/if}

		<div class="wrap">
			{#if isPost && data.post.toc?.length > 1}
				<Toc entries={data.post.toc} />
			{/if}
			<div class="prose" use:reveal={{ selector: 'blockquote, h2' }} use:pauses={data.html}>
				{@html data.html}
			</div>
			<p class="fix" data-pagefind-ignore>
				Found a mistake or something to improve?
				<a href={editUrl(data.post.slug, data.post.type)} target="_blank" rel="noreferrer">Suggest a fix</a>
				or <a href={ISSUES_URL} target="_blank" rel="noreferrer">report an issue</a> on GitHub.
			</p>
		</div>
	</article>

	{#if isPost}
		{#if place}
			<LessonNav {place} slug={data.post.slug} />
		{/if}

		{#if data.related.length}
			<section class="wrap wrap--measure keep" aria-labelledby="keep-h">
				<h2 id="keep-h" class="eyebrow">Keep reading</h2>
				<div class="keep-list">
					{#each data.related as p (p.id)}
						<PostRow post={p} />
					{/each}
				</div>
			</section>
		{/if}

		<section class="wrap wrap--measure after" data-pagefind-ignore>
			<div class="panel news">
				<span class="eyebrow">Newsletter</span>
				<p>Get the next lesson in your inbox.</p>
				<Newsletter />
			</div>
			<Giscus />
		</section>
	{/if}
</div>

<style>
	.page-header {
		padding-block: var(--s-7) var(--s-5);
		text-align: center;
	}

	.page-header h1 {
		font-size: var(--fs-h1);
		letter-spacing: -0.03em;
	}

	.fix {
		max-width: var(--measure);
		margin: var(--s-7) auto 0;
		padding-top: var(--s-4);
		border-top: 1px solid var(--line);
		font-size: var(--fs-small);
		color: var(--ink-3);
	}

	.fix a {
		color: var(--ink-2);
		text-underline-offset: 3px;
	}

	.keep {
		margin-top: var(--s-8);
	}

	.keep-list {
		margin-top: var(--s-3);
		border-bottom: 1px solid var(--line);
	}

	.after {
		display: grid;
		gap: var(--s-6);
		margin-top: var(--s-7);
	}

	.news {
		display: grid;
		gap: var(--s-2);
		text-align: center;
		justify-items: center;
	}

	.news p {
		font-size: var(--fs-h3);
		font-weight: 500;
	}
</style>
