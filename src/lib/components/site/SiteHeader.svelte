<script lang="ts">
	// Sticky site header. Phones: logo, current section (on articles), search,
	// menu button that opens a full-screen sheet. Desktop: inline nav links.
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { reading } from '$lib/reading.svelte';
	import Flower from '$lib/components/ui/Flower.svelte';
	import PagefindUI from '$lib/components/PagefindUI.svelte';

	const links = [
		{ href: '/courses/', label: 'Courses', match: '/courses/' },
		{ href: '/books/', label: 'Books', match: '/books/' },
		{ href: '/#subjects', label: 'Subjects', match: '#' },
		{ href: '/articles/', label: 'Articles', match: '/articles/' },
		{ href: '/about/', label: 'About', match: '/about/' }
	];

	let searchOpen = $state(false);
	let menuOpen = $state(false);
	let scrolled = $state(false);

	const path = $derived(page.url.pathname);
	const isActive = (m: string) => m !== '#' && path.startsWith(base + m);
	const showSection = $derived(reading.past && reading.section !== '');

	$effect(() => {
		path; // close the sheet on navigation
		menuOpen = false;
	});

	$effect(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
	});
</script>

<header class="site-header" class:is-scrolled={scrolled}>
	<div class="bar">
		<a class="brand" href={`${base}/`} aria-label="Arriqaaq, home">
			<Flower size={22} />
			<span class="wordmark" class:is-hidden={showSection}>arriqaaq</span>
		</a>

		{#if showSection}
			<span class="section" aria-live="polite">
				<span class="section-n">{String(reading.index + 1).padStart(2, '0')}</span>
				<span class="section-t">{reading.section}</span>
			</span>
		{/if}

		<nav class="links" aria-label="Primary">
			{#each links as l}
				<a href={base + l.href} class:is-active={isActive(l.match)}>{l.label}</a>
			{/each}
		</nav>

		<div class="actions">
			<button class="icon-btn quiet" aria-label="Search" onclick={() => (searchOpen = true)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
			</button>
			<button
				class="icon-btn quiet menu-btn"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				aria-controls="site-menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
					{#if menuOpen}<path d="M6 6l12 12M18 6 6 18" />{:else}<path d="M4 8h16M4 16h16" />{/if}
				</svg>
			</button>
		</div>
	</div>
</header>

{#if menuOpen}
	<div class="sheet" id="site-menu">
		<nav aria-label="Menu">
			{#each links as l, i}
				<a href={base + l.href} style:--i={i}>{l.label}<span aria-hidden="true">→</span></a>
			{/each}
		</nav>
		<div class="sheet-foot">
			<a class="btn btn--block" href={`${base}/courses/usul-al-fiqh/`}>Start Usul al-Fiqh</a>
			<div class="sheet-social">
				<a href="https://www.instagram.com/arriqaaq/" target="_blank" rel="noreferrer">Instagram</a>
				<a href="https://chat.whatsapp.com/G9uGLfu3mwCJrvN5KqNDJ7" target="_blank" rel="noreferrer">WhatsApp</a>
				<a href={`${base}/contact/`}>Contact</a>
			</div>
		</div>
	</div>
{/if}

<PagefindUI bind:open={searchOpen} />

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--topbar-h);
		background: rgba(255, 255, 255, 0.86);
		backdrop-filter: saturate(160%) blur(12px);
		-webkit-backdrop-filter: saturate(160%) blur(12px);
		border-bottom: 1px solid transparent;
		transition: border-color var(--dur) ease;
	}

	.site-header.is-scrolled {
		border-bottom-color: var(--line);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		height: 100%;
		max-width: calc(var(--max) + 2 * var(--gutter));
		margin-inline: auto;
		padding-inline: calc(var(--gutter) - 6px) calc(var(--gutter) - 10px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--tap);
		padding-inline: 6px;
		text-decoration: none;
		flex: none;
	}

	.wordmark {
		font-size: 1.0625rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		transition: opacity var(--dur) ease;
	}

	/* Current section replaces the wordmark on phones. */
	.section {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
		flex: 1;
		font-size: var(--fs-small);
		font-weight: 500;
		animation: fade-up var(--dur) var(--ease-out);
	}

	.section-n {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 11px;
		color: var(--pink-ink);
	}

	.section-t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 899px) {
		.wordmark.is-hidden {
			display: none;
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	.links {
		display: none;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-left: auto;
		flex: none;
	}

	.quiet {
		border-color: transparent;
		background: transparent;
	}

	.quiet:hover {
		background: var(--surface);
	}

	@media (min-width: 900px) {
		.links {
			display: flex;
			gap: var(--s-1);
			margin-left: var(--s-5);
		}

		.links a {
			padding: 8px 12px;
			border-radius: var(--r-pill);
			font-size: var(--fs-small);
			font-weight: 500;
			color: var(--ink-2);
			text-decoration: none;
			transition:
				background var(--dur-fast) ease,
				color var(--dur-fast) ease;
		}

		.links a:hover,
		.links a.is-active {
			color: var(--ink);
			background: var(--scrim);
		}

		.section {
			order: 3;
			justify-content: center;
		}

		.menu-btn {
			display: none;
		}
	}

	/* Full-screen menu sheet (phones). */
	.sheet {
		position: fixed;
		inset: var(--topbar-h) 0 0;
		z-index: 49;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--s-5) var(--gutter) calc(var(--s-6) + env(safe-area-inset-bottom));
		background: var(--page);
		overflow-y: auto;
		animation: sheet-in var(--dur) var(--ease-out);
	}

	.sheet nav {
		display: grid;
	}

	.sheet nav a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-block: var(--s-4);
		border-bottom: 1px solid var(--line);
		font-size: 1.75rem;
		font-weight: 500;
		letter-spacing: -0.03em;
		text-decoration: none;
		animation: fade-up var(--dur-slow) var(--ease-out) both;
		animation-delay: calc(var(--i) * 40ms);
	}

	.sheet nav a span {
		font-size: 1.25rem;
		color: var(--ink-3);
	}

	.sheet-foot {
		display: grid;
		gap: var(--s-5);
		padding-top: var(--s-6);
	}

	.sheet-social {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-5);
		font-size: var(--fs-small);
		color: var(--ink-2);
	}

	.sheet-social a {
		text-decoration: none;
	}

	@keyframes sheet-in {
		from {
			opacity: 0;
		}
	}

	@media (min-width: 900px) {
		.sheet {
			display: none;
		}
	}
</style>
