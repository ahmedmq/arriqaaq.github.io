<script lang="ts">
	import { track } from '$lib/analytics';
	let searchTimer: ReturnType<typeof setTimeout> | undefined;
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';

	type Props = { open: boolean };
	let { open = $bindable() }: Props = $props();

	let mountEl: HTMLDivElement | undefined = $state();
	let initialized = false;

	const SCRIPT_SRC = `${base}/pagefind/pagefind-ui.js`;
	const STYLE_HREF = `${base}/pagefind/pagefind-ui.css`;

	function loadScriptOnce(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
			if (existing) {
				if ((existing as any).dataset.loaded === '1') return resolve();
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener('error', () => reject(new Error(`Failed: ${src}`)), { once: true });
				return;
			}
			const s = document.createElement('script');
			s.src = src;
			s.async = true;
			s.onload = () => {
				s.dataset.loaded = '1';
				resolve();
			};
			s.onerror = () => reject(new Error(`Failed: ${src}`));
			document.head.appendChild(s);
		});
	}

	function loadStyleOnce(href: string) {
		if (document.querySelector(`link[href="${href}"]`)) return;
		const l = document.createElement('link');
		l.rel = 'stylesheet';
		l.href = href;
		document.head.appendChild(l);
	}

	function showUnavailableMessage() {
		if (!mountEl) return;
		mountEl.innerHTML =
			'<p style="padding:24px;color:var(--ink-muted);font-size:13px;">Search index is unavailable. Run <code>npm run build</code> and serve the production build (e.g. <code>npm run preview</code>) to enable search.</p>';
	}

	async function init() {
		if (initialized) return;
		await tick(); // wait for {#if open} to mount the dialog so mountEl is bound
		if (!mountEl) return;
		try {
			loadStyleOnce(STYLE_HREF);
			await loadScriptOnce(SCRIPT_SRC);
			const PagefindUI = (window as any).PagefindUI;
			if (typeof PagefindUI !== 'function') {
				showUnavailableMessage();
				initialized = true;
				return;
			}
			new PagefindUI({
				element: mountEl,
				bundlePath: `${base}/pagefind/`,
				showImages: false,
				showSubResults: true,
				resetStyles: false,
				autofocus: true,
				// Analytics: the settled query (after a pause in typing), not each keystroke.
				processTerm: (term: string) => {
					clearTimeout(searchTimer);
					if (term.trim().length > 1)
						searchTimer = setTimeout(() => track('search', { search_term: term.trim().toLowerCase(), search_type: 'site' }), 1200);
					return term;
				}
			});
			mountEl.addEventListener('click', (e) => {
				const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.pagefind-ui__result-link');
				if (a) track('select_content', { content_type: 'search_result', content_id: new URL(a.href, location.href).pathname });
			});
			initialized = true;
			await tick();
			const input = mountEl.querySelector<HTMLInputElement>('input[type="text"]');
			input?.focus();
		} catch (err) {
			console.warn('Pagefind init failed:', err);
			showUnavailableMessage();
			initialized = true;
		}
	}

	$effect(() => {
		if (open) void init();
		else initialized = false;
	});

	function close() {
		open = false;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = true;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});
</script>

{#if open}
	<div class="search-overlay" role="dialog" aria-modal="true">
		<button class="search-overlay-backdrop" aria-label="Close search" onclick={close}></button>
		<div class="search-overlay-panel">
			<button class="search-overlay-close" aria-label="Close" onclick={close}>×</button>
			<div bind:this={mountEl} class="pagefind-mount"></div>
		</div>
	</div>
{/if}

<style>
	/* Phones: full-screen sheet. Desktop: centred card. */
	.search-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: stretch;
		justify-content: center;
	}
	.search-overlay-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(13, 12, 19, 0.32);
		backdrop-filter: blur(4px);
		border: 0;
		padding: 0;
		cursor: pointer;
	}
	.search-overlay-panel {
		position: relative;
		width: 100%;
		height: 100dvh;
		overflow: auto;
		padding: calc(var(--s-7) + env(safe-area-inset-top)) var(--gutter) var(--s-6);
		background: var(--page);
		--pagefind-ui-font: var(--font-sans);
		--pagefind-ui-primary: var(--ink);
		--pagefind-ui-text: var(--ink);
		--pagefind-ui-border: var(--line-strong);
		--pagefind-ui-tag: var(--surface);
		--pagefind-ui-border-radius: 14px;
		--pagefind-ui-border-width: 1px;
	}
	.search-overlay-close {
		position: absolute;
		top: calc(var(--s-2) + env(safe-area-inset-top));
		right: var(--s-3);
		width: var(--tap);
		height: var(--tap);
		border: 0;
		border-radius: 50%;
		background: var(--surface);
		font-size: 24px;
		line-height: 1;
		color: var(--ink);
	}
	@media (min-width: 720px) {
		.search-overlay {
			align-items: flex-start;
			padding-top: 10vh;
		}
		.search-overlay-panel {
			width: min(720px, calc(100vw - 48px));
			height: auto;
			max-height: 76vh;
			padding: var(--s-6);
			border-radius: var(--r-lg);
			box-shadow: var(--shadow-2);
		}
	}
</style>
