<script lang="ts">
	import { settings, getTagById, getAuthorById } from '$lib/content';
	import { SITE_URL, DEFAULT_OG_IMAGE, ORGANIZATION_LD, postUrl, editUrl, ISSUES_URL, absUrl, pageTitle, breadcrumbLd } from '$lib/site';
	import Seo from '$lib/components/Seo.svelte';
	import ArticleHeader from '$lib/components/reading/ArticleHeader.svelte';
	import Toc from '$lib/components/reading/Toc.svelte';
	import FlowerVine from '$lib/components/reading/FlowerVine.svelte';
	import SectionPill from '$lib/components/reading/SectionPill.svelte';
	import SectionRail from '$lib/components/reading/SectionRail.svelte';
	import LessonNav from '$lib/components/reading/LessonNav.svelte';
	import PostBooks from '$lib/components/books/PostBooks.svelte';
	import WidgetHydrator from '$lib/components/reading/WidgetHydrator.svelte';
	import PostRow from '$lib/components/ui/PostRow.svelte';
	import Newsletter from '$lib/components/Newsletter.svelte';
	import Giscus from '$lib/components/Giscus.svelte';
	import { coursePlace, subjectForPost } from '$lib/content';
	import { reveal } from '$lib/actions';
	import { pauses } from '$lib/pause';
	import ReviewCard from '$lib/components/reading/ReviewCard.svelte';
	import ReferenceCards from '$lib/components/reading/ReferenceCards.svelte';
	import AnalyticsChoice from '$lib/components/site/AnalyticsChoice.svelte';
	import { trackReading } from '$lib/analytics';

	let { data } = $props();
	const isPost = $derived(data.post.type === 'post');
	const place = $derived(isPost ? coursePlace(data.post.slug) : null);
	const subject = $derived(subjectForPost(data.post));
	const courseSlugs = $derived(place ? place.course.modules.flatMap((m) => m.lessons.map((l) => l.slug)) : []);
	let article: HTMLElement | undefined = $state();
	// Reading depth and completion for posts (analytics; no-op without GA).
	$effect(() => {
		if (!article || !isPost) return;
		return trackReading(article, {
			content_id: data.post.slug,
			content_group: place ? 'lesson' : 'article',
			course_id: place?.course.slug,
			lesson_number: place?.lesson.n
		});
	});
	const seoDescription = $derived(data.post.description || settings.description);
	const author = $derived(
		data.post.primary_author ? (getAuthorById(data.post.primary_author) ?? null) : null
	);
	const tagNames = $derived(data.post.tags.map((id) => getTagById(id)?.name).filter(Boolean) as string[]);
	const abs = (u: string) => (u.startsWith('http') ? u : absUrl(u));
	// Home › course (or topic) › post. The course roadmap is the hub for its lessons.
	const crumbs = $derived(
		place
			? [{ name: place.course.title, path: `/courses/${place.course.slug}/` }, { name: data.post.title, path: `/${data.post.slug}/` }]
			: data.post.primary_tag && getTagById(data.post.primary_tag)
				? [
						{ name: getTagById(data.post.primary_tag)!.name, path: `/tag/${getTagById(data.post.primary_tag)!.slug}/` },
						{ name: data.post.title, path: `/${data.post.slug}/` }
					]
				: [{ name: data.post.title, path: `/${data.post.slug}/` }]
	);
	const jsonLd = $derived(
		isPost
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'BlogPosting',
						headline: data.post.title,
						description: seoDescription,
						datePublished: data.post.published_at,
						dateModified: data.post.updated_at,
						wordCount: data.post.words,
						inLanguage: 'en',
						url: postUrl(data.post.slug),
						mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl(data.post.slug) },
						image: abs(data.post.feature_image ?? DEFAULT_OG_IMAGE),
						isAccessibleForFree: true,
						...(tagNames.length ? { keywords: tagNames.join(', '), articleSection: tagNames[0] } : {}),
						...(place
							? {
									isPartOf: {
										'@type': 'Course',
										name: place.course.title,
										url: `${SITE_URL}/courses/${place.course.slug}/`
									},
									position: place.lesson.n
								}
							: {}),
						publisher: ORGANIZATION_LD,
						// The only author record is Arriqaaq itself, so it is the organisation.
						author:
							author && author.slug !== 'arriqaaq'
								? { '@type': 'Person', name: author.name, url: `${SITE_URL}/author/${author.slug}/` }
								: ORGANIZATION_LD
					},
					breadcrumbLd(crumbs)
				]
			: data.post.slug === 'about'
				? [
						{
							'@context': 'https://schema.org',
							'@type': 'AboutPage',
							url: postUrl('about'),
							name: data.post.title,
							mainEntity: ORGANIZATION_LD
						},
						breadcrumbLd(crumbs)
					]
				: breadcrumbLd(crumbs)
	);
</script>

<Seo
	title={pageTitle(data.post.seo_title || data.post.title)}
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
		<SectionRail />
		<SectionPill {article} {place} />
		{#if data.html.includes('data-sch=') || data.html.includes('data-term=')}
			<ReferenceCards {article} html={data.html} slug={data.post.slug} />
		{/if}
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
			{#if isPost}<PostBooks slug={data.post.slug} tags={data.post.tags} />{/if}
			{#if place}
				<ReviewCard slugs={courseSlugs} exclude={data.post.slug} />
			{/if}
			{#if isPost && data.post.toc?.length > 1}
				<Toc entries={data.post.toc} />
			{/if}
			<div class="prose" use:reveal={{ selector: 'blockquote, h2' }} use:pauses={{ html: data.html, lesson: place ? { slug: data.post.slug, title: data.post.title } : undefined }}>
				{@html data.html}
			</div>
			{#if data.post.slug === 'privacy'}<AnalyticsChoice />{/if}
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
			<Giscus term={data.post.aliases[0] ? `${data.post.aliases[0]}/` : null} />
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
