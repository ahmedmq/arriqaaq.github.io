<script lang="ts">
	import { base } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import Archive from '$lib/components/ui/Archive.svelte';
	import { pageTitle } from '$lib/site';
	let { data } = $props();
</script>

<Seo title={pageTitle(`Older articles, page ${data.page}`)} description={`Older Arriqaaq articles, page ${data.page} of ${data.totalPages}: ${data.posts.slice(0, 3).map((p) => p.title).join('; ')}.`.slice(0, 160)} markdownAlt />

<Archive eyebrow={`Page ${data.page} of ${data.totalPages}`} title="Older articles" posts={data.posts}>
	{#snippet footer()}
		<nav class="pager" aria-label="Pages">
			<a class="btn btn--ghost" href={data.page > 2 ? `${base}/page/${data.page - 1}/` : `${base}/articles/`}>← Newer</a>
			{#if data.page < data.totalPages}
				<a class="btn btn--ghost" href={`${base}/page/${data.page + 1}/`}>Older →</a>
			{/if}
		</nav>
	{/snippet}
</Archive>

<style>
	.pager {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
		margin-top: var(--s-6);
	}
</style>
