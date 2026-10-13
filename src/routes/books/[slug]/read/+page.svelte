<script lang="ts">
	import { settings } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import PdfReader from '$lib/components/books/PdfReader.svelte';

	let { data } = $props();
</script>

<Seo
	title={`Read ${data.book.title} — ${settings.title}`}
	description={`Read ${data.book.title} by ${data.book.authors.join(' and ')} here, free.`}
	image={data.book.cover}
	noindex
/>

{#key data.book.slug}
	<PdfReader book={data.book} />
{/key}
