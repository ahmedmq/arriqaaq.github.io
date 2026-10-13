<script lang="ts">
	import '$lib/styles/tokens.css';
	import '$lib/styles/base.css';
	import '$lib/styles/prose.css';
	import '$lib/styles/widgets.css';
	import '$lib/styles/books.css';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import ConsentBanner from '$lib/components/site/ConsentBanner.svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_GSC_VERIFICATION } from '$env/static/public';
	import { coursePlace } from '$lib/content';
	import { GA_ID, pageView, contentGroup, startAnalytics } from '$lib/analytics';

	let { children } = $props();

	// One page_view per page, on first load and after every client-side
	// navigation. GA's own history-change page views must stay off (docs/seo-and-analytics.md).
	afterNavigate((nav) => {
		if (!GA_ID) return;
		startAnalytics();
		// page (not nav.to) has the route on the first load as well.
		const route = page.route.id ?? null;
		const slug = page.params.slug;
		const group = contentGroup(route, route === '/[slug]' && !!slug && !!coursePlace(slug));
		pageView(group, nav.type === 'enter' ? document.referrer : nav.from?.url.href);
	});
</script>

<svelte:head>
	{#if PUBLIC_GSC_VERIFICATION}
		<meta name="google-site-verification" content={PUBLIC_GSC_VERIFICATION} />
	{/if}
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<SiteHeader />
<main id="main">
	{@render children()}
</main>
<SiteFooter />
<ConsentBanner />

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
