<script lang="ts">
	import { base } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Archive from '$lib/components/ui/Archive.svelte';
	import { settings, courses, subjectForTag } from '$lib/content';
	import { pageTitle, breadcrumbLd } from '$lib/site';
	let { data } = $props();
	const subject = $derived(subjectForTag(data.tag.slug));
	const course = $derived(courses.find((c) => c.subject === subject && subject !== 'general'));
	// A topic with one or two articles is a thin page: keep it out of the index
	// (the articles themselves are indexed) and out of the sitemap.
	const thin = $derived(data.posts.length < 3);
	const description = $derived(
		data.tag.description && data.tag.description.length > 60
			? data.tag.description
			: `Arriqaaq articles on ${data.tag.name}: ${data.posts.slice(0, 3).map((p) => p.title).join('; ')}.`.slice(0, 160)
	);
</script>

<Seo title={pageTitle(data.tag.name)} {description} noindex={thin} markdownAlt jsonLd={breadcrumbLd([{ name: data.tag.name, path: `/tag/${data.tag.slug}/` }])} />

<Archive eyebrow="Topic" title={data.tag.name} lede={data.tag.description} posts={data.posts} {subject}>
	{#snippet toolbar()}
		{#if course}
			<a class="btn" href={`${base}/courses/${course.slug}/`}>Read these in order: {course.title} <span class="arrow">→</span></a>
		{/if}
	{/snippet}
</Archive>
