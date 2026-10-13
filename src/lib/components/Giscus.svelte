<script lang="ts">
	import { onMount } from 'svelte';
	import { GISCUS } from '$lib/giscus-config';

	// `term`: when a post's slug changed, pass its old giscus term (the old
	// pathname without the leading slash, e.g. "saddzarai/") so the thread that
	// already exists keeps showing instead of a new empty one.
	type Props = { mapping?: string; term?: string | null };
	let { mapping = 'pathname', term = null }: Props = $props();

	let mountEl: HTMLDivElement | undefined = $state();

	onMount(() => {
		if (!GISCUS.repo || !GISCUS.repoId || !GISCUS.categoryId) return;
		const s = document.createElement('script');
		s.src = 'https://giscus.app/client.js';
		s.async = true;
		s.crossOrigin = 'anonymous';
		s.dataset.repo = GISCUS.repo;
		s.dataset.repoId = GISCUS.repoId;
		s.dataset.category = GISCUS.category;
		s.dataset.categoryId = GISCUS.categoryId;
		s.dataset.mapping = term ? 'specific' : mapping;
		if (term) s.dataset.term = term;
		s.dataset.strict = '0';
		s.dataset.reactionsEnabled = '1';
		s.dataset.emitMetadata = '1'; // lets analytics see when a comment is posted
		s.dataset.inputPosition = 'top';
		s.dataset.theme = 'light';
		s.dataset.lang = 'en';
		s.dataset.loading = 'lazy';
		mountEl?.appendChild(s);
	});
</script>

{#if GISCUS.repo}
	<section class="comments" aria-label="Discussion">
		<small class="related-heading">Discussion</small>
		<div bind:this={mountEl}></div>
	</section>
{/if}

<style>
	.comments {
		max-width: var(--reading-w);
		margin: 48px auto;
	}
</style>
