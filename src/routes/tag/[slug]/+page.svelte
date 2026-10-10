<script lang="ts">
	import { base } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Archive from '$lib/components/ui/Archive.svelte';
	import { settings, courses, subjectForTag } from '$lib/content';
	let { data } = $props();
	const subject = $derived(subjectForTag(data.tag.slug));
	const course = $derived(courses.find((c) => c.subject === subject && subject !== 'general'));
</script>

<Seo title={`${data.tag.name} — ${settings.title}`} description={data.tag.description ?? settings.description} markdownAlt />

<Archive eyebrow="Topic" title={data.tag.name} lede={data.tag.description} posts={data.posts} {subject}>
	{#snippet toolbar()}
		{#if course}
			<a class="btn" href={`${base}/courses/${course.slug}/`}>Read these in order: {course.title} <span class="arrow">→</span></a>
		{/if}
	{/snippet}
</Archive>
