<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/base.css';
	import '$lib/styles/prose.css';
	import '$lib/styles/widgets.css';
	import '$lib/styles/books.css';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';

	let { children } = $props();
</script>

<a class="skip" href="#main">Skip to content</a>
<SiteHeader />
<main id="main">
	{@render children()}
</main>
<SiteFooter />

<style>
	.skip {
		position: absolute;
		left: var(--s-3);
		top: -60px;
		z-index: 60;
		padding: var(--s-2) var(--s-4);
		border-radius: var(--r-pill);
		background: var(--ink);
		color: #fff;
		text-decoration: none;
	}

	.skip:focus {
		top: var(--s-2);
	}
</style>
