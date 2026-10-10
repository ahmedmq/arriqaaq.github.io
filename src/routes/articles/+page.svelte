<script lang="ts">
	// All articles, newest first, with every topic as a filter chip (with its
	// post count) and an instant search over titles and excerpts.
	import { settings, tags } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import Archive from '$lib/components/ui/Archive.svelte';

	let { data } = $props();
	const topics = [...tags].filter((t) => t.post_count > 0).sort((a, b) => b.post_count - a.post_count || a.name.localeCompare(b.name));

	let active = $state<string | null>(null);
	let query = $state('');
	const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
	const shown = $derived.by(() => {
		const q = norm(query.trim());
		return data.posts.filter(
			(p) => (!active || p.tags.includes(active)) && (!q || norm(`${p.title} ${p.custom_excerpt ?? ''}`).includes(q))
		);
	});
</script>

<Seo title={`Articles — ${settings.title}`} description="Every article on Arriqaaq, newest first, by topic." />

<Archive eyebrow="Articles" title="Every article, newest first." posts={shown}>
	{#snippet toolbar()}
		<div class="tools">
			<label class="search">
				<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
				<span class="sr-only">Search articles</span>
				<input type="search" placeholder="Search articles…" bind:value={query} autocomplete="off" />
			</label>
			<div class="topics" role="toolbar" aria-label="Filter by topic">
				<button class="chip" aria-pressed={active === null} onclick={() => (active = null)}>All <span class="n">{data.posts.length}</span></button>
				{#each topics as t (t.id)}
					<button class="chip" aria-pressed={active === t.id} onclick={() => (active = active === t.id ? null : t.id)}>
						{t.name} <span class="n">{t.post_count}</span>
					</button>
				{/each}
			</div>
		</div>
	{/snippet}
</Archive>

<style>
	.tools {
		display: grid;
		gap: var(--s-4);
	}

	.search {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-height: var(--tap);
		padding-inline: var(--s-4);
		border-radius: var(--r-pill);
		box-shadow: inset 0 0 0 1px var(--line-strong);
		background: var(--page);
	}

	.search:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--ink);
	}

	.search svg {
		width: 18px;
		height: 18px;
		flex: none;
		color: var(--ink-3);
	}

	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		font-size: 1rem;
	}

	/* All topics, wrapping (not a horizontal scroller): easy to scan on phones. */
	.topics {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.n {
		font-variant-numeric: tabular-nums;
		opacity: 0.6;
	}
</style>
