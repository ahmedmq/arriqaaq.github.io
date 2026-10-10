<script lang="ts">
	// /writing/ was renamed to /articles/. Keep old links working on a static
	// host: meta refresh, a canonical link, and a visible fallback link.
	import { base } from '$app/paths';
	import { SITE_URL } from '$lib/site';
</script>

<svelte:head>
	<meta http-equiv="refresh" content={`0; url=${base}/articles/`} />
	<link rel="canonical" href={`${SITE_URL}/articles/`} />
	<meta name="robots" content="noindex" />
</svelte:head>

<p class="wrap moved">This page moved to <a href={`${base}/articles/`}>Articles</a>.</p>

<style>
	.moved {
		padding-block: var(--s-8);
		color: var(--ink-2);
	}
</style>
