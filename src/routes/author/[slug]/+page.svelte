<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Archive from '$lib/components/ui/Archive.svelte';
	import { settings } from '$lib/content';
	let { data } = $props();
</script>

<Seo title={`${data.author.name} — ${settings.title}`} description={data.author.bio ?? settings.description} markdownAlt />

<Archive eyebrow="Author" title={data.author.name} lede={data.author.bio} posts={data.posts} />
