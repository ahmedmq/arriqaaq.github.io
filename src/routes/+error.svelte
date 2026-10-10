<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { settings } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import Flower from '$lib/components/ui/Flower.svelte';
</script>

<Seo title={`Error — ${settings.title}`} />

<section class="error wrap wrap--measure">
	<Flower size={48} petal="var(--line-strong)" centre="var(--amber)" />
	<span class="eyebrow">Error {page.status}</span>
	<h1>{page.status === 404 ? 'This page has wandered off.' : 'Something went wrong.'}</h1>
	<p>{page.status === 404 ? 'The link may be old, or the page may have moved.' : page.error?.message}</p>
	<div class="cta">
		<a class="btn" href={`${base}/`}>Back home</a>
		<a class="btn btn--ghost" href={`${base}/articles/`}>Browse all articles</a>
	</div>
</section>

<style>
	.error {
		display: grid;
		justify-items: center;
		gap: var(--s-4);
		padding-block: var(--s-9);
		text-align: center;
	}

	h1 {
		font-size: var(--fs-h1);
		letter-spacing: -0.03em;
	}

	p {
		color: var(--ink-2);
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-3);
	}
</style>
