<script lang="ts">
	import { onMount } from 'svelte';
	type TocEntry = { id: string; text: string };
	type Props = { entries: TocEntry[] };
	let { entries }: Props = $props();
	let active = $state(0);

	onMount(() => {
		const headings = entries.map((entry) => document.getElementById(entry.id)).filter(Boolean) as HTMLElement[];
		const observer = new IntersectionObserver((records) => {
			const visible = records.filter((record) => record.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
			if (visible[0]) active = Math.max(0, headings.indexOf(visible[0].target as HTMLElement));
		}, { rootMargin: '-18% 0px -68% 0px' });
		headings.forEach((heading) => observer.observe(heading));
		return () => observer.disconnect();
	});

	function go(index: number) {
		const next = Math.min(entries.length - 1, Math.max(0, index));
		document.getElementById(entries[next].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

{#if entries.length}
	<aside class="reading-route" aria-label="Reading route">
		<button onclick={() => go(active - 1)} disabled={active === 0} aria-label="Previous section">←</button>
		<span><small>{active + 1} / {entries.length}</small><strong>{entries[active]?.text}</strong></span>
		<button onclick={() => go(active + 1)} disabled={active === entries.length - 1} aria-label="Next section">→</button>
	</aside>
{/if}
